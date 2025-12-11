# Intelligent Financial Assistant Bot - Setup Instructions

## Overview

This n8n workflow creates an intelligent expense tracking and accounts payable automation system using Telegram as the user interface. It achieves 70-90% reduction in manual data entry by automating capture, classification, storage, validation, and payment recording.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Telegram Bot Token
- OpenAI API Key (with GPT-4o and Whisper access)
- Google Cloud Project with OAuth2 credentials
- Gmail account for sending payment proofs

## Required Credentials

### 1. Telegram Bot API

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the HTTP API token provided
4. In n8n, create a new credential:
   - **Type:** Telegram API
   - **Access Token:** Your bot token

### 2. OpenAI API

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. In n8n, create a new credential:
   - **Type:** OpenAI API
   - **API Key:** Your OpenAI key
4. **Note:** Ensure your account has access to GPT-4o and Whisper models

### 3. Google OAuth2 (Sheets & Drive)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth2 credentials:
   - Application type: Web application
   - Add authorized redirect URI: `https://your-n8n-instance/rest/oauth2-credential/callback`
5. In n8n, create credentials for:
   - **Google Sheets OAuth2**
   - **Google Drive OAuth2**

### 4. Gmail OAuth2

1. In the same Google Cloud project, ensure Gmail API is enabled
2. Use the same OAuth2 credentials
3. In n8n, create a new credential:
   - **Type:** Gmail OAuth2

## Google Sheets Setup

### Create a new Google Spreadsheet with 3 sheets:

#### Sheet 1: "Expense Register"
| Column | Description |
|--------|-------------|
| Row ID | Unique identifier (auto-generated) |
| Date | Expense date (YYYY-MM-DD) |
| Vendor | Company/Service provider name |
| Concept | Description of expense |
| Amount | Numeric amount |
| Currency | USD, EUR, MXN, etc. |
| Category | Food, Transportation, Utilities, Office, Software, Services, Other |
| Document Type | Invoice, Receipt, Bill, Statement, Manual Entry, Recurring |
| Drive Link | Link to uploaded document |
| Status | Pending Validation, Validated - Pending Payment, Paid, Rejected |
| Payment Method | Check, Transfer, Cash |
| Payment Date | Date of payment (YYYY-MM-DD) |
| Created At | Timestamp of creation |
| Chat ID | Telegram chat ID for notifications |

#### Sheet 2: "Contacts"
| Column | Description |
|--------|-------------|
| Vendor | Vendor name (must match exactly) |
| Email | Vendor email for payment proofs |
| Phone | Contact phone (optional) |
| Notes | Additional notes (optional) |

#### Sheet 3: "Recurring Config"
| Column | Description |
|--------|-------------|
| Service | Service/Vendor name |
| Concept | Description of recurring expense |
| Amount | Monthly amount |
| Currency | USD, EUR, MXN, etc. |
| Category | Expense category |
| AutoValidate | "true" or "false" - skip validation step |

## Workflow Configuration

### Update Spreadsheet ID

1. Open your Google Spreadsheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`
3. In the workflow JSON, replace all instances of `YOUR_SPREADSHEET_ID` with your actual ID

### Update Credential References

Update the credential IDs in the workflow JSON to match your n8n credentials:

```json
"credentials": {
  "telegramApi": {
    "id": "YOUR_TELEGRAM_CREDENTIAL_ID",
    "name": "Telegram Bot API"
  }
}
```

## Import Workflow

1. Open n8n
2. Go to **Workflows** > **Import from File**
3. Select `intelligent-financial-assistant-workflow.json`
4. Review and fix any credential mappings
5. **Activate** the workflow

## Telegram Bot Commands

Once active, your bot responds to:

| Command/Input | Action |
|---------------|--------|
| Text message | Records expense from natural language |
| Voice note | Transcribes and records expense |
| Photo | Extracts expense data using OCR/Vision |
| PDF/Document | Extracts expense data from document |
| `/validate` | Shows pending expenses for approval |
| `/pay` | Shows validated expenses for payment |

### Interactive Buttons

- **Approve/Reject/Edit** - Validation actions
- **Check/Transfer/Cash** - Payment method selection

## Workflow Architecture

```
[Telegram Trigger] --> [Route Input Type]
                            |
        +-------------------+-------------------+
        |         |         |         |         |
      Voice    Photo   Document   /validate   /pay    Text
        |         |         |         |         |        |
    Whisper   GPT-4o    GPT-4o   List     List     GPT-4o
        |     Vision    Vision  Pending  Validated Extract
        |         |         |         |         |        |
        +---------+---------+         |         |        |
                  |                   |         |        |
            Parse JSON            Inline     Inline      |
                  |               Buttons   Buttons      |
            Upload Drive             |         |        |
                  |                  |         |        |
            Add to Sheet        Callbacks  Callbacks     |
                  |                  |         |        |
            Confirmation        Update    Record        |
                               Status    Payment       |
                                  |         |          |
                              [Email if Check/Transfer]

[Monthly Schedule] --> [Recurring Config] --> [Add to Sheet]
```

## Error Handling

The workflow includes error handling for:
- Failed AI extractions (prompts user to retry)
- Missing vendor emails (skips email dispatch)
- Empty expense lists (informs user)

## Testing the Bot

1. **Test Text Input:**
   ```
   Coffee at Starbucks $5.50 today
   ```

2. **Test Voice:** Record a voice note describing an expense

3. **Test Image:** Send a photo of a receipt

4. **Test Validation:** Send `/validate` to review pending expenses

5. **Test Payment:** Send `/pay` to process validated expenses

## Customization Options

### Add Categories
Edit the GPT-4o prompts to include additional categories:
```
"category": "One of: Food, Transportation, Utilities, Office, Software, Services, Healthcare, Entertainment, Other"
```

### Change Language
Update the Whisper language parameter:
```json
"options": {
  "language": "en"  // Change to desired language code
}
```

### Modify Date Format
Update the date format expressions throughout the workflow as needed.

## Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Verify webhook is set up correctly
   - Check workflow is activated
   - Verify Telegram credentials

2. **AI extraction fails:**
   - Check OpenAI API quota
   - Verify GPT-4o access
   - Review image quality

3. **Google Sheets errors:**
   - Verify spreadsheet ID
   - Check sheet names match exactly
   - Ensure OAuth2 scope includes sheets

4. **Email not sending:**
   - Verify Gmail OAuth2 credentials
   - Check vendor exists in Contacts sheet
   - Verify email address format

## Security Considerations

- Store all credentials securely in n8n
- Use environment variables for sensitive data
- Regularly rotate API keys
- Review expense data access permissions
- Consider adding user authentication for multi-user setups

## Support

For issues with this workflow:
1. Check n8n execution logs
2. Review Telegram bot logs
3. Verify all API credentials are valid
4. Test each flow independently

---

**Version:** 1.0.0
**Last Updated:** 2025-12-11
**Compatible with:** n8n v1.0+
