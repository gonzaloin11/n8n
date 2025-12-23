# n8n Workflow Fix Documentation

## Invoice Digitization Workflow - Duplication Bug Fix

**Date:** December 23, 2025
**Affected Workflow:** My workflow 2-actual
**Reference Workflow:** Digitalización de facturas (working)

---

## Table of Contents

1. [Problem Description](#problem-description)
2. [Symptoms](#symptoms)
3. [Diagnosis Process](#diagnosis-process)
4. [Root Cause Analysis](#root-cause-analysis)
5. [Fixes Applied](#fixes-applied)
6. [How to Apply Fixes](#how-to-apply-fixes)
7. [Prevention Tips](#prevention-tips)
8. [Files Reference](#files-reference)

---

## Problem Description

The "My workflow 2-actual" n8n workflow was experiencing a duplication bug where the Structured Output Parser was processing items twice, causing the second run to fail with the error:

```
Model output doesn't fit required format
```

The workflow was designed to:
1. Listen for new PDF files in Google Drive
2. Download and extract text from PDFs
3. Use OpenAI to extract invoice data
4. Parse the output into structured JSON
5. Append the data to Google Sheets

---

## Symptoms

### Visual Indicators
- **"2 items (total)"** showing in the Structured Output Parser node instead of 1
- **Run 2 of 2** failing with format error
- **INPUT field** showing `text: [object Object]` instead of JSON string on second run

### Error Message
```
Model output doesn't fit required format
To continue the execution when this happens, change the 'On Error'
parameter in the root node's settings
```

### Screenshot Evidence
- Working workflow ("Parseador de datos"): INPUT shows proper JSON string
- Broken workflow ("Structured Output Parser"): INPUT shows `[object Object]`

---

## Diagnosis Process

### Step 1: Compare Both Workflows
Compared the working "Digitalización de facturas" workflow with the broken "My workflow 2-actual" workflow by analyzing their JSON configurations.

### Step 2: Identify Node Differences
Found differences in three main nodes:
- Basic LLM Chain
- OpenAI Chat Model
- Structured Output Parser

### Step 3: Analyze typeVersion Differences
Discovered that the broken workflow was using newer node versions with different behavior:

| Node | Working Version | Broken Version |
|------|-----------------|----------------|
| Basic LLM Chain | 1.4 | 1.7 |
| OpenAI Chat Model | 1.2 | 1.3 |
| Structured Output Parser | 1.1 | 1.3 |

### Step 4: Identify Extra Parameters
Found additional parameters in the broken workflow that were causing issues:
- `batching: {}` in LLM Chain
- `alwaysOutputData: false` in LLM Chain
- `builtInTools: {}` in OpenAI Model
- `schemaType: "manual"` + `inputSchema` instead of `jsonSchema`

---

## Root Cause Analysis

### Primary Causes

#### 1. `batching: {}` (Empty Object)
- **Location:** Basic LLM Chain node
- **Effect:** Triggered duplicate processing of items
- **Why:** Empty batching configuration caused the node to process data in an unexpected loop

#### 2. `alwaysOutputData: false`
- **Location:** Basic LLM Chain node
- **Effect:** Affected output pipeline behavior
- **Why:** This setting altered how data flowed through the AI chain, causing the parser to receive already-processed objects

#### 3. OpenAI Model typeVersion 1.3 with `builtInTools: {}`
- **Location:** OpenAI Chat Model node
- **Effect:** Different output handling behavior
- **Why:** Version 1.3 with builtInTools had different internal processing that contributed to duplication

#### 4. Structured Output Parser Parameter Structure
- **Location:** Structured Output Parser node
- **Effect:** Parser received `[object Object]` on second run
- **Why:** Version 1.3 uses `schemaType` + `inputSchema`, while version 1.1 uses `jsonSchema` - the different structure caused parsing issues

### The Duplication Flow

```
1. PDF extracted → text sent to LLM Chain
2. LLM Chain (v1.7 with batching:{}) processes item
3. Output goes to Structured Parser
4. Parser processes successfully (Run 1) ✓
5. Due to batching/alwaysOutputData settings,
   the PARSED OBJECT is sent back through the chain
6. Parser receives [object Object] instead of string (Run 2) ✗
7. Error: "Model output doesn't fit required format"
```

---

## Fixes Applied

### Fix 1: Basic LLM Chain Node

**Before:**
```json
{
  "parameters": {
    "promptType": "define",
    "text": "=Dada la siguiente factura...",
    "hasOutputParser": true,
    "batching": {}
  },
  "type": "@n8n/n8n-nodes-langchain.chainLlm",
  "typeVersion": 1.7,
  "name": "Basic LLM Chain",
  "retryOnFail": true,
  "alwaysOutputData": false,
  "onError": "continueErrorOutput"
}
```

**After:**
```json
{
  "parameters": {
    "promptType": "define",
    "text": "=Dada la siguiente factura...",
    "hasOutputParser": true
  },
  "type": "@n8n/n8n-nodes-langchain.chainLlm",
  "typeVersion": 1.4,
  "name": "Basic LLM Chain",
  "retryOnFail": true,
  "onError": "continueErrorOutput"
}
```

**Changes:**
- ✅ Removed `"batching": {}`
- ✅ Removed `"alwaysOutputData": false`
- ✅ Changed `typeVersion` from `1.7` to `1.4`

---

### Fix 2: OpenAI Chat Model Node

**Before:**
```json
{
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "list",
      "value": "gpt-4o-mini"
    },
    "builtInTools": {},
    "options": {
      "temperature": 0
    }
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1.3
}
```

**After:**
```json
{
  "parameters": {
    "model": {
      "__rl": true,
      "mode": "list",
      "value": "gpt-4o-mini"
    },
    "options": {}
  },
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1.2
}
```

**Changes:**
- ✅ Removed `"builtInTools": {}`
- ✅ Removed `"temperature": 0` from options
- ✅ Changed `typeVersion` from `1.3` to `1.2`

---

### Fix 3: Structured Output Parser Node

**Before:**
```json
{
  "parameters": {
    "schemaType": "manual",
    "inputSchema": "={\n  \"type\": \"object\"..."
  },
  "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
  "typeVersion": 1.3
}
```

**After:**
```json
{
  "parameters": {
    "jsonSchema": "={\n  \"type\": \"object\"..."
  },
  "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
  "typeVersion": 1.1
}
```

**Changes:**
- ✅ Removed `"schemaType": "manual"`
- ✅ Renamed `"inputSchema"` to `"jsonSchema"`
- ✅ Changed `typeVersion` from `1.3` to `1.1`

---

## How to Apply Fixes

### Method 1: Import Fixed JSON (Recommended)

1. Download the fixed workflow file: `my-workflow-2-actual.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Select the downloaded JSON file
4. Save and activate the workflow

### Method 2: Manual JSON Edit

1. Export your current workflow as JSON
2. Open in a text editor
3. Make the following find/replace operations:

```
Find: "typeVersion": 1.7  (in chainLlm)
Replace: "typeVersion": 1.4

Find: "typeVersion": 1.3  (in lmChatOpenAi)
Replace: "typeVersion": 1.2

Find: "typeVersion": 1.3  (in outputParserStructured)
Replace: "typeVersion": 1.1
```

4. Remove these lines:
   - `"batching": {},`
   - `"alwaysOutputData": false,`
   - `"builtInTools": {},`
   - `"temperature": 0` (and its containing options if empty)

5. Change:
   - `"schemaType": "manual",` → (delete this line)
   - `"inputSchema":` → `"jsonSchema":`

6. Import the modified JSON back into n8n

### Method 3: Recreate Nodes

If editing JSON is not possible:
1. Delete the affected nodes (LLM Chain, OpenAI Model, Structured Parser)
2. Create new nodes with the same names
3. Reconfigure all parameters
4. Reconnect all connections

---

## Prevention Tips

### 1. Test After n8n Updates
When n8n updates, node versions may change. Always test workflows after updates.

### 2. Keep Reference Workflows
Maintain a working backup of critical workflows to compare against when issues arise.

### 3. Avoid Empty Configuration Objects
Don't add empty objects like `batching: {}` or `builtInTools: {}` unless specifically needed.

### 4. Check Node Versions
When copying nodes between workflows, verify that typeVersions are compatible.

### 5. Monitor for Duplication
If you see "X items (total)" where X > expected, investigate immediately.

---

## Files Reference

### Repository Structure
```
n8n/
├── digitalizacion-facturas-workflow.json  (Working reference)
├── my-workflow-2-actual.json              (Fixed workflow)
├── README-WORKFLOW-FIX.md                 (This documentation)
├── README.md                              (General readme)
└── CLAUDE.md                              (AI assistant guide)
```

### Workflow Files

| File | Description | Status |
|------|-------------|--------|
| `digitalizacion-facturas-workflow.json` | Original working workflow | Reference |
| `my-workflow-2-actual.json` | Fixed workflow | Ready to use |

### Git Commits
1. `74d6acc` - Add invoice digitization n8n workflows
2. `d6cd95c` - Fix duplication bug in My workflow 2-actual
3. `0b23de6` - Fix additional issues causing duplication

---

## Summary Table

| Component | Issue | Fix |
|-----------|-------|-----|
| LLM Chain typeVersion | 1.7 caused batching issues | Changed to 1.4 |
| LLM Chain batching | `{}` triggered duplicates | Removed |
| LLM Chain alwaysOutputData | `false` broke pipeline | Removed |
| OpenAI typeVersion | 1.3 had different behavior | Changed to 1.2 |
| OpenAI builtInTools | `{}` caused issues | Removed |
| Parser typeVersion | 1.3 used wrong params | Changed to 1.1 |
| Parser schema param | `inputSchema` | Changed to `jsonSchema` |

---

## Contact & Support

For questions about this fix or similar n8n workflow issues, refer to:
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)

---

*Documentation created during debugging session on December 23, 2025*
