# N8N Workflow Structure - Complete Reference Guide

> **Purpose**: This document serves as the knowledge base for understanding and replicating n8n workflows from images or video transcriptions.

## 1. Workflow JSON Structure

Every n8n workflow follows this core structure:

```json
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {...},
  "staticData": null,
  "tags": [...],
  "triggerCount": 1,
  "updatedAt": "2024-12-10T00:00:00.000Z",
  "versionId": "1"
}
```

## 2. Node Structure

Each node in the `nodes` array has this structure:

```json
{
  "parameters": {
    // Node-specific configuration
  },
  "id": "unique-node-id",
  "name": "Human Readable Name",
  "type": "n8n-nodes-base.nodetype",
  "typeVersion": 2,
  "position": [X, Y],
  "credentials": {
    "credentialType": {
      "id": "",
      "name": "Credential Name"
    }
  }
}
```

### Key Node Properties:

| Property | Description |
|----------|-------------|
| `id` | Unique identifier (lowercase, hyphenated) |
| `name` | Display name in canvas |
| `type` | Node type identifier |
| `typeVersion` | Version of the node |
| `position` | [X, Y] coordinates on canvas |
| `parameters` | Node-specific settings |
| `credentials` | Authentication references |

## 3. Common Node Types

### 3.1 Triggers (Entry Points)

#### Manual Trigger
```json
{
  "parameters": {},
  "id": "manual-trigger",
  "name": "Manual Trigger",
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [0, 300]
}
```

#### Webhook Trigger
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "webhook-path",
    "options": {}
  },
  "id": "webhook",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [0, 300],
  "webhookId": "unique-webhook-id"
}
```

#### Schedule Trigger
```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "hours",
          "hoursInterval": 1
        }
      ]
    }
  },
  "id": "schedule",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [0, 300]
}
```

#### Email (IMAP) Trigger
```json
{
  "parameters": {
    "pollTimes": {
      "item": [{"mode": "everyMinute"}]
    },
    "simple": false,
    "filters": {
      "readStatus": "unread"
    },
    "options": {
      "downloadAttachments": true
    }
  },
  "id": "email-trigger",
  "name": "Email Trigger (IMAP)",
  "type": "n8n-nodes-base.emailReadImap",
  "typeVersion": 2,
  "position": [0, 300],
  "credentials": {
    "imap": {"id": "", "name": "Email IMAP Account"}
  }
}
```

#### Telegram Trigger
```json
{
  "parameters": {
    "updates": ["message", "callback_query"]
  },
  "id": "telegram-trigger",
  "name": "Telegram Trigger",
  "type": "n8n-nodes-base.telegramTrigger",
  "typeVersion": 1.1,
  "position": [0, 300],
  "webhookId": "telegram-bot",
  "credentials": {
    "telegramApi": {"id": "", "name": "Telegram Bot"}
  }
}
```

### 3.2 Control Flow Nodes

#### IF Node (Conditional)
```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition-id",
          "leftValue": "={{ $json.field }}",
          "rightValue": "expectedValue",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  },
  "id": "if-node",
  "name": "Check Condition",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [400, 300]
}
```

**Operator Types:**
- String: `equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `regex`, `exists`
- Number: `equals`, `notEquals`, `gt`, `gte`, `lt`, `lte`
- Boolean: `true`, `false`, `equals`

#### Switch Node (Multiple Paths)
```json
{
  "parameters": {
    "rules": {
      "rules": [
        {
          "conditions": {
            "options": {
              "caseSensitive": false,
              "leftValue": "",
              "typeValidation": "loose"
            },
            "conditions": [
              {
                "leftValue": "={{ $json.type }}",
                "rightValue": "image",
                "operator": {
                  "type": "string",
                  "operation": "equals"
                }
              }
            ],
            "combinator": "and"
          },
          "renameOutput": true,
          "outputLabel": "Image"
        }
      ]
    },
    "options": {
      "fallbackOutput": "extra"
    }
  },
  "id": "switch-node",
  "name": "Route by Type",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "position": [400, 300]
}
```

#### Split Out Node
```json
{
  "parameters": {
    "fieldToSplitOut": "items",
    "options": {}
  },
  "id": "split-out",
  "name": "Split Items",
  "type": "n8n-nodes-base.splitOut",
  "typeVersion": 1,
  "position": [400, 300]
}
```

#### Merge Node
```json
{
  "parameters": {
    "mode": "combine",
    "mergeByFields": {
      "values": [
        {"field1": "id", "field2": "id"}
      ]
    },
    "options": {}
  },
  "id": "merge-node",
  "name": "Merge Data",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "position": [800, 300]
}
```

#### No Operation (End Point)
```json
{
  "parameters": {},
  "id": "no-op",
  "name": "End",
  "type": "n8n-nodes-base.noOp",
  "typeVersion": 1,
  "position": [1200, 300]
}
```

