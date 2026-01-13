# n8n - Asistente de Ventas Inmobiliarias con IA

## Descripción General

Este workflow de n8n implementa un asistente de ventas inmobiliarias inteligente con las siguientes capacidades:

- **Buffering de mensajes** con Redis para manejar mensajes fragmentados
- **Procesamiento con IA** (GPT-4o / Claude 3.5 Sonnet) con memoria de conversación
- **Calificación automática de leads** con sistema de puntuación por estrellas
- **Despacho de acciones** según el nivel de interés del cliente
- **Manejo robusto de errores** y logging centralizado

---

## Arquitectura del Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASE 1: RECEPCIÓN                                  │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────┐      │
│  │ Webhook  │───▶│ Redis Push  │───▶│ Check Flag   │───▶│ Wait 7-10s │      │
│  │  (POST)  │    │  (Lista)    │    │ (Procesando) │    │            │      │
│  └──────────┘    └─────────────┘    └──────────────┘    └────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASE 2: PROCESAMIENTO IA                           │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐                 │
│  │ Concatenar  │───▶│  AI Agent    │───▶│ PostgreSQL      │                 │
│  │  Mensajes   │    │ (GPT-4o)     │    │ (Chat Memory)   │                 │
│  └─────────────┘    └──────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FASE 3: CALIFICACIÓN Y DESPACHO                         │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐                 │
│  │ LLM Classify│───▶│   Switch     │───▶│ Acciones:       │                 │
│  │ (1-5 ⭐)    │    │  (Rating)    │    │ - Slack/Email   │                 │
│  └─────────────┘    └──────────────┘    │ - Brochure      │                 │
│                                         │ - Google Sheets │                 │
│                                         └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

### Servicios Externos

| Servicio | Propósito | Requerido |
|----------|-----------|-----------|
| **Redis** | Buffering de mensajes y flags de procesamiento | ✅ Sí |
| **PostgreSQL** | Memoria de chat y almacenamiento de conversaciones | ✅ Sí |
| **OpenAI / Anthropic** | Procesamiento de lenguaje natural (GPT-4o o Claude) | ✅ Sí |
| **Google Sheets** | Logging y seguimiento de leads | ✅ Sí |
| **Gmail** | Envío de brochures y notificaciones | ✅ Sí |
| **Slack** | Alertas para leads calientes (5 estrellas) | ⚪ Opcional |

### Credenciales Necesarias en n8n

1. **Redis** - Host, puerto, contraseña (si aplica)
2. **PostgreSQL** - Host, puerto, base de datos, usuario, contraseña
3. **OpenAI API** - API Key con acceso a GPT-4o
4. **Google Sheets** - OAuth2 o Service Account
5. **Gmail** - OAuth2 credentials
6. **Slack** - Bot Token (opcional)

---

## Fase 1: Webhook y Buffering de Mensajes

### 1.1 Nodo Webhook

**Configuración:**
- **Método HTTP:** POST
- **Path:** `/real-estate-assistant` (personalizable)
- **Autenticación:** Header Auth recomendado para producción

**Estructura del Payload Esperado:**

