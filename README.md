# N8N Workflow Replicator

Sistema de replicacion de workflows de n8n a partir de imagenes, transcripciones de video o descripciones textuales.

## Descripcion

Este repositorio contiene:

1. **Base de conocimiento completa** sobre la estructura de workflows de n8n
2. **Sistema de replicacion** que permite generar workflows JSON listos para importar
3. **Templates de ejemplo** para patrones comunes de automatizacion
4. **Workflows de referencia** funcionales para analizar y aprender

## Estructura del Repositorio

```
n8n/
├── docs/
│   ├── N8N-WORKFLOW-STRUCTURE.md    # Referencia completa de estructura JSON
│   └── WORKFLOW-REPLICATOR-GUIDE.md # Guia de uso del sistema
├── templates/
│   ├── webhook-to-sheets-email.json # Template: Webhook + Sheets + Email
│   ├── telegram-bot-basic.json      # Template: Bot de Telegram basico
│   ├── ai-image-analysis.json       # Template: Analisis de imagenes con IA
│   └── scheduled-notifications.json # Template: Notificaciones programadas
├── SETUP-INSTRUCTIONS.md            # Instrucciones de configuracion
├── CLAUDE.md                        # Guia para asistentes IA
└── [workflows de ejemplo]           # Workflows funcionales de referencia
```

## Como Usar

### Replicar un Workflow

1. **Proporciona la fuente:**
   - Imagen/screenshot del workflow
   - Transcripcion de un video explicando el workflow
   - Descripcion textual del flujo deseado

2. **El sistema analiza:**
   - Identifica nodos y tipos
   - Determina conexiones
   - Configura parametros
   - Genera JSON completo

3. **Importa en n8n:**
   - Copia el JSON generado
   - Importa en n8n
   - Configura credenciales
   - Activa el workflow

### Usar Templates

Los templates en `/templates/` son workflows funcionales que puedes:
- Importar directamente en n8n
- Usar como base para personalizacion
- Estudiar para aprender patrones

## Workflows de Ejemplo Incluidos

| Archivo | Descripcion |
|---------|-------------|
| `ASISTENTE DE VENTAS (10).json` | Bot asistente de ventas |
| `clinicaturnos1.json` | Gestion de turnos clinicos |
| `workflow-a-email-receipt-processor.json` | Procesador de recibos por email |
| `workflow-b-telegram-expense-recorder.json` | Bot de Telegram para gastos |
| `workflow-c-review-reminders.json` | Sistema de recordatorios |
| `Quara_*.json` | Workflows de gestion contable |

## Documentacion

### [N8N-WORKFLOW-STRUCTURE.md](docs/N8N-WORKFLOW-STRUCTURE.md)
Referencia completa de:
- Estructura JSON de workflows
- Tipos de nodos y configuraciones
- Conexiones y expresiones
- Patrones comunes

### [WORKFLOW-REPLICATOR-GUIDE.md](docs/WORKFLOW-REPLICATOR-GUIDE.md)
Guia de usuario para:
- Como solicitar replicacion de workflows
- Formatos de entrada soportados
- Mejores practicas
- Resolucion de problemas

## Requisitos para n8n

Para usar los workflows generados necesitas:
- n8n (self-hosted o cloud)
- Credenciales configuradas para los servicios usados
- Acceso a las APIs requeridas (OpenAI, Telegram, Google, etc.)

## Servicios Comunes Soportados

- **Triggers:** Webhook, Schedule, Email IMAP, Telegram
- **Bases de datos:** Supabase, PostgreSQL, MySQL
- **Google:** Sheets, Drive, Docs, Gmail
- **IA:** OpenAI (GPT-4, Vision, Whisper)
- **Mensajeria:** Telegram, Slack, Discord
- **HTTP:** APIs REST, GraphQL

## Contribuir

Para agregar nuevos templates o mejorar la documentacion:
1. Crea un branch desde `main`
2. Agrega tus cambios
3. Documenta el workflow/template
4. Crea un Pull Request

## Recursos

- [Documentacion oficial n8n](https://docs.n8n.io)
- [Comunidad n8n](https://community.n8n.io)
- [Templates oficiales n8n](https://n8n.io/workflows)

---

*Este sistema esta disenado para facilitar la creacion y replicacion de workflows de n8n de manera eficiente y precisa.*
