# Expense Management System - Setup Instructions

This document provides complete setup instructions for the multi-channel expense management system built with n8n.

## System Overview

The system consists of three workflows:
- **Workflow A**: Email Receipt Processor - Ingests receipts via email
- **Workflow B**: Telegram Bot & Expense Recorder - Main bot for all interactions
- **Workflow C**: Review & Upload Reminders - Scheduled notifications

## Prerequisites

- n8n instance (self-hosted or cloud)
- Supabase account (or PostgreSQL database)
- Google Cloud Platform account with APIs enabled
- Telegram Bot (via BotFather)
- OpenAI API account
- PDF.co account (for PDF processing)

---

## 1. Database Setup (Supabase)

### Create Tables

Execute the following SQL in your Supabase SQL editor:

```sql
-- Main expense records table
CREATE TABLE expense_records (
    id SERIAL PRIMARY KEY,
    id_transaccion VARCHAR(50) UNIQUE NOT NULL,
    fecha_cobro VARCHAR(20),
    servicio_comercio VARCHAR(255),
    concepto TEXT,
    importe VARCHAR(50),
    categoria VARCHAR(100),
    tipo_gasto VARCHAR(50),
    origen_cobro VARCHAR(100),
    link_archivo TEXT,
    comprobante_link TEXT,
    chat_id BIGINT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_vista TIMESTAMPTZ,
    fecha_pago TIMESTAMPTZ,
    origen_registro VARCHAR(50),
    vista_por_usuario BOOLEAN DEFAULT FALSE,
    forma_pago VARCHAR(50),
    enviado BOOLEAN DEFAULT FALSE,
    requiere_comprobante BOOLEAN DEFAULT FALSE,
    comprobante_cargado BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat state tracking table
CREATE TABLE chat_state (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    awaiting_receipt_for VARCHAR(50),
    last_reminder_sent TIMESTAMPTZ,
    solicita VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expense_id_transaccion ON expense_records(id_transaccion);
CREATE INDEX idx_expense_chat_id ON expense_records(chat_id);
CREATE INDEX idx_expense_vista ON expense_records(vista_por_usuario);
CREATE INDEX idx_expense_forma_pago ON expense_records(forma_pago);
CREATE INDEX idx_chat_state_chat_id ON chat_state(chat_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_state ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role access" ON expense_records FOR ALL USING (true);
CREATE POLICY "Service role access" ON chat_state FOR ALL USING (true);
```

### Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **Service Role Key** (not the anon key)

---

## 2. Google Cloud Platform Setup

### Enable APIs

In Google Cloud Console, enable:
- Google Drive API
- Google Sheets API
- Google Docs API
- Gmail API

### Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URI: `https://your-n8n-instance/rest/oauth2-credential/callback`
5. Download the JSON credentials

### Create Google Sheet

Create a Google Sheet named "Registro_Gastos_v2" with sheet "REGISTRO DE GASTOS" and these columns:

| Column | Header |
|--------|--------|
| A | FECHA DEL COBRO |
| B | SERVICIO / COMERCIO |
| C | CONCEPTO |
| D | IMPORTE |
| E | ID INTERNO (NO TOCAR) |
| F | ESTADO |
| G | CATEGORIA |
| H | ID DE TRANSACCION |
| I | TIPO DE GASTO |
| J | Link de archivo |
| K | Usuario Ingreso |
| L | Visto por Ine |
| M | Fecha de Vencimiento |
| N | Forma de pago |

### Create Google Drive Folder

1. Create a folder in Google Drive for receipts (e.g., "img control")
2. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`

---

## 3. Telegram Bot Setup

### Create Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow instructions
3. Copy the **Bot Token** provided

### Configure Webhook (n8n will handle this automatically)

The webhook URL will be: `https://your-n8n-instance/webhook/telegram-expense-bot`

---

## 4. OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create a new API key
4. Ensure you have access to:
   - `gpt-4o-mini` (or `gpt-4o` for better accuracy)
   - Whisper API for audio transcription

---

## 5. PDF.co Setup

