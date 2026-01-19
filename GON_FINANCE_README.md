# PRODUCT REQUIREMENTS DOCUMENT

## Gon Finance
### Asistente Financiero Personal para Telegram

**Version 2.0 - Migracion a Claude Code**
**Fecha: Enero 2026**

---

## 1. Resumen Ejecutivo

Gon Finance es un asistente financiero personal que permite a los usuarios registrar y gestionar sus gastos de forma automatizada a traves de Telegram. El usuario puede enviar comprobantes (PDF, imagenes) o mensajes de voz/texto describiendo un gasto, y el sistema extrae automaticamente la informacion relevante, la categoriza y la registra en una hoja de calculo de Google Sheets.

Este PRD documenta la migracion del sistema actual (construido en Make.com) a una aplicacion nativa desarrollada con Claude Code, mejorando la escalabilidad, reduciendo costos operativos y anadiendo nuevas funcionalidades.

---

## 2. Problema y Solucion

### 2.1 Problema Identificado

- Registrar gastos manualmente es tedioso y propenso a errores
- Los usuarios olvidan categorizar correctamente sus gastos
- La informacion de comprobantes esta dispersa (emails, fotos, PDFs)
- Falta de visibilidad consolidada del estado financiero personal

### 2.2 Solucion Propuesta

Un bot de Telegram que actua como asistente financiero inteligente, capaz de procesar multiples formatos de entrada (PDF, imagenes, audio, texto) y extraer automaticamente datos financieros mediante IA, registrandolos en Google Sheets con categorizacion automatica.

---

## 3. Usuarios Objetivo

### 3.1 Perfil Principal

- Profesionales independientes y freelancers que necesitan llevar control de gastos
- Personas que desean mejorar sus finanzas personales sin apps complicadas
- Usuarios de Telegram que prefieren una interfaz conversacional

### 3.2 Casos de Uso Principales

| Caso de Uso | Descripcion |
|-------------|-------------|
| Registro de comprobante | Usuario envia foto/PDF de factura -> Sistema extrae y registra datos |
| Gasto por voz | Usuario dicta gasto -> Sistema transcribe, extrae datos y registra |
| Gasto por texto | Usuario escribe descripcion -> Sistema parsea y registra |
| Consulta de resumen | Usuario solicita resumen -> Sistema genera informe de gastos |
| Backup de comprobantes | Sistema almacena PDFs originales en Google Drive |

---

## 4. Funcionalidades del Sistema

### 4.1 Funcionalidades Principales (MVP)

#### F1: Procesamiento de PDFs
- Recibir archivos PDF via Telegram
- Convertir PDF a imagen para analisis con Vision AI
- Extraer: fecha, comercio, concepto, importe, ID transaccion
- Categorizar automaticamente el gasto

#### F2: Procesamiento de Imagenes
- Recibir fotos de tickets/facturas via Telegram
- Analisis directo con Vision AI (Claude o GPT-4 Vision)
- Extraccion y registro identico a PDFs

#### F3: Procesamiento de Audio
- Recibir mensajes de voz de Telegram
- Transcribir audio a texto (Whisper API)
- Parsear informacion financiera del texto transcrito

#### F4: Procesamiento de Texto
- Recibir mensajes de texto describiendo gastos
- Extraer datos estructurados mediante LLM
- Formato flexible: "Gaste 500 en uber" o descripcion detallada

#### F5: Registro en Google Sheets
- Conexion autenticada con Google Sheets API
- Insertar fila con: Fecha, Servicio/Comercio, Concepto, Importe, ID, Categoria, Tipo, Origen
- Formato de numeros: coma decimal, punto para miles (Argentina)

#### F6: Backup de Comprobantes
- Subir PDFs/imagenes originales a Google Drive
- Organizacion por carpetas (fecha/categoria)

#### F7: Notificaciones
- Confirmar registro exitoso via Telegram
- Notificar errores de procesamiento
- Email de confirmacion con resumen del gasto (opcional)

### 4.2 Funcionalidades Secundarias (Post-MVP)

- Comando `/resumen`: Generar informe de gastos por periodo
- Comando `/categorias`: Ver desglose por categoria
- Comando `/editar`: Modificar ultimo registro
- Alertas de presupuesto: Notificar cuando se acerque al limite
- Dashboard web: Visualizacion de gastos

---

## 5. Arquitectura Tecnica

### 5.1 Stack Tecnologico Propuesto

| Componente | Tecnologia |
|------------|------------|
| Lenguaje | TypeScript/Node.js |
| Framework Bot | grammy.js (Telegram Bot Framework) |
| IA - Vision | Claude API (claude-3-sonnet) o GPT-4 Vision |
| IA - Audio | OpenAI Whisper API |
| IA - Texto | Claude API para structured output |
| Base de Datos | PostgreSQL (Supabase) o SQLite para MVP |
| Almacenamiento | Google Drive API |
| Hojas de Calculo | Google Sheets API |
| Email | Resend o Gmail API (opcional) |
| Hosting | Railway, Render, o VPS (DigitalOcean) |
| CI/CD | GitHub Actions |

### 5.2 Diagrama de Flujo Principal

El siguiente flujo describe el procesamiento de un comprobante:

1. Usuario envia mensaje a bot de Telegram (PDF/imagen/audio/texto)
2. Bot detecta tipo de mensaje y rutea al procesador correspondiente
3. Procesador extrae datos usando IA (Vision/Whisper/LLM)
4. Sistema valida y normaliza datos extraidos
5. Datos se registran en Google Sheets
6. Archivo original se sube a Google Drive (si aplica)
7. Bot confirma registro exitoso al usuario

### 5.3 Modelo de Datos

