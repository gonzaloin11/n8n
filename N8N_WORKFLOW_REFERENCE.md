# Documentacion de Referencia para Crear Workflows de n8n

> **Version:** 1.0.0
> **Ultima actualizacion:** 2026-01-20
> **Fuente principal:** [n8n-MCP Repository](https://github.com/czlonkowski/n8n-mcp)

Este documento sirve como guia de referencia para la IA en la creacion de workflows de n8n. Incluye estructuras JSON, parametros de nodos y ejemplos de configuraciones comunes.

---

## Tabla de Contenidos

1. [Estructura Basica de un Workflow](#1-estructura-basica-de-un-workflow)
2. [Estructura de Nodos](#2-estructura-de-nodos)
3. [Sistema de Conexiones](#3-sistema-de-conexiones)
4. [Tipos de Propiedades de Nodos](#4-tipos-de-propiedades-de-nodos)
5. [Nodos Trigger (Disparadores)](#5-nodos-trigger-disparadores)
6. [Nodos Core Comunes](#6-nodos-core-comunes)
7. [Validacion de Estructuras](#7-validacion-de-estructuras)
8. [Ejemplos Completos de Workflows](#8-ejemplos-completos-de-workflows)
9. [Mejores Practicas](#9-mejores-practicas)
10. [Recursos Adicionales](#10-recursos-adicionales)

---

## 1. Estructura Basica de un Workflow

Un workflow de n8n es un grafo aciclico dirigido (DAG) almacenado en formato JSON. Cada workflow contiene definiciones de nodos, conexiones y metadatos.

### Plantilla JSON Minima

```json
{
  "name": "Mi Workflow",
  "nodes": [],
  "connections": {},
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "1",
  "meta": {
    "instanceId": "unique-instance-id"
  },
  "tags": []
}
```

### Campos Principales del Workflow

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `name` | string | Si | Nombre descriptivo del workflow |
| `nodes` | array | Si | Array de objetos de nodo |
| `connections` | object | Si | Mapa de conexiones entre nodos |
| `active` | boolean | No | Si el workflow esta activo (default: false) |
| `settings` | object | No | Configuraciones del workflow |
| `versionId` | string | No | Version del workflow |
| `meta` | object | No | Metadatos adicionales |
| `tags` | array | No | Etiquetas para organizacion |
| `pinData` | object | No | Datos fijados para pruebas |

### Configuraciones del Workflow (settings)

```json
{
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "saveExecutionProgress": true,
    "timezone": "America/New_York",
    "errorWorkflow": "workflow-id-para-errores"
  }
}
```

---

## 2. Estructura de Nodos

### Plantilla de Nodo Basica

```json
{
  "id": "uuid-unico",
  "name": "Nombre del Nodo",
  "type": "n8n-nodes-base.nombreNodo",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {},
  "credentials": {},
  "disabled": false,
  "notes": "",
  "notesInFlow": false
}
```

### Campos del Nodo

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | Si | Identificador unico (UUID) |
| `name` | string | Si | Nombre visible del nodo |
| `type` | string | Si | Tipo del nodo (ej: `n8n-nodes-base.httpRequest`) |
| `typeVersion` | number | Si | Version del tipo de nodo |
| `position` | [x, y] | Si | Posicion en el canvas [x, y] |
| `parameters` | object | Si | Parametros de configuracion del nodo |
| `credentials` | object | No | Referencias a credenciales |
| `disabled` | boolean | No | Si el nodo esta deshabilitado |
| `notes` | string | No | Notas adicionales |
| `notesInFlow` | boolean | No | Mostrar notas en el flujo |

### Tipos de Nodo Comunes

```
# Nodos Trigger
n8n-nodes-base.manualTrigger        - Disparo manual
n8n-nodes-base.scheduleTrigger      - Disparo programado
n8n-nodes-base.webhook              - Webhook HTTP
n8n-nodes-base.formTrigger          - Formulario web
n8n-nodes-base.emailTrigger         - Email entrante
n8n-nodes-base.errorTrigger         - Trigger de errores

# Nodos Core
n8n-nodes-base.httpRequest          - Peticiones HTTP
n8n-nodes-base.set                  - Establecer/editar campos
n8n-nodes-base.code                 - Codigo JavaScript/Python
n8n-nodes-base.function             - Funcion JavaScript
n8n-nodes-base.if                   - Condicion If
n8n-nodes-base.switch               - Switch multi-ruta
n8n-nodes-base.merge                - Combinar datos
n8n-nodes-base.splitInBatches       - Procesar en lotes
n8n-nodes-base.wait                 - Esperar/pausar
n8n-nodes-base.noOp                 - Sin operacion (pasar datos)
n8n-nodes-base.respondToWebhook     - Responder a webhook

# Nodos de Datos
n8n-nodes-base.spreadsheetFile      - Archivos Excel/CSV
n8n-nodes-base.readWriteFile        - Leer/escribir archivos
n8n-nodes-base.crypto               - Encriptacion/hash
n8n-nodes-base.dateTime             - Manipulacion de fechas
n8n-nodes-base.html                 - Extraer HTML
n8n-nodes-base.xml                  - Procesar XML
n8n-nodes-base.markdown             - Convertir Markdown
```

---

## 3. Sistema de Conexiones

### Estructura de Conexiones

Las conexiones definen el flujo de datos entre nodos. Cada clave es el nombre del nodo origen.

```json
{
  "connections": {
    "NodoOrigen": {
      "main": [
        [
          {
            "node": "NodoDestino",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Anatomia de una Conexion

| Campo | Descripcion |
|-------|-------------|
| `node` | Nombre del nodo destino |
| `type` | Tipo de conexion (generalmente "main") |
| `index` | Indice del input en el nodo destino |

### Conexiones con Multiples Salidas (If/Switch)

Para nodos con multiples salidas como `If` o `Switch`:

```json
{
  "connections": {
    "IF": {
      "main": [
        [
          { "node": "NodoTrue", "type": "main", "index": 0 }
        ],
        [
          { "node": "NodoFalse", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

### Conexiones con Multiples Destinos

Un nodo puede enviar datos a multiples destinos:

```json
{
  "connections": {
    "Webhook": {
      "main": [
        [
          { "node": "Procesar", "type": "main", "index": 0 },
          { "node": "Logging", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

---

## 4. Tipos de Propiedades de Nodos

### Categorias de Tipos

Basado en el sistema de validacion de n8n-MCP, existen 22 tipos de propiedades organizados en 6 categorias:

#### Tipos Primitivos

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `string` | Texto | `"Hola mundo"` |
| `number` | Numerico | `42`, `3.14` |
| `boolean` | Verdadero/Falso | `true`, `false` |
| `dateTime` | Fecha ISO 8601 | `"2024-01-15T10:30:00Z"` |
| `color` | Hexadecimal 6 digitos | `"#FF5733"` |
| `json` | JSON parseble | `"{\"key\": \"value\"}"` |

#### Tipos de Opciones

| Tipo | Descripcion |
|------|-------------|
| `options` | Seleccion unica de lista predefinida |
| `multiOptions` | Selecciones multiples de opciones |

#### Tipos de Coleccion

| Tipo | Descripcion |
|------|-------------|
| `collection` | Grupo flexible de propiedades relacionadas |
| `fixedCollection` | Coleccion con grupos predefinidos |

#### Tipos Especiales de n8n

| Tipo | Descripcion | Uso |
|------|-------------|-----|
| `resourceLocator` | Localiza recursos por ID, nombre o URL | Seleccion de documentos, archivos |
| `resourceMapper` | Mapea campos de entrada a campos de recurso | Transformacion de datos |
| `filter` | Condiciones de filtrado con logica booleana | Filtrar datos |
| `assignmentCollection` | Asignaciones de variables con expresiones | Establecer multiples valores |

#### Tipos de Credenciales

| Tipo | Descripcion |
|------|-------------|
| `credentials` | Referencia a configuracion de autenticacion |
| `credentialsSelect` | Selecciona de credenciales disponibles |

#### Tipos de UI

| Tipo | Descripcion |
|------|-------------|
| `hidden` | Propiedades internas no visibles |
| `button` | Boton interactivo |
| `notice` | Mensaje informativo |
| `workflowSelector` | Selector de workflows |
| `curlImport` | Importador de comandos cURL |

### Estructuras de Validacion Especiales

#### FilterValue (Condiciones de Filtrado)

```json
{
  "filter": {
    "combinator": "and",
    "conditions": [
      {
        "leftValue": "={{ $json.field }}",
        "operator": {
          "operation": "equals",
          "type": "string"
        },
        "rightValue": "valor"
      }
    ]
  }
}
```

**Operadores disponibles (40+):**
- String: `equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `regex`, `isEmpty`
- Number: `equals`, `gt`, `gte`, `lt`, `lte`, `between`
- Boolean: `isTrue`, `isFalse`
- Date: `before`, `after`, `between`

#### ResourceMapperValue (Mapeo de Recursos)

```json
{
  "resourceMapper": {
    "mode": "autoMap",
    "schema": [
      {
        "id": "campo1",
        "displayName": "Campo 1",
        "type": "string",
        "required": true
      }
    ],
    "mappingMode": "defineBelow",
    "value": {
      "campo1": "={{ $json.origen }}"
    }
  }
}
```

#### AssignmentCollectionValue (Asignaciones)

```json
{
  "assignments": {
    "assignments": [
      {
        "name": "nuevoCampo",
        "type": "string",
        "value": "={{ $json.campo }}"
      }
    ]
  }
}
```

---

## 5. Nodos Trigger (Disparadores)

### Manual Trigger

El nodo mas simple para iniciar workflows manualmente.

```json
{
  "id": "manual-trigger-1",
  "name": "Inicio Manual",
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [100, 300],
  "parameters": {}
}
```

**Nota:** Los workflows con solo Manual Trigger no pueden activarse permanentemente.

### Schedule Trigger (Programado)

Para ejecutar workflows en intervalos especificos.

```json
{
  "id": "schedule-1",
  "name": "Cada 5 Minutos",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [100, 300],
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "minutes",
          "minutesInterval": 5
        }
      ]
    }
  }
}
```

#### Opciones de Intervalo

**Por Segundos:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "seconds",
        "secondsInterval": 30
      }
    ]
  }
}
```

**Por Minutos:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "minutes",
        "minutesInterval": 15
      }
    ]
  }
}
```

**Por Horas:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 2,
        "triggerAtMinute": 30
      }
    ]
  }
}
```

**Por Dias:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "days",
        "daysInterval": 1,
        "triggerAtHour": 9,
        "triggerAtMinute": 0
      }
    ]
  }
}
```

**Por Semanas:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "weeks",
        "weeksInterval": 1,
        "triggerAtDay": ["monday", "wednesday", "friday"],
        "triggerAtHour": 8,
        "triggerAtMinute": 0
      }
    ]
  }
}
```

**Expresion Cron Personalizada:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "cronExpression",
        "expression": "0 9 * * 1"
      }
    ]
  }
}
```

Formato Cron: `(Minuto) (Hora) (Dia del Mes) (Mes) (Dia de la Semana)`
- `0 9 * * 1` = Lunes a las 9:00 AM
- `*/15 * * * *` = Cada 15 minutos
- `0 0 1 * *` = Primer dia de cada mes a medianoche

### Webhook Trigger

Para recibir peticiones HTTP externas.

```json
{
  "id": "webhook-1",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [100, 300],
  "webhookId": "unique-webhook-id",
  "parameters": {
    "path": "mi-webhook",
    "httpMethod": "POST",
    "authentication": "none",
    "responseMode": "onReceived",
    "responseCode": 200,
    "responseData": "allEntries"
  }
}
```

#### Parametros del Webhook

| Parametro | Opciones | Descripcion |
|-----------|----------|-------------|
| `path` | string | Ruta URL del webhook |
| `httpMethod` | GET, POST, PUT, PATCH, DELETE, HEAD | Metodo HTTP aceptado |
| `authentication` | none, basicAuth, headerAuth, jwtAuth | Tipo de autenticacion |
| `responseMode` | onReceived, lastNode, responseNode | Cuando enviar respuesta |
| `responseCode` | number | Codigo de respuesta HTTP |
| `responseData` | allEntries, firstEntryJson, firstEntryBinary, noData | Datos de respuesta |
| `options.allowedOrigins` | string | CORS origins permitidos |

#### Webhook con Autenticacion Basica

```json
{
  "parameters": {
    "path": "webhook-seguro",
    "httpMethod": "POST",
    "authentication": "basicAuth"
  },
  "credentials": {
    "httpBasicAuth": {
      "id": "1",
      "name": "Basic Auth"
    }
  }
}
```

#### Webhook con Header Auth

```json
{
  "parameters": {
    "path": "webhook-api",
    "httpMethod": "POST",
    "authentication": "headerAuth"
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "2",
      "name": "Header Auth"
    }
  }
}
```

---

## 6. Nodos Core Comunes

### HTTP Request

Para hacer peticiones a APIs externas.

```json
{
  "id": "http-1",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [400, 300],
  "parameters": {
    "method": "GET",
    "url": "https://api.ejemplo.com/datos",
    "authentication": "none",
    "options": {}
  }
}
```

#### Metodos HTTP y Ejemplos

**GET Request:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.ejemplo.com/users",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        { "name": "limit", "value": "10" },
        { "name": "offset", "value": "0" }
      ]
    }
  }
}
```

**POST Request con JSON:**
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.ejemplo.com/users",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        { "name": "name", "value": "={{ $json.nombre }}" },
        { "name": "email", "value": "={{ $json.email }}" }
      ]
    },
    "contentType": "json"
  }
}
```

**POST Request con Body Raw JSON:**
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.ejemplo.com/data",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json) }}"
  }
}
```

**Con Headers Personalizados:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.ejemplo.com/protected",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Authorization", "value": "Bearer {{ $credentials.token }}" },
        { "name": "Content-Type", "value": "application/json" }
      ]
    }
  }
}
```