```json
{
  "userId": "5491112345678",
  "messageBody": "Hola, me interesa el departamento de 3 ambientes",
  "timestamp": "2025-01-13T10:30:00Z"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | string | Identificador único del usuario (teléfono o ID) |
| `messageBody` | string | Contenido del mensaje del usuario |
| `timestamp` | string | Fecha/hora del mensaje en formato ISO 8601 |

### 1.2 Redis - Agregar a Lista

**Propósito:** Almacenar mensajes entrantes para agregación.

**Configuración del Nodo:**
- **Operación:** Push
- **Key:** `messages:{{$json.userId}}`
- **Value:** `{{$json.messageBody}}`
- **Direction:** Right (RPUSH)

**Ejemplo de Key:** `messages:5491112345678`

### 1.3 Verificar Flag de Procesamiento

**Propósito:** Evitar procesamiento duplicado cuando llegan múltiples mensajes.

**Configuración del Nodo Redis:**
- **Operación:** Get
- **Key:** `processing:{{$json.userId}}`

**Lógica del Nodo IF:**
```javascript
// Si el flag existe, terminar ejecución
// Si no existe, continuar al paso siguiente
{{ $json.value !== null }}
```

### 1.4 Establecer Flag de Procesamiento

**Configuración del Nodo Redis:**
- **Operación:** Set
- **Key:** `processing:{{$json.userId}}`
- **Value:** `true`
- **TTL:** 60 segundos (fallback de seguridad)

### 1.5 Nodo Wait (Debouncing)

**Propósito:** Permitir que el usuario termine de escribir antes de procesar.

**Configuración:**
- **Resume:** After Time Interval
- **Wait Amount:** 7-10 segundos (recomendado: 8 segundos)

> **Nota:** Este tiempo puede ajustarse según el comportamiento típico de los usuarios.

### 1.6 Redis - Obtener Lista Completa

**Configuración del Nodo Redis:**
- **Operación:** Get List (LRANGE)
- **Key:** `messages:{{$json.userId}}`
- **Start:** 0
- **Stop:** -1 (todos los elementos)

### 1.7 Concatenar Mensajes

**Nodo Code/Function:**

```javascript
// Concatenar todos los mensajes en uno solo
const messages = $input.all();
const userId = messages[0].json.userId;

// Obtener la lista de mensajes de Redis
const messageList = messages[0].json.value; // Array de strings

// Concatenar con punto y espacio
const concatenatedMessage = Array.isArray(messageList)
  ? messageList.join('. ')
  : messageList;

return [{
  json: {
    userId: userId,
    fullMessage: concatenatedMessage,
    messageCount: Array.isArray(messageList) ? messageList.length : 1,
    timestamp: new Date().toISOString()
  }
}];
```

### 1.8 Redis - Limpiar (Cleanup)

**Ejecutar dos operaciones Redis:**

1. **Eliminar Lista de Mensajes:**
   - Operación: Delete
   - Key: `messages:{{$json.userId}}`

2. **Eliminar Flag de Procesamiento:**
   - Operación: Delete
   - Key: `processing:{{$json.userId}}`

---

## Fase 2: Núcleo de IA

### 2.1 Configuración del AI Agent

**Nodo:** AI Agent / LangChain Agent

**Modelo Recomendado:**
- **Principal:** OpenAI GPT-4o
- **Alternativa:** Anthropic Claude 3.5 Sonnet

**Conexiones:**
- **Input:** Mensaje concatenado del usuario
- **Memory:** PostgreSQL Chat Memory
- **Tools:** (Opcional) Herramientas personalizadas

### 2.2 System Prompt

```text
Sos un asistente experto en ventas inmobiliarias para una agencia en Argentina.

## Tu Rol:
- Responder consultas sobre propiedades disponibles
- Verificar disponibilidad de inmuebles
- Guiar al usuario hacia la programación de una visita
- Proporcionar información sobre precios, ubicaciones y características

## Tono y Estilo:
- Profesional pero cercano
- Usá el voseo argentino (vos, tenés, podés)
- Sé conciso pero completo en tus respuestas
- Mostrá entusiasmo genuino por ayudar

## Restricciones:
- NO respondas preguntas que no estén relacionadas con inmuebles o servicios de la agencia
- Si te preguntan algo fuera de tema, redirigí amablemente la conversación
- Si el usuario solicita un brochure o más información, indicá que se lo vas a enviar

## Información de Propiedades Disponibles:
[Insertar aquí el catálogo de propiedades o conectar con base de datos]

## Ejemplos de Respuestas:

Usuario: "Hola, busco un depto de 2 ambientes en Palermo"
Asistente: "¡Hola! Qué bueno que nos contactás. Tenemos varias opciones de 2 ambientes en Palermo. ¿Tenés algún presupuesto en mente o preferencia de metros cuadrados?"