### 3.3 Data Transformation Nodes

#### Set Node (Assign Values)
```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "assignment-id",
          "name": "fieldName",
          "value": "={{ $json.sourceField }}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "id": "set-node",
  "name": "Set Fields",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [400, 300]
}
```

#### Code Node (JavaScript)
```json
{
  "parameters": {
    "jsCode": "// Your JavaScript code here\nconst data = $input.first().json;\n\n// Process data\nconst result = {\n  processed: true,\n  value: data.field\n};\n\nreturn { json: result };"
  },
  "id": "code-node",
  "name": "Process Data",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [400, 300]
}
```

**Code Node Patterns:**

```javascript
// Access input data
const input = $input.first().json;
const allItems = $input.all();

// Access data from specific nodes
const triggerData = $('Trigger Node Name').first().json;
const allTriggerData = $('Node Name').all();

// Return single item
return { json: { field: 'value' } };

// Return multiple items
return allItems.map(item => ({
  json: { ...item.json, processed: true }
}));

// Parse JSON from string
const jsonMatch = response.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  const parsed = JSON.parse(jsonMatch[0]);
}

// Date formatting
const now = new Date();
const dateStr = now.toISOString();
const formatted = $now.format('yyyy-MM-dd HH:mm:ss');
```

### 3.4 API Integration Nodes