**Con Autenticacion:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.ejemplo.com/data",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "oAuth2Api"
  },
  "credentials": {
    "oAuth2Api": {
      "id": "5",
      "name": "OAuth2 Credential"
    }
  }
}
```

### Set / Edit Fields

Para establecer o modificar campos en los datos.

```json
{
  "id": "set-1",
  "name": "Edit Fields",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [600, 300],
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "field-1",
          "name": "nombreCompleto",
          "type": "string",
          "value": "={{ $json.nombre }} {{ $json.apellido }}"
        },
        {
          "id": "field-2",
          "name": "timestamp",
          "type": "string",
          "value": "={{ $now.toISO() }}"
        }
      ]
    },
    "includeOtherFields": true,
    "options": {}
  }
}
```

#### Modos del Set Node

**Manual (Definir campos):**
```json
{
  "parameters": {
    "mode": "manual",
    "assignments": {
      "assignments": [
        { "name": "campo", "type": "string", "value": "valor" }
      ]
    }
  }
}
```

**Raw JSON:**
```json
{
  "parameters": {
    "mode": "raw",
    "jsonOutput": "={{ { id: $json.id, processed: true } }}"
  }
}
```

### Code Node

Para ejecutar codigo JavaScript o Python personalizado.

```json
{
  "id": "code-1",
  "name": "Code",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [500, 300],
  "parameters": {
    "mode": "runOnceForAllItems",
    "language": "javaScript",
    "jsCode": "// Procesar todos los items\nconst results = [];\n\nfor (const item of $input.all()) {\n  results.push({\n    json: {\n      ...item.json,\n      processed: true,\n      timestamp: new Date().toISOString()\n    }\n  });\n}\n\nreturn results;"
  }
}
```

#### Modos de Ejecucion

**Una vez para todos los items:**
```json
{
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "return $input.all().map(item => ({ json: { ...item.json, processed: true } }));"
  }
}
```

**Una vez por cada item:**
```json
{
  "parameters": {
    "mode": "runOnceForEachItem",
    "jsCode": "return { json: { ...$input.item.json, processed: true } };"
  }
}
```

#### Variables Disponibles en Code Node

```javascript
// Acceso a items de entrada
$input.all()           // Todos los items
$input.first()         // Primer item
$input.last()          // Ultimo item
$input.item            // Item actual (en modo runOnceForEachItem)

