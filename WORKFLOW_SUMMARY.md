# N8N Workflows Summary

> **Generated:** 2026-02-05
> **Repository:** gonzaloin11/n8n

---

## Table of Contents

1. [Real Estate AI Agent Workflow](#1-real-estate-ai-agent-workflow)
2. [Workflow Architecture](#2-workflow-architecture)
3. [Node Configurations](#3-node-configurations)
4. [Data Flow](#4-data-flow)
5. [Error Handling](#5-error-handling)
6. [Integration Points](#6-integration-points)

---

# 1. Real Estate AI Agent Workflow

## Overview

| Property | Value |
|----------|-------|
| **Name** | Real Estate AI Agent |
| **ID** | Jzy1vEFUT3oQKZtp |
| **Status** | Active |
| **Version** | n8n 2.0.3 (Self Hosted) |
| **Purpose** | Telegram bot for real estate inquiries and visit scheduling |

## Business Logic

This workflow implements an AI-powered real estate assistant that:

1. **Receives messages** from Telegram (text or voice)
2. **Classifies intent** using GPT-4o (Sales, Scheduling, or Unclear)
3. **Routes to specialized agents** based on classification
4. **Searches properties** in Airtable database
5. **Schedules visits** via Google Calendar
6. **Sends confirmations** via Gmail
7. **Responds** back to user on Telegram

---

# 2. Workflow Architecture

## High-Level Flow

```
┌─────────────────┐
│ Telegram Trigger│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Route Input Type│ ──► Audio ──► Transcribe ──► Edit Fields1
└────────┬────────┘
         │ Text
         ▼
┌─────────────────┐
│  Edit Fields2   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Extract User Data│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Buffer      │ (Redis - message aggregation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get buffer data│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Switch      │ ──► Ignore / Continue / Wait
└────────┬────────┘
         │ Continue
         ▼
┌─────────────────┐
│  Delete buffer  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Edit Fields   │ (Concatenate messages)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Router Classifier│ (GPT-4o)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Switch   │
└────────┬────────┘
    ┌────┼────┬────────┐
    │    │    │        │
    ▼    ▼    ▼        ▼
 SALES SCHED UNCLEAR FALLBACK
    │    │    │        │
    ▼    ▼    ▼        │
┌──────┐┌──────┐┌──────┐│
│Sales ││Sched.││Conver││
│Agent ││Agent ││Agent │◄┘
└──┬───┘└──┬───┘└──┬───┘
   │       │       │
   ▼       ▼       ▼
┌──────┐┌──────┐┌──────┐
│Parse ││Prepare││Send  │
│Props ││Resp.  ││Text  │
└──┬───┘└──┬───┘└──────┘
   │       │
   ▼       ▼
┌──────┐┌──────┐
│Route ││Send  │
│MsgTyp││Telegr│
└──┬───┘└──────┘
   │
   ├───────────┐
   ▼           ▼
┌──────┐    ┌──────┐
│Send  │    │Send  │
│Photo │    │Text  │
└──────┘    └──────┘
```

## Node Count by Category

| Category | Count | Nodes |
|----------|-------|-------|
| Triggers | 2 | Telegram Trigger, Chat Trigger |
| AI Agents | 4 | Router Classifier, Sales Agent, Scheduling Agent, Conversation Agent |
| AI Models | 4 | Router Model, Sales Model, Scheduling Model, OpenAI Chat Model |
| Memory | 4 | Sales Memory, Scheduling Memory, Postgres Chat Memory, Postgres Chat Memory1 |
| Data Transform | 6 | Extract User Data, Edit Fields, Edit Fields1, Edit Fields2, Prepare Response, Parse Properties |
| Routing | 4 | Route Input Type, Switch, Route Switch, Route Message Type |
| External Services | 8 | Telegram (4), Redis (3), Airtable, Google Calendar (2), Gmail, Supabase |
| Utilities | 3 | Wait, No Operation, Buffer |

**Total Nodes:** 35+

---

# 3. Node Configurations

## 3.1 Telegram Trigger

```json
{
  "type": "n8n-nodes-base.telegramTrigger",
  "typeVersion": 1.1,
  "parameters": {
    "updates": ["message"]
  },
  "credentials": "Telegram account 2"
}
```

**Purpose:** Listens for incoming Telegram messages

---

## 3.2 Router Classifier (AI Agent)

```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "parameters": {
    "promptType": "define",
    "text": "Clasifica este mensaje en UNA categoría: SALES | SCHEDULING | UNCLEAR",
    "options": {
      "systemMessage": "Eres un clasificador de intenciones para una agencia inmobiliaria..."
    }
  }
}
```

**Classification Rules:**

| Category | Triggers |
|----------|----------|
| **SALES** | Property search, prices, locations, features, "más información" |
| **SCHEDULING** | Visit scheduling, availability, dates/times, confirmations |
| **UNCLEAR** | Simple greetings, vague messages, no property context |

**Connected Components:**
- Model: GPT-4o (temperature: 0)
- Memory: Postgres Chat Memory (15 message context window)

---

## 3.3 Sales Agent

```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "parameters": {
    "promptType": "define",
    "options": {
      "systemMessage": "Eres un experto agente inmobiliario argentino...",
      "maxIterations": 10
    }
  }
}
```

**Tools Available:**
1. **Airtable Search** - Property database queries
2. **Property Knowledge Base** - Supabase vector store for detailed info

**Response Format:**
```
---PROPERTY_START---
NAME: [Property name]
ADDRESS: [Full address]
PRICE: [Price with $]
ROOMS: [Number]
BATHROOMS: [Number]
SURFACE: [Area in m²]
DESCRIPTION: [1-2 lines]
IMAGE: [URL or "none"]
---PROPERTY_END---
```

**Airtable Query Syntax:**
```
AND({Ciudad} = 'Chascomús', {Operación} = 'alquiler', {Habitaciones} >= 2)
```

---

## 3.4 Scheduling Agent

```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "parameters": {
    "options": {
      "systemMessage": "Eres un asistente profesional de agendamiento...",
      "maxIterations": 15
    }
  }
}
```

**Tools Available:**
1. **Google Calendar - Check** - Query availability
2. **Create an event in Google Calendar** - Book visits
3. **Gmail - Confirmar visita** - Send confirmation emails

**Scheduling Flow:**
1. Identify property from context
2. Check calendar availability (next 3-5 days)
3. Offer 3 available time slots
4. Collect client data (name, email, phone)
5. Confirm details with client
6. Create calendar event
7. Send confirmation email

**Available Time Slots:** 10:00, 12:00, 16:00, 18:00 (Mon-Sat)

---

## 3.5 Conversation Agent

```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 3,
  "parameters": {
    "promptType": "define",
    "options": {
      "systemMessage": "Eres un asistente amigable de una inmobiliaria..."
    }
  }
}
```

**Purpose:** Handle unclear messages, guide users to specify their needs

**Model:** GPT-4.1-mini (temperature: 0.5)

---

## 3.6 Parse Properties (Code Node)

```javascript
// Extracts structured property data from Sales Agent output
// Parses ---PROPERTY_START--- / ---PROPERTY_END--- markers
// Outputs: chat_id, message_type, response_text, photo_url, caption
```

**Output Types:**
- `property_card` - Message with photo
- `text_only` - Plain text message

---

## 3.7 Redis Buffer System

**Purpose:** Aggregate multiple rapid messages from same user

**Flow:**
1. **Buffer** - Push message to Redis list (key: chat_id)
2. **Get buffer data** - Retrieve all messages
3. **Switch** - Check if more messages incoming
4. **Wait** - 7 seconds delay for message aggregation
5. **Delete buffer** - Clear after processing
6. **Edit Fields** - Concatenate all messages

---

# 4. Data Flow

## 4.1 Input Processing

```
Telegram Message
    │
    ▼
┌─────────────────────────────────────┐
│ Extract User Data                    │
├─────────────────────────────────────┤
│ sessionId: message.from.id          │
│ user_message: message.text          │
│ chat_id: message.chat.id            │
│ date_time: message.date (localized) │
│ full_name: first_name + last_name   │
└─────────────────────────────────────┘
```

## 4.2 Message Aggregation

```
Multiple Messages (within 7 seconds)
    │
    ▼
┌─────────────────────────────────────┐
│ Redis Buffer                         │
├─────────────────────────────────────┤
│ Key: chat_id                        │
│ Value: JSON array of messages       │
│ TTL: Until processed                │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Edit Fields (Concatenate)           │
├─────────────────────────────────────┤
│ concat_message: messages.join('\n') │
│ sessionId: preserved                │
└─────────────────────────────────────┘
```

## 4.3 Classification Output

```
Router Classifier
    │
    ▼
┌─────────────────────────────────────┐
│ Output                               │
├─────────────────────────────────────┤
│ output: "SALES" | "SCHEDULING" |    │
│         "UNCLEAR"                   │
└─────────────────────────────────────┘
```

## 4.4 Response Formatting

```
Sales Agent Output
    │
    ▼
┌─────────────────────────────────────┐
│ Parse Properties                     │
├─────────────────────────────────────┤
│ For each property:                  │
│   - chat_id                         │
│   - message_type                    │
│   - response_text (formatted)       │
│   - photo_url (if available)        │
│   - caption                         │
└─────────────────────────────────────┘
```

---

# 5. Error Handling

## 5.1 Error Workflow

```json
{
  "settings": {
    "errorWorkflow": "Q7Re72V4C7cxIQNR"
  }
}
```

## 5.2 Fallback Responses

| Scenario | Response |
|----------|----------|
| No properties found | "Lo siento, no encontré propiedades disponibles." |
| Processing error | "Lo siento, hubo un problema procesando tu solicitud." |
| Unknown classification | Routes to Sales Agent (fallback) |

## 5.3 Input Validation

- Voice messages: Transcribed via OpenAI Whisper
- Empty messages: Filtered out
- Missing chat_id: Error logged, execution stopped

---

# 6. Integration Points

## 6.1 External Services

| Service | Purpose | Credentials |
|---------|---------|-------------|
| **Telegram** | User messaging | Telegram account 2 |
| **OpenAI** | AI models (GPT-4o, Whisper) | OpenAi account |
| **Redis** | Message buffering | Redis account |
| **PostgreSQL** | Chat memory storage | Postgres account |
| **Airtable** | Property database | Airtable Personal Access Token |
| **Supabase** | Vector store (embeddings) | Supabase account |
| **Google Calendar** | Visit scheduling | Google Calendar OAuth2 |
| **Gmail** | Confirmation emails | Gmail OAuth2 |

## 6.2 Database Schema

### Airtable - Propiedades

| Field | Type | Description |
|-------|------|-------------|
| Precio | Number | Price in USD |
| Ciudad | Text | City name |
| Zona | Text | Neighborhood |
| Tipo | Text | Property type |
| Habitaciones | Number | Bedrooms |
| Baños | Number | Bathrooms |
| Operación | Text | "Venta" or "Alquiler" |
| Superficie | Number | Area in m² |
| Dirección | Text | Full address |
| Patio | Single Select | "Sí" or "No" |
| Imagen | Attachment | Property photos |
| Descripción | Text | Description |

### Supabase - property_embeddings

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| content | Text | Property details |
| embedding | Vector(1536) | OpenAI embedding |
| metadata | JSONB | Additional data |

## 6.3 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| Telegram Webhook | POST | Receive messages |
| n8n Chat Widget | WebSocket | Internal testing |

---

# Appendix A: Troubleshooting

## Common Issues

### 1. "Unknown error" in Code Node

**Cause:** JavaScript syntax not supported in n8n sandbox

**Solution:** Use `var` instead of `const/let`, avoid arrow functions, use traditional loops

### 2. "Bad request" in Telegram Node

**Cause:** Invalid chat_id or empty message text

**Solution:** Validate chat_id is a real Telegram ID (not test value), ensure text is not empty

### 3. Router misclassification

**Cause:** Ambiguous user messages

**Solution:** Adjust system prompt, add more examples, use conversation context

---

# Appendix B: Maintenance

## Regular Tasks

- [ ] Monitor Redis memory usage
- [ ] Review PostgreSQL chat history size
- [ ] Update Airtable property listings
- [ ] Refresh Google OAuth tokens
- [ ] Review agent prompt effectiveness

## Scaling Considerations

- Redis cluster for high message volume
- PostgreSQL read replicas for memory queries
- Rate limiting for Telegram API (30 msg/sec)
- OpenAI API quotas management

---

*Document generated for AI assistant reference*
*Last updated: 2026-02-05*
