# N8N Workflow Replicator - User Guide

> **Sistema de replicacion de workflows de n8n a partir de imagenes o transcripciones de video**

## Como Usar Este Sistema

Este sistema te permite replicar workflows de n8n de manera exacta a partir de:
- **Imagenes/Screenshots** de workflows en n8n
- **Transcripciones de videos** explicando workflows
- **Descripciones textuales** de flujos de trabajo

### Paso 1: Proporciona la Fuente

**Opcion A - Imagen:**
Envia una imagen/screenshot del workflow de n8n. El sistema analizara:
- Los nodos visibles y sus tipos
- Las conexiones entre nodos
- Los nombres de los nodos
- La estructura general del flujo

**Opcion B - Transcripcion de Video:**
Proporciona la transcripcion del video explicando el workflow. Incluye detalles como:
- Que nodos se mencionan
- Como se conectan
- Que configuraciones tienen
- Que servicios utilizan

**Opcion C - Descripcion Textual:**
Describe el workflow que necesitas:
- Cual es el trigger (como inicia)
- Que pasos sigue el flujo
- Que servicios/APIs usa
- Que outputs esperas

### Paso 2: Analisis y Generacion

El sistema:
1. Identifica todos los nodos necesarios
2. Determina las conexiones correctas
3. Configura los parametros de cada nodo
4. Genera el JSON completo listo para importar

### Paso 3: Importar en n8n

1. Copia el JSON generado
2. En n8n, ve a **Workflows** > **Import from File**
3. Pega el JSON o importa el archivo
4. Configura las credenciales necesarias
5. Activa el workflow

---

## Tipos de Workflows Soportados

### 1. Procesamiento de Emails
- Trigger por IMAP/Gmail
- Extraccion de adjuntos
- Analisis con IA
- Guardado en base de datos

### 2. Bots de Telegram
- Respuesta a mensajes
- Procesamiento de imagenes
- Transcripcion de audio
- Menus interactivos con botones

### 3. Automatizacion de Documentos
- Lectura de Google Sheets
- Creacion de documentos
- Conversion de formatos
- Almacenamiento en Drive

### 4. Integraciones con IA
- ChatGPT/OpenAI
- Analisis de imagenes
- Transcripcion de audio (Whisper)
- Procesamiento de lenguaje natural

### 5. Webhooks y APIs
- Recepcion de webhooks
- Llamadas a APIs externas
- Transformacion de datos
- Sincronizacion entre servicios

### 6. Schedulers y Cron Jobs
- Tareas programadas
- Recordatorios automaticos
- Reportes periodicos
- Mantenimiento de datos

---

## Estructura de Solicitud Recomendada

Para obtener el mejor resultado, proporciona la siguiente informacion:

```
## Descripcion del Workflow

**Nombre:** [Nombre descriptivo]

**Trigger:** [Como inicia el workflow]
- Tipo: webhook/schedule/email/telegram/manual
- Configuracion especifica

**Pasos del Flujo:**
1. [Primer paso]
2. [Segundo paso]
3. [Tercer paso]
...

**Servicios Externos:**
- [Servicio 1]: [Para que se usa]
- [Servicio 2]: [Para que se usa]

**Outputs Esperados:**
- [Que debe hacer el workflow al finalizar]
```

---

## Ejemplos de Solicitudes

### Ejemplo 1: Workflow Simple

```
Necesito un workflow que:
1. Se active con un webhook
2. Reciba datos JSON con nombre y email
3. Guarde los datos en Google Sheets
4. Envie un email de confirmacion
```

### Ejemplo 2: Workflow con IA

```
Quiero un bot de Telegram que:
1. Reciba imagenes de recibos
2. Use OpenAI Vision para extraer datos
3. Guarde en Supabase
4. Confirme por Telegram con los datos extraidos
```

### Ejemplo 3: Workflow Programado

```
Automatizacion diaria que:
1. Se ejecute cada dia a las 9am
2. Lea registros pendientes de Supabase
3. Envie recordatorios por Telegram
4. Marque los registros como notificados
```

---

## Notas Importantes

### Sobre Credenciales
- Los workflows generados tienen los campos de credenciales vacios (`"id": ""`)
- Debes configurar tus propias credenciales en n8n despues de importar
- Los nombres de credenciales son sugerencias, puedes usar los que prefieras

### Sobre IDs de Recursos
- Los IDs de Google Sheets, Drive folders, etc. estan en blanco
- Reemplaza `YOUR_GOOGLE_SHEET_ID` con tu ID real
- Reemplaza `YOUR_GOOGLE_DRIVE_FOLDER_ID` con tu folder ID

### Sobre Posiciones
- Las posiciones de nodos estan optimizadas para visualizacion
- Puedes reorganizar los nodos en el canvas de n8n

### Sobre Versiones
- Los tipos de nodos usan versiones recientes y estables
- Si tu version de n8n es diferente, algunos nodos pueden necesitar ajustes

---

## Resolucion de Problemas Comunes

### Error: "Unknown node type"
- Tu version de n8n puede no tener ese nodo
- Busca el nodo equivalente en tu version

### Error: "Credential not found"
- Crea la credencial en n8n primero
- Asegurate que el tipo de credencial coincida

### Error: "Cannot read property of undefined"
- Revisa que los nombres de nodos referenciados existan
- Verifica que las expresiones `$('Node Name')` sean correctas

### El workflow no se activa
- Para triggers de webhook: verifica que la URL sea accesible
- Para triggers de schedule: asegurate que el workflow este activo
- Para triggers de email: verifica las credenciales IMAP

---

## Recursos Adicionales

- **Documentacion n8n:** https://docs.n8n.io
- **Comunidad n8n:** https://community.n8n.io
- **Templates n8n:** https://n8n.io/workflows

---

## Mejores Practicas

1. **Nombrar nodos descriptivamente** - Facilita el mantenimiento
2. **Usar variables de entorno** - Para datos sensibles
3. **Implementar manejo de errores** - Con nodos IF para validaciones
4. **Documentar el workflow** - Usar notas/sticky notes en n8n
5. **Probar incrementalmente** - Ejecutar manualmente paso a paso
6. **Hacer backup** - Exportar workflows regularmente

---

*Este sistema esta disenado para replicar workflows de manera exacta. Para workflows complejos, proporciona la mayor cantidad de detalles posible.*