// Datos de otros nodos
$('NombreNodo').all()  // Items del nodo especificado
$('NombreNodo').first()

// Variables globales del workflow
$execution.id          // ID de ejecucion
$workflow.id           // ID del workflow
$workflow.name         // Nombre del workflow
$now                   // Fecha/hora actual

// Metodos de utilidad
$json                  // Acceso rapido a item.json actual
$binary                // Datos binarios
```

### IF Node (Condicional)

Para crear ramificaciones basadas en condiciones.

```json
{
  "id": "if-1",
  "name": "IF",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.1,
  "position": [500, 300],
  "parameters": {
    "conditions": {
      "options": {
        "leftValue": "",
        "typeValidation": "strict"
      },
      "combinator": "and",
      "conditions": [
        {
          "id": "condition-1",
          "leftValue": "={{ $json.status }}",
          "rightValue": "active",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ]
    }
  }
}
```

#### Operadores de Condicion

**String:**
- `equals`, `notEquals`
- `contains`, `notContains`
- `startsWith`, `endsWith`
- `regex`
- `isEmpty`, `isNotEmpty`

**Number:**
- `equals`, `notEquals`
- `gt` (mayor que), `gte` (mayor o igual)
- `lt` (menor que), `lte` (menor o igual)

**Boolean:**
- `isTrue`, `isFalse`
- `isNull`, `isNotNull`

#### Multiples Condiciones

```json
{
  "parameters": {
    "conditions": {
      "combinator": "or",
      "conditions": [
        {
          "leftValue": "={{ $json.role }}",
          "rightValue": "admin",
          "operator": { "type": "string", "operation": "equals" }
        },
        {
          "leftValue": "={{ $json.permissions }}",
          "rightValue": "full",
          "operator": { "type": "string", "operation": "contains" }
        }
      ]
    }
  }
}
```

### Switch Node

Para multiples rutas basadas en un valor.

```json
{
  "id": "switch-1",
  "name": "Switch",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3.2,
  "position": [500, 300],
  "parameters": {
    "mode": "rules",
    "rules": {
      "values": [
        {
          "outputKey": "Ruta1",
          "conditions": {
            "combinator": "and",
            "conditions": [
              {
                "leftValue": "={{ $json.type }}",
                "rightValue": "email",
                "operator": { "type": "string", "operation": "equals" }
              }
            ]
          }
        },
        {
          "outputKey": "Ruta2",
          "conditions": {
            "combinator": "and",
            "conditions": [
              {
                "leftValue": "={{ $json.type }}",
                "rightValue": "sms",
                "operator": { "type": "string", "operation": "equals" }
              }
            ]
          }
        }
      ]
    },
    "fallbackOutput": "extra"
  }
}
```

### Merge Node

Para combinar datos de multiples fuentes.

```json
{
  "id": "merge-1",
  "name": "Merge",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "position": [700, 300],
  "parameters": {
    "mode": "combine",
    "mergeByFields": {
      "values": [
        { "field1": "id", "field2": "userId" }
      ]
    },
    "joinMode": "keepMatches",
    "options": {}
  }
}
```

#### Modos de Merge

| Modo | Descripcion |
|------|-------------|
| `append` | Concatenar todos los items |
| `combine` | Combinar por campos coincidentes |
| `chooseBranch` | Elegir una rama basado en condicion |
| `multiplex` | Crear todas las combinaciones posibles |

### Wait Node

Para pausar la ejecucion.

```json
{
  "id": "wait-1",
  "name": "Wait",
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1.1,
  "position": [600, 300],
  "parameters": {
    "resume": "timeInterval",
    "amount": 5,
    "unit": "seconds"
  }
}
```

**Unidades disponibles:** `seconds`, `minutes`, `hours`, `days`

### Respond to Webhook

Para enviar respuestas personalizadas a webhooks.

```json
{
  "id": "respond-1",
  "name": "Respond to Webhook",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1.1,
  "position": [800, 300],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ { success: true, data: $json } }}",
    "options": {
      "responseCode": 200,
      "responseHeaders": {
        "entries": [
          { "name": "X-Custom-Header", "value": "valor" }
        ]
      }
    }
  }
}
```

#### Opciones de Respuesta

| respondWith | Descripcion |
|-------------|-------------|
| `allIncomingItems` | Todos los items entrantes |
| `firstIncomingItem` | Primer item |
| `json` | JSON personalizado |
| `text` | Texto plano/HTML |
| `binary` | Archivo binario |
| `redirect` | Redireccion URL |
| `noData` | Sin contenido (204) |

---

## 7. Validacion de Estructuras

### Sistema de Validacion Automatica

El sistema de n8n valida automaticamente las configuraciones complejas de nodos sin configuracion adicional.

### Tipos con Validacion Especial

#### 1. Filter (FilterValue)

```json
{
  "typeStructure": "filter",
  "combinator": "and|or",
  "conditions": [
    {
      "leftValue": "expresion",
      "operator": {
        "type": "string|number|boolean|date",
        "operation": "operacion"
      },
      "rightValue": "valor"
    }
  ]
}
```

#### 2. ResourceMapper

```json
{
  "typeStructure": "resourceMapper",
  "mode": "autoMap|defineBelow",
  "schema": [],
  "value": {}
}
```

#### 3. AssignmentCollection

```json
{
  "typeStructure": "assignmentCollection",
  "assignments": [
    {
      "name": "campo",
      "type": "string|number|boolean",
      "value": "valor|expresion"
    }
  ]
}
```

#### 4. ResourceLocator

```json
{
  "typeStructure": "resourceLocator",
  "mode": "id|name|url|list",
  "value": "identificador"
}
```

### Metricas de Validacion (n8n-MCP)

- **776 validaciones totales** contra 91 templates
- **100% tasa de exito** sin falsos positivos
- **0.01ms promedio** de tiempo de validacion

---

## 8. Ejemplos Completos de Workflows

### Ejemplo 1: Webhook Simple con Respuesta

```json
{
  "name": "Webhook Simple",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300],
      "webhookId": "abc123",
      "parameters": {
        "path": "proceso",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "id": "set-1",
      "name": "Procesar Datos",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [450, 300],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "1",
              "name": "mensaje",
              "type": "string",
              "value": "Datos recibidos: {{ $json.nombre }}"
            },
            {
              "id": "2",
              "name": "timestamp",
              "type": "string",
              "value": "={{ $now.toISO() }}"
            }
          ]
        }
      }
    },
    {
      "id": "respond-1",
      "name": "Responder",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [650, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, mensaje: $json.mensaje, timestamp: $json.timestamp } }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Procesar Datos", "type": "main", "index": 0 }]]
    },
    "Procesar Datos": {
      "main": [[{ "node": "Responder", "type": "main", "index": 0 }]]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Ejemplo 2: Workflow Programado con API

```json
{
  "name": "Reporte Diario",
  "nodes": [
    {
      "id": "schedule-1",
      "name": "Cada Dia 9AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "days",
              "daysInterval": 1,
              "triggerAtHour": 9,
              "triggerAtMinute": 0
            }
          ]
        }
      }
    },
    {
      "id": "http-1",
      "name": "Obtener Datos",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.ejemplo.com/metricas",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth"
      },
      "credentials": {
        "httpHeaderAuth": {
          "id": "1",
          "name": "API Key"
        }
      }
    },
    {
      "id": "code-1",
      "name": "Procesar Metricas",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "const items = $input.all();\nconst metricas = items[0].json;\n\nconst resumen = {\n  total: metricas.length,\n  activos: metricas.filter(m => m.status === 'active').length,\n  fecha: new Date().toISOString().split('T')[0]\n};\n\nreturn [{ json: resumen }];"
      }
    },
    {
      "id": "http-2",
      "name": "Enviar Reporte",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [850, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.slack.com/webhook",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ { text: 'Reporte: ' + $json.total + ' registros, ' + $json.activos + ' activos' } }}"
      }
    }
  ],
  "connections": {
    "Cada Dia 9AM": {
      "main": [[{ "node": "Obtener Datos", "type": "main", "index": 0 }]]
    },
    "Obtener Datos": {
      "main": [[{ "node": "Procesar Metricas", "type": "main", "index": 0 }]]
    },
    "Procesar Metricas": {
      "main": [[{ "node": "Enviar Reporte", "type": "main", "index": 0 }]]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "timezone": "America/New_York"
  }
}
```

### Ejemplo 3: Workflow con Ramificacion Condicional

```json
{
  "name": "Procesador de Ordenes",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Recibir Orden",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300],
      "webhookId": "ordenes-123",
      "parameters": {
        "path": "ordenes",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      }
    },
    {
      "id": "if-1",
      "name": "Verificar Monto",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.1,
      "position": [450, 300],
      "parameters": {
        "conditions": {
          "combinator": "and",
          "conditions": [
            {
              "id": "1",
              "leftValue": "={{ $json.monto }}",
              "rightValue": 1000,
              "operator": {
                "type": "number",
                "operation": "gte"
              }
            }
          ]
        }
      }
    },
    {
      "id": "set-alto",
      "name": "Orden Alto Valor",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [650, 200],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "1",
              "name": "prioridad",
              "type": "string",
              "value": "alta"
            },
            {
              "id": "2",
              "name": "requiereAprobacion",
              "type": "boolean",
              "value": "={{ true }}"
            }
          ]
        },
        "includeOtherFields": true
      }
    },
    {
      "id": "set-normal",
      "name": "Orden Normal",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [650, 400],
      "parameters": {
        "mode": "manual",
        "assignments": {
          "assignments": [
            {
              "id": "1",
              "name": "prioridad",
              "type": "string",
              "value": "normal"
            },
            {
              "id": "2",
              "name": "requiereAprobacion",
              "type": "boolean",
              "value": "={{ false }}"
            }
          ]
        },
        "includeOtherFields": true
      }
    },
    {
      "id": "merge-1",
      "name": "Unir Resultados",
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3,
      "position": [850, 300],
      "parameters": {
        "mode": "append"
      }
    }
  ],
  "connections": {
    "Recibir Orden": {
      "main": [[{ "node": "Verificar Monto", "type": "main", "index": 0 }]]
    },
    "Verificar Monto": {
      "main": [
        [{ "node": "Orden Alto Valor", "type": "main", "index": 0 }],
        [{ "node": "Orden Normal", "type": "main", "index": 0 }]
      ]
    },
    "Orden Alto Valor": {
      "main": [[{ "node": "Unir Resultados", "type": "main", "index": 0 }]]
    },
    "Orden Normal": {
      "main": [[{ "node": "Unir Resultados", "type": "main", "index": 1 }]]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Ejemplo 4: Workflow con Procesamiento en Lotes

```json
{
  "name": "Procesador de Lotes",
  "nodes": [
    {
      "id": "manual-1",
      "name": "Inicio",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {}
    },
    {
      "id": "http-1",
      "name": "Obtener Lista",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.ejemplo.com/items"
      }
    },
    {
      "id": "split-1",
      "name": "Procesar en Lotes",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [650, 300],
      "parameters": {
        "batchSize": 10,
        "options": {}
      }
    },
    {
      "id": "http-2",
      "name": "Actualizar Item",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [850, 300],
      "parameters": {
        "method": "PUT",
        "url": "=https://api.ejemplo.com/items/{{ $json.id }}",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "procesado", "value": "true" }
          ]
        }
      }
    },
    {
      "id": "wait-1",
      "name": "Esperar",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [1050, 300],
      "parameters": {
        "resume": "timeInterval",
        "amount": 1,
        "unit": "seconds"
      }
    }
  ],
  "connections": {
    "Inicio": {
      "main": [[{ "node": "Obtener Lista", "type": "main", "index": 0 }]]
    },
    "Obtener Lista": {
      "main": [[{ "node": "Procesar en Lotes", "type": "main", "index": 0 }]]
    },
    "Procesar en Lotes": {
      "main": [[{ "node": "Actualizar Item", "type": "main", "index": 0 }]]
    },
    "Actualizar Item": {
      "main": [[{ "node": "Esperar", "type": "main", "index": 0 }]]
    },
    "Esperar": {
      "main": [[{ "node": "Procesar en Lotes", "type": "main", "index": 0 }]]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  }
}
```

---

## 9. Mejores Practicas

### Estructura del Workflow

1. **Siempre comenzar con un nodo Trigger**
   - Manual Trigger para pruebas
   - Schedule Trigger para tareas programadas
   - Webhook para integraciones externas

2. **Nombrar nodos descriptivamente**
   - Usar nombres que describan la accion
   - Evitar nombres genericos como "HTTP Request 1"

3. **Organizar visualmente**
   - Flujo de izquierda a derecha
   - Agrupar nodos relacionados
   - Usar posiciones consistentes

### Manejo de Datos

1. **Estructura de datos de n8n**
   ```javascript
   // Los datos fluyen como arrays de items
   [
     { json: { campo1: "valor1" }, binary: {} },
     { json: { campo1: "valor2" }, binary: {} }
   ]
   ```

2. **Expresiones comunes**
   ```javascript
   // Acceso a datos del item actual
   {{ $json.campo }}

   // Acceso a datos de otros nodos
   {{ $('NombreNodo').first().json.campo }}

   // Fecha/hora actual
   {{ $now.toISO() }}
   {{ $now.format('yyyy-MM-dd') }}

   // Condicionales
   {{ $json.valor ? 'Si' : 'No' }}
   ```

3. **Transformacion de datos**
   - Usar Set node para campos simples
   - Usar Code node para transformaciones complejas
   - Evitar sobre-procesamiento

### Seguridad

1. **Autenticacion de Webhooks**
   - Siempre usar autenticacion en produccion
   - Preferir Header Auth o JWT sobre Basic Auth
   - Configurar CORS apropiadamente

2. **Credenciales**
   - Nunca hardcodear secretos en parametros
   - Usar el sistema de credenciales de n8n
   - Referenciar con `{{ $credentials.campo }}`

3. **Validacion de entrada**
   - Validar datos de webhooks
   - Usar IF nodes para verificar datos esperados
   - Manejar casos de error

### Rendimiento

1. **Procesamiento en lotes**
   - Usar Split In Batches para grandes volumenes
   - Agregar Wait nodes para rate limiting
   - Considerar limites de API externas

2. **Optimizacion de HTTP Requests**
   - Reutilizar conexiones cuando sea posible
   - Implementar retry con backoff exponencial
   - Cachear datos cuando sea apropiado

### Depuracion

1. **Pinned Data**
   - Usar datos fijados para pruebas consistentes
   - Documentar casos de prueba

2. **Manejo de errores**
   - Configurar Error Workflow para notificaciones
   - Usar Error Trigger para recuperacion
   - Logging de respuestas API

---

## 10. Recursos Adicionales

### Documentacion Oficial

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Nodes Library](https://docs.n8n.io/integrations/)
- [n8n Workflow Templates](https://n8n.io/workflows/)

### Herramientas MCP

El proyecto [n8n-MCP](https://github.com/czlonkowski/n8n-mcp) proporciona:

- **1,084 nodos** documentados (537 core + 547 community)
- **2,709 templates** de workflows
- **20 herramientas MCP** para interaccion con IA

#### Herramientas Principales

| Herramienta | Descripcion |
|-------------|-------------|
| `search_nodes` | Busqueda full-text con configuraciones de ejemplo |
| `get_node` | Obtener detalles del nodo (minimal/standard/full) |
| `validate_node` | Validar configuracion de nodo |
| `search_templates` | Buscar templates por keyword, tarea o nodos |
| `get_template` | Obtener JSON completo del workflow |

### Expresiones Cron Comunes

| Expresion | Descripcion |
|-----------|-------------|
| `* * * * *` | Cada minuto |
| `*/15 * * * *` | Cada 15 minutos |
| `0 * * * *` | Cada hora |
| `0 9 * * *` | Diario a las 9 AM |
| `0 9 * * 1` | Lunes a las 9 AM |
| `0 0 1 * *` | Primer dia del mes |
| `0 0 * * 0` | Domingos a medianoche |

### Generadores de Cron

- [crontab guru](https://crontab.guru/) - Generador visual de expresiones cron

---

## Changelog

### 2026-01-20 - v1.0.0
- Documento inicial creado
- Estructura basica de workflows documentada
- Nodos core principales incluidos
- Ejemplos de workflows completos
- Mejores practicas establecidas

---

**Nota:** Este documento se actualiza regularmente. Verificar siempre la documentacion oficial de n8n para las ultimas actualizaciones de API y parametros de nodos.