#### HTTP Request
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ data: $json.field }) }}",
    "options": {
      "response": {
        "response": {
          "responseFormat": "json"
        }
      }
    }
  },
  "id": "http-request",
  "name": "API Call",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [400, 300],
  "credentials": {
    "httpHeaderAuth": {"id": "", "name": "API Key"}
  }
}
```

#### Supabase
```json
{
  "parameters": {
    "operation": "insert",
    "tableId": "table_name",
    "dataToSend": "defineBelow",
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldName": "column_name",
          "fieldValue": "={{ $json.value }}"
        }
      ]
    }
  },
  "id": "supabase-insert",
  "name": "Insert to Database",
  "type": "n8n-nodes-base.supabase",
  "typeVersion": 1,
  "position": [400, 300],
  "credentials": {
    "supabaseApi": {"id": "", "name": "Supabase Account"}
  }
}
```

**Supabase Operations:**
- `insert` - Insert new records
- `update` - Update existing records (requires `filters`)
- `executeQuery` - Run raw SQL query
- `getAll` - Retrieve all records
- `get` - Get single record

#### Google Sheets
```json
{
  "parameters": {
    "operation": "append",
    "documentId": {
      "__rl": true,
      "value": "SPREADSHEET_ID",
      "mode": "id"
    },
    "sheetName": {
      "__rl": true,
      "value": "Sheet1",
      "mode": "list",
      "cachedResultName": "Sheet1"
    },
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "Column A": "={{ $json.fieldA }}",
        "Column B": "={{ $json.fieldB }}"
      },
      "matchingColumns": [],
      "schema": []
    },
    "options": {}
  },
  "id": "google-sheets",
  "name": "Add to Sheet",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.4,
  "position": [400, 300],
  "credentials": {
    "googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets Account"}
  }
}
```

#### Google Drive
```json
{
  "parameters": {
    "operation": "upload",
    "name": "={{ $json.filename }}",
    "folderId": {
      "__rl": true,
      "value": "FOLDER_ID",
      "mode": "id"
    },
    "options": {}
  },
  "id": "google-drive",
  "name": "Upload to Drive",
  "type": "n8n-nodes-base.googleDrive",
  "typeVersion": 3,
  "position": [400, 300],
  "credentials": {
    "googleDriveOAuth2Api": {"id": "", "name": "Google Drive Account"}
  }
}
```

#### Telegram
```json
{
  "parameters": {
    "chatId": "={{ $json.chat_id }}",
    "text": "=Message text with {{ $json.variable }}",
    "additionalFields": {
      "appendAttribution": false,
      "replyMarkup": "inlineKeyboard",
      "inlineKeyboard": {
        "rows": [
          {
            "row": {
              "buttons": [
                {
                  "text": "Button Text",
                  "additionalFields": {
                    "callbackData": "callback_value"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  },
  "id": "telegram-send",
  "name": "Send Message",
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2,
  "position": [400, 300],
  "credentials": {
    "telegramApi": {"id": "", "name": "Telegram Bot"}
  }
}
```

#### OpenAI
```json
{
  "parameters": {
    "resource": "chat",
    "options": {
      "maxTokens": 2048,
      "temperature": 0.3
    },
    "messages": {
      "values": [
        {
          "content": "=Your prompt here with {{ $json.variable }}"
        },
        {
          "type": "image",
          "binaryData": true,
          "inputDataFieldName": "data"
        }
      ]
    },
    "modelId": {
      "__rl": true,
      "value": "gpt-4o-mini",
      "mode": "list",
      "cachedResultName": "gpt-4o-mini"
    }
  },
  "id": "openai-chat",
  "name": "OpenAI Chat",
  "type": "@n8n/n8n-nodes-langchain.openAi",
  "typeVersion": 1.4,
  "position": [400, 300],
  "credentials": {
    "openAiApi": {"id": "", "name": "OpenAI Account"}
  }
}
```

**OpenAI Resources:**
- `chat` - Chat completion
- `audio` with operation `transcribe` - Whisper transcription

#### Gmail
```json
{
  "parameters": {
    "sendTo": "={{ $json.email }}",
    "subject": "=Subject with {{ $json.variable }}",
    "emailType": "html",
    "message": "=<html><body>{{ $json.content }}</body></html>",
    "options": {}
  },
  "id": "gmail-send",
  "name": "Send Email",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "position": [400, 300],
  "credentials": {
    "gmailOAuth2": {"id": "", "name": "Gmail Account"}
  }
}
```

## 4. Connections Structure

Connections define how data flows between nodes:

```json
{
  "connections": {
    "Source Node Name": {
      "main": [
        [
          {
            "node": "Target Node Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Multiple Outputs (IF/Switch)

```json
{
  "IF Node Name": {
    "main": [
      [
        {"node": "True Branch Node", "type": "main", "index": 0}
      ],
      [
        {"node": "False Branch Node", "type": "main", "index": 0}
      ]
    ]
  }
}
```

### Parallel Execution (Multiple Targets)

```json
{
  "Source Node": {
    "main": [
      [
        {"node": "Target 1", "type": "main", "index": 0},
        {"node": "Target 2", "type": "main", "index": 0}
      ]
    ]
  }
}
```

## 5. Expressions Reference

### Basic Expressions
```
{{ $json.fieldName }}                    // Access current item field
{{ $json['field with spaces'] }}         // Access field with special chars
{{ $json.nested.field }}                 // Access nested field
{{ $json.array[0] }}                     // Access array element
```

### Node References
```
{{ $('Node Name').first().json.field }}  // Get field from specific node
{{ $('Node Name').all() }}               // Get all items from node
{{ $('Node Name').item.json.field }}     // Current item context
```

### Built-in Variables
```
{{ $now }}                               // Current DateTime
{{ $now.toISO() }}                       // ISO format timestamp
{{ $now.format('yyyy-MM-dd') }}          // Formatted date
{{ $now.minus({days: 7}).toISO() }}      // Date arithmetic
{{ $executionId }}                       // Current execution ID
{{ $workflow.id }}                       // Workflow ID
{{ $workflow.name }}                     // Workflow name
```

### Conditionals
```
{{ $json.field ? $json.field : 'default' }}
{{ $json.field || 'default' }}
{{ $json.field ?? 'default' }}
```

### String Operations
```
{{ $json.text.toLowerCase() }}
{{ $json.text.toUpperCase() }}
{{ $json.text.trim() }}
{{ $json.text.split(',') }}
{{ $json.text.replace('old', 'new') }}
{{ $json.text.slice(0, 10) }}
```

## 6. Settings

```json
{
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  }
}
```

## 7. Tags

```json
{
  "tags": [
    {
      "name": "tag-name",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 8. Position Guidelines

- Nodes are typically spaced 220px apart horizontally
- Vertical spacing depends on branching (200px between branches)
- Trigger nodes usually start at position [0, 300]
- Flow moves left to right

**Position Pattern:**
```
Trigger: [0, 300]
Step 1: [220, 300]
Step 2: [440, 300]
IF Node: [660, 300]
  - True: [880, 200]
  - False: [880, 400]
```

## 9. Common Workflow Patterns

### Linear Flow
```
Trigger -> Process -> Save -> Notify
```

### Conditional Branching
```
Trigger -> Check -> IF
                     ├── True -> Action A
                     └── False -> Action B
```

### Multi-Input Processing
```
Trigger -> Split -> Loop Item -> Process -> Merge -> Save
```

### Error Handling
```
Trigger -> Try Action -> IF Error?
                          ├── No -> Continue
                          └── Yes -> Error Handler
```

## 10. Credential Types Reference

| Service | Credential Type | Required Fields |
|---------|-----------------|-----------------|
| Supabase | `supabaseApi` | host, serviceRoleKey |
| Google Sheets | `googleSheetsOAuth2Api` | OAuth2 |
| Google Drive | `googleDriveOAuth2Api` | OAuth2 |
| Gmail | `gmailOAuth2` | OAuth2 |
| Telegram | `telegramApi` | accessToken |
| OpenAI | `openAiApi` | apiKey |
| IMAP | `imap` | host, user, password, port |
| HTTP Header Auth | `httpHeaderAuth` | name, value |

---

This reference guide provides the foundation for understanding and replicating any n8n workflow from visual or textual descriptions.