Usuario: "¿Cuál es el pronóstico del tiempo?"
Asistente: "Entiendo tu curiosidad, pero mi especialidad es ayudarte a encontrar tu próximo hogar. ¿Hay algo sobre propiedades en lo que pueda asistirte?"
```

### 2.3 PostgreSQL Chat Memory

**Configuración de la Tabla:**

```sql
CREATE TABLE chat_memory (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'human' o 'ai'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_chat_memory_session ON chat_memory(session_id);
CREATE INDEX idx_chat_memory_created ON chat_memory(created_at);
```

**Configuración del Nodo:**
- **Session ID Field:** `{{$json.userId}}`
- **Table Name:** `chat_memory`
- **Context Window:** Últimos 10-20 mensajes (ajustable)

---

## Fase 3: Calificación de Leads y Despacho de Acciones

### 3.1 LLM Classify (Clasificación Secundaria)

**Propósito:** Analizar la conversación y asignar puntuación de lead.

**System Prompt para Clasificación:**

```text
Analizá la siguiente conversación entre un asistente inmobiliario y un potencial cliente.
Tu tarea es clasificar al lead según su nivel de interés.

## Sistema de Puntuación (1-5 Estrellas):

⭐ (1 Estrella) - Lead Frío:
- No responde a preguntas sobre precio
- Conversación abandonada
- Respuestas muy cortas sin engagement

⭐⭐ (2 Estrellas) - Lead Tibio Bajo:
- Preguntas muy generales
- Sin urgencia aparente
- Solo curiosidad inicial

⭐⭐⭐ (3 Estrellas) - Lead Tibio:
- Preguntas sobre financiación
- Interés en características específicas
- Comparando opciones

⭐⭐⭐⭐ (4 Estrellas) - Lead Caliente:
- Preguntas detalladas sobre disponibilidad
- Menciona timeframe para mudarse
- Solicita información adicional/brochure

⭐⭐⭐⭐⭐ (5 Estrellas) - Lead Muy Caliente:
- Expresa interés explícito en visitar
- Quiere comprar/alquilar inmediatamente
- Pregunta por proceso de reserva

## Output Requerido:
Respondé ÚNICAMENTE con un JSON en este formato:
{
  "rating": <número del 1 al 5>,
  "intent": "<brochure_request|visit_request|general_inquiry|cold|hot>",
  "summary": "<resumen de 1-2 oraciones del interés del cliente>",
  "next_action": "<acción recomendada>"
}
```

**Input al Nodo:**
```javascript
{{ JSON.stringify({
  conversation: $json.conversationHistory,
  lastMessage: $json.fullMessage,
  aiResponse: $json.aiResponse
}) }}
```

### 3.2 Nodo Switch (Routing por Rating)

**Configuración de Rutas:**

| Condición | Ruta | Acción |
|-----------|------|--------|
| `rating === 5` | Hot Lead | Notificación inmediata a ventas |
| `intent === "brochure_request"` | Brochure | Enviar PDF por email |
| `rating >= 3` | Warm Lead | Log en Google Sheets + seguimiento |
| `rating < 3` | Cold Lead | Solo log en Google Sheets |

**Expresiones del Switch:**

```javascript
// Ruta 1: Hot Lead (5 estrellas)
{{ $json.classification.rating === 5 }}

// Ruta 2: Solicitud de Brochure
{{ $json.classification.intent === "brochure_request" }}

// Ruta 3: Lead Tibio (3-4 estrellas)
{{ $json.classification.rating >= 3 && $json.classification.rating < 5 }}

// Ruta 4: Lead Frío (default)
{{ $json.classification.rating < 3 }}
```

### 3.3 Acciones por Ruta

#### Ruta Hot Lead (5 Estrellas)

**Nodo Slack:**
```json
{
  "channel": "#ventas-urgente",
  "text": "🔥 *LEAD CALIENTE - LLAMAR AHORA*\n\n*Usuario:* {{$json.userId}}\n*Resumen:* {{$json.classification.summary}}\n*Última interacción:* {{$json.timestamp}}"
}
```

**Nodo Email (Alternativa):**
- **To:** ventas@tuagencia.com
- **Subject:** 🔥 Lead Caliente - Acción Inmediata Requerida
- **Prioridad:** Alta

#### Ruta Brochure Request

**Nodo Gmail:**
- **To:** `{{$json.userEmail}}` (requiere capturar email en conversación)
- **Subject:** Tu Brochure de Propiedades - [Nombre Agencia]
- **Attachments:** PDF del brochure
- **Body:**
```html
<p>¡Hola!</p>
<p>Tal como lo solicitaste, te adjunto el brochure con información detallada de nuestras propiedades.</p>
<p>Si tenés alguna consulta o querés coordinar una visita, no dudes en escribirnos.</p>
<p>¡Saludos!</p>
```

#### Ruta General (Todos los Leads)

**Nodo Google Sheets:**
- **Operation:** Append Row
- **Spreadsheet:** Lead Tracking
- **Sheet:** Leads 2025

**Datos a Insertar:**

| Columna | Valor |
|---------|-------|
| Timestamp | `{{$now}}` |
| User ID | `{{$json.userId}}` |
| Last Message | `{{$json.fullMessage}}` |
| AI Response | `{{$json.aiResponse}}` |
| Lead Score | `{{$json.classification.rating}}` |
| Intent | `{{$json.classification.intent}}` |
| Summary | `{{$json.classification.summary}}` |
| Status | `{{$json.classification.next_action}}` |

---

## Fase 4: Manejo de Errores

### 4.1 Error Trigger Node

**Configuración:**
- Activar para todos los nodos del workflow
- Capturar: Mensaje de error, nodo que falló, datos de entrada

### 4.2 Acciones de Error

**Nodo Email de Alerta:**
```
To: admin@tuagencia.com
Subject: ⚠️ Error en Workflow Asistente Inmobiliario
Body:
  Error: {{$json.error.message}}
  Nodo: {{$json.error.node}}
  Timestamp: {{$now}}
  User ID: {{$json.userId}}

  Datos de entrada:
  {{JSON.stringify($json, null, 2)}}
```

**Nodo Google Sheets (Log de Errores):**
- Spreadsheet: Error Logs
- Registrar: timestamp, tipo de error, nodo, userId, stack trace

### 4.3 Errores Comunes y Soluciones

| Error | Causa Probable | Solución |
|-------|----------------|----------|
| Redis connection refused | Redis no disponible | Verificar servicio Redis, revisar credenciales |
| OpenAI rate limit | Demasiadas solicitudes | Implementar retry con backoff exponencial |
| PostgreSQL connection timeout | DB sobrecargada | Aumentar pool de conexiones |
| Webhook timeout | Procesamiento muy lento | Optimizar queries, reducir wait time |

---

## Configuración de Infraestructura

### Redis

**Docker Compose:**
```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

**Variables de Entorno:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_seguro
```

### PostgreSQL

**Docker Compose:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: n8n_chat
      POSTGRES_USER: n8n_user
      POSTGRES_PASSWORD: tu_password_seguro
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Inicialización de Tablas:**
```sql
-- Crear base de datos y tablas
CREATE DATABASE n8n_chat;

\c n8n_chat

-- Tabla de memoria de chat
CREATE TABLE chat_memory (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Índices para performance
CREATE INDEX idx_session ON chat_memory(session_id);
CREATE INDEX idx_created ON chat_memory(created_at DESC);

-- Tabla de leads (opcional, complementa Google Sheets)
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new',
    first_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    metadata JSONB
);
```

---

## Integración con WhatsApp

### Opción 1: WhatsApp Business API (Oficial)

**Configuración del Webhook:**
1. Configurar webhook en Meta Business Suite
2. Verificar endpoint con challenge token
3. Mapear campos del payload de WhatsApp:

```javascript
// Transformar payload de WhatsApp al formato esperado
const whatsappPayload = $input.first().json;
const message = whatsappPayload.entry[0].changes[0].value.messages[0];

return [{
  json: {
    userId: message.from,  // Número de teléfono
    messageBody: message.text.body,
    timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString()
  }
}];
```

### Opción 2: Twilio

**Configuración:**
- Webhook URL en Twilio Console
- Mapeo de campos:
  - `From` → `userId`
  - `Body` → `messageBody`

### Opción 3: Chatwoot / Otras Plataformas

Adaptar el nodo de transformación según la estructura del payload de cada plataforma.

---

## Testing y Debugging

### Test Manual del Webhook

**cURL:**
```bash
curl -X POST https://tu-n8n-instance.com/webhook/real-estate-assistant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token" \
  -d '{
    "userId": "5491112345678",
    "messageBody": "Hola, busco un departamento de 2 ambientes en Palermo",
    "timestamp": "2025-01-13T10:30:00Z"
  }'