#### Estructura de Gasto (Google Sheets)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| FECHA DEL COBRO | Date | Fecha del comprobante (DD/MM/YYYY) |
| SERVICIO / COMERCIO | String | Nombre del comercio o empresa |
| CONCEPTO | String | Descripcion del producto/servicio |
| IMPORTE | Number | Monto total (formato: 1.250,50) |
| ID DE TRANSACCION | String | Numero de referencia o pedido |
| CATEGORIA | Enum | Categoria asignada (ver lista) |
| TIPO DE GASTO | Enum | Unico o Recurrente |
| ORIGEN DEL COBRO | String | De [nombre] en Telegram |

#### Categorias Disponibles

- Vivienda
- Alimentacion
- Transporte
- Salud y Bienestar
- Viajes
- Suscripciones
- Educacion
- Entretenimiento y Ocio
- Compras Personales / Ropa
- Deudas y Prestamos
- Miscelaneos
- AI Tools
- Servicios
- Impuestos
- Cafe
- Tarjeta
- Ingresos

---

## 6. Autenticacion y Seguridad

### 6.1 Autenticacion de Usuario
- MVP: Lista blanca de Telegram Chat IDs autorizados
- Futuro: Sistema de registro con codigo de invitacion o suscripcion

### 6.2 Autenticacion de Servicios
- Google APIs: OAuth 2.0 con Service Account o credenciales de usuario
- Telegram Bot API: Token de bot (BotFather)
- APIs de IA: API Keys almacenadas en variables de entorno

### 6.3 Medidas de Seguridad
- Variables de entorno para secretos (nunca en codigo)
- HTTPS para todas las comunicaciones
- Validacion de entrada para prevenir inyeccion
- Rate limiting para prevenir abuso
- Logs de auditoria para acciones sensibles

---

## 7. Despliegue e Infraestructura

### 7.1 Opcion Recomendada: Railway
- Deploy directo desde GitHub
- PostgreSQL incluido
- Variables de entorno gestionadas
- Escalado automatico

### 7.2 Alternativas
- **Render**: Similar a Railway, tier gratuito disponible
- **DigitalOcean Droplet**: Mayor control, requiere mas configuracion
- **AWS Lambda + API Gateway**: Serverless, pago por uso

### 7.3 Requisitos de Infraestructura
- Node.js 18+ runtime
- 512MB RAM minimo (1GB recomendado)
- Acceso a internet saliente para APIs
- Webhook URL publica para Telegram (o polling)

---

## 8. Estimacion de Costos Operativos

| Servicio | Costo Estimado (USD/mes) |
|----------|--------------------------|
| Railway (Hosting) | $5-20 |
| Claude API (Vision + Text) | $10-30 (segun uso) |
| OpenAI Whisper API | $5-15 (segun uso) |
| Google APIs | Gratis (cuota generosa) |
| Dominio (opcional) | $1-2 |
| **TOTAL ESTIMADO** | **$21-67/mes** |

**Nota**: Los costos de APIs de IA varian segun volumen de uso. Para un usuario individual procesando ~100 gastos/mes, el costo de IA seria aproximadamente $5-10.

---

## 9. Criterios de Exito y KPIs

### 9.1 Metricas Tecnicas
- Precision de extraccion: >95% de datos correctos
- Tiempo de respuesta: <10 segundos por procesamiento
- Uptime: >99.5%

### 9.2 Metricas de Producto
- Gastos registrados por semana (crecimiento)
- Tasa de error (mensajes que requieren correccion manual)
- Satisfaccion del usuario (feedback directo)

---

## 10. Roadmap de Desarrollo

### Fase 1: MVP (Semanas 1-2)
- Configurar proyecto Node.js/TypeScript
- Implementar bot basico con grammy.js
- Integrar procesamiento de imagenes con Vision AI
- Conectar con Google Sheets API
- Deploy inicial en Railway

### Fase 2: Completar Funcionalidades (Semanas 3-4)
- Anadir procesamiento de PDFs
- Implementar transcripcion de audio
- Anadir procesamiento de texto
- Integrar backup a Google Drive

### Fase 3: Mejoras (Semanas 5-6)
- Comando /resumen
- Notificaciones por email
- Manejo de errores robusto
- Tests automatizados

---

## 11. Estructura de Proyecto Sugerida

```
gon-finance/
├── src/
│   ├── index.ts              # Entrada principal
│   ├── bot/
│   │   ├── bot.ts            # Configuracion del bot
│   │   └── handlers/         # Manejadores de mensajes
│   ├── processors/
│   │   ├── image.ts          # Procesador de imagenes
│   │   ├── pdf.ts            # Procesador de PDFs
│   │   ├── audio.ts          # Procesador de audio
│   │   └── text.ts           # Procesador de texto
│   ├── services/
│   │   ├── ai.ts             # Cliente de IA (Claude/OpenAI)
│   │   ├── sheets.ts         # Google Sheets API
│   │   └── drive.ts          # Google Drive API
│   ├── types/
│   │   └── expense.ts        # Tipos de datos
│   └── utils/
│       └── format.ts         # Utilidades de formato
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 12. Variables de Entorno Requeridas

| Variable | Descripcion |
|----------|-------------|
| TELEGRAM_BOT_TOKEN | Token del bot de Telegram |
| ALLOWED_CHAT_IDS | Lista de Chat IDs autorizados |
| ANTHROPIC_API_KEY | API Key de Claude |
| OPENAI_API_KEY | API Key de OpenAI (para Whisper) |
| GOOGLE_SERVICE_ACCOUNT | Credenciales de Google (JSON) |
| SPREADSHEET_ID | ID de la hoja de Google Sheets |
| DRIVE_FOLDER_ID | ID de carpeta de Google Drive |
| EMAIL_RECIPIENT | Email para notificaciones (opcional) |

---

**— Fin del Documento —**