1. Create account at [PDF.co](https://pdf.co)
2. Get your API key from the dashboard
3. Create HTTP Header Auth credential in n8n:
   - Header Name: `x-api-key`
   - Header Value: `your-pdf-co-api-key`

---

## 6. n8n Credential Configuration

### Create the following credentials in n8n:

#### 1. Supabase API
- **Name**: Supabase Account
- **Host**: `https://your-project.supabase.co`
- **Service Role Key**: `your-service-role-key`

#### 2. Google OAuth2 (for Drive, Sheets, Docs, Gmail)
- **Name**: Google Sheets Account / Google Drive Account / etc.
- **Client ID**: from Google Cloud credentials
- **Client Secret**: from Google Cloud credentials
- **Scopes**:
  - `https://www.googleapis.com/auth/drive`
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/documents`
  - `https://www.googleapis.com/auth/gmail.send`

#### 3. Telegram API
- **Name**: Telegram Bot
- **Access Token**: from BotFather

#### 4. OpenAI API
- **Name**: OpenAI Account
- **API Key**: your OpenAI API key

#### 5. IMAP (for email trigger)
- **Name**: Email IMAP Account
- **Host**: your email provider IMAP server
- **User**: your email address
- **Password**: app-specific password or regular password
- **Port**: 993 (typically)
- **SSL/TLS**: true

#### 6. PDF.co (HTTP Header Auth)
- **Name**: PDF.co API Key
- **Header Name**: `x-api-key`
- **Header Value**: your PDF.co API key

---

## 7. Import Workflows

### Step 1: Update Placeholder Values

Before importing, search and replace these placeholders in the JSON files:

| Placeholder | Replace With |
|-------------|--------------|
| `SUPABASE_CREDENTIAL_ID` | Your Supabase credential ID |
| `GOOGLE_DRIVE_CREDENTIAL_ID` | Your Google Drive credential ID |
| `GOOGLE_SHEETS_CREDENTIAL_ID` | Your Google Sheets credential ID |
| `GOOGLE_DOCS_CREDENTIAL_ID` | Your Google Docs credential ID |
| `GMAIL_CREDENTIAL_ID` | Your Gmail credential ID |
| `TELEGRAM_CREDENTIAL_ID` | Your Telegram credential ID |
| `OPENAI_CREDENTIAL_ID` | Your OpenAI credential ID |
| `IMAP_CREDENTIAL_ID` | Your IMAP credential ID |
| `PDFCO_CREDENTIAL_ID` | Your PDF.co credential ID |
| `YOUR_GOOGLE_SHEET_ID` | Your Google Sheet document ID |
| `YOUR_GOOGLE_DRIVE_FOLDER_ID` | Your Google Drive folder ID |

### Step 2: Import Workflows

1. Go to n8n **Workflows**
2. Click **Import from File**
3. Import each JSON file:
   - `workflow-a-email-receipt-processor.json`
   - `workflow-b-telegram-expense-recorder.json`
   - `workflow-c-review-reminders.json`

### Step 3: Activate Workflows

1. Open each imported workflow
2. Verify all credentials are connected properly
3. Click **Active** toggle to enable

---

## 8. Testing

### Test Workflow A (Email)
1. Send an email with a receipt image/PDF attachment to your configured email
2. Check that the workflow triggers and processes the receipt
3. Verify data appears in Google Sheets and Supabase

### Test Workflow B (Telegram)
1. Send `/start` to your Telegram bot
2. Send an image of a receipt
3. Send a voice note describing an expense
4. Send a text message describing an expense
5. Verify data appears in Google Sheets and Supabase

### Test Workflow C (Reminders)
1. Trigger the webhook manually:
```bash
curl -X POST https://your-n8n-instance/webhook/expense-reminders \
  -H "Content-Type: application/json" \
  -d '{"action": "all"}'
```
2. Check that Telegram messages are sent for pending items

---

## 9. Troubleshooting

### Common Issues

#### "Credential not found" error
- Ensure all credentials are created with matching IDs
- Verify OAuth2 credentials have been authorized (click "Connect" button)

#### Telegram bot not responding
- Check that the webhook is properly registered
- Verify bot token is correct
- Ensure bot is not blocked or restricted

#### OpenAI API errors
- Check API key validity
- Verify you have sufficient credits
- Ensure model access (`gpt-4o-mini`)

#### Google Sheets "Permission denied"
- Re-authorize the OAuth2 connection
- Ensure the authenticated user has edit access to the sheet

#### PDF conversion failing
- Verify PDF.co API key
- Check that the PDF is not password protected
- Ensure the file URL is accessible

---

## 10. Customization

### Modify Categories
Edit the OpenAI prompt in the analysis nodes to change expense categories.

### Change Reminder Schedule
In Workflow C, modify the Schedule Trigger interval.

### Add New Payment Methods
Edit the inline keyboard buttons in the Telegram send nodes.

### Custom ID Generation
Modify the JavaScript Code nodes to change the transaction ID format.

---

## Support

For issues with:
- **n8n**: Check [n8n documentation](https://docs.n8n.io)
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
- **Telegram Bot API**: Check [Telegram Bot API docs](https://core.telegram.org/bots/api)
- **OpenAI API**: Check [OpenAI documentation](https://platform.openai.com/docs)