```

### Simular Mensajes Fragmentados

```bash
# Mensaje 1
curl -X POST ... -d '{"userId": "test123", "messageBody": "Hola", "timestamp": "..."}'

# Mensaje 2 (enviar dentro de 5 segundos)
curl -X POST ... -d '{"userId": "test123", "messageBody": "me interesa", "timestamp": "..."}'

# Mensaje 3 (enviar dentro de 5 segundos)
curl -X POST ... -d '{"userId": "test123", "messageBody": "un depto en Recoleta", "timestamp": "..."}'

# El sistema debería concatenar: "Hola. me interesa. un depto en Recoleta"
```

### Verificar Estado de Redis

```bash
# Conectar a Redis CLI
redis-cli

# Ver mensajes pendientes para un usuario
LRANGE messages:5491112345678 0 -1

# Ver si hay flag de procesamiento
GET processing:5491112345678

# Listar todas las keys activas
KEYS *
```

### Verificar Chat Memory

```sql
-- Ver últimas conversaciones
SELECT * FROM chat_memory
WHERE session_id = '5491112345678'
ORDER BY created_at DESC
LIMIT 20;

-- Contar mensajes por usuario
SELECT session_id, COUNT(*) as total_messages
FROM chat_memory
GROUP BY session_id
ORDER BY total_messages DESC;
```

---

## Optimización y Performance

### Recomendaciones

1. **Timeout del Wait Node:**
   - Producción: 7-10 segundos
   - Testing: 3-5 segundos
   - Ajustar según comportamiento real de usuarios

2. **TTL de Redis:**
   - Flag de procesamiento: 60 segundos (previene deadlocks)
   - Lista de mensajes: Sin TTL (se limpia manualmente)

3. **Límite de Contexto del Chat:**
   - Recomendado: 10-20 mensajes
   - Máximo: 50 mensajes (considerar costos de tokens)

4. **Rate Limiting:**
   - Implementar límite por userId para prevenir spam
   - Sugerido: 10 mensajes por minuto por usuario

### Monitoreo

**Métricas Clave:**
- Tiempo promedio de respuesta
- Tasa de errores por nodo
- Distribución de lead scores
- Mensajes procesados por hora

---

## Seguridad

### Checklist

- [ ] Autenticación en webhook (Header Auth o API Key)
- [ ] Credenciales en variables de entorno (no hardcodeadas)
- [ ] HTTPS obligatorio en producción
- [ ] Rate limiting implementado
- [ ] Logs sin datos sensibles (PII)
- [ ] Backup regular de PostgreSQL
- [ ] Redis con contraseña en producción

### Sanitización de Datos

```javascript
// Ejemplo: Limpiar input del usuario
const sanitizedMessage = $json.messageBody
  .replace(/<[^>]*>/g, '')  // Remover HTML
  .replace(/javascript:/gi, '')  // Prevenir XSS
  .trim()
  .substring(0, 1000);  // Limitar longitud
```

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-01-13 | Versión inicial del workflow |

---

## Soporte

Para consultas técnicas o reportar issues:
- Crear issue en este repositorio
- Documentación n8n: https://docs.n8n.io/
- Comunidad n8n: https://community.n8n.io/

---

## Licencia

Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.
