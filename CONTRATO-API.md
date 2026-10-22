---
tipo: contrato
tags: [contrato, api, backend, frontend]
---

# CONTRATO-API

> Fuente única de verdad para el trabajo en paralelo entre frontend y backend. **Antes de modificar este archivo, avisar al equipo.** Toda tarea de los backlogs que toca la API depende de este contrato.

**Proyecto:** [[CONTEXTO_MAESTRO]] — Asistente inteligente de estructuración logística (NOA).
**Stack:** React (Vite) → API Express (Node) → PostgreSQL en Supabase · IA: Google Gemini.

---

## 1. Configuración base

| Item | Valor |
|---|---|
| Base URL (dev) | `http://localhost:3001/api` |
| Frontend dev | `http://localhost:5173` |
| Auth | `Authorization: Bearer <supabase_access_token>` (Supabase Auth JWT) |
| Formato | `application/json` en request y response |

### Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | backend | API key de Google AI Studio |
| `SUPABASE_URL` | backend + frontend | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | backend + frontend | Key pública (respeta RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | solo backend | Admin — **nunca** exponer al front |
| `PORT` | backend | Puerto de la API (default `3001`) |
| `VITE_API_URL` | frontend | URL base de la API (`http://localhost:3001/api`) |
| `VITE_SUPABASE_URL` | frontend | Igual que `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | frontend | Igual que `SUPABASE_ANON_KEY` |

### Formato de error estándar

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Texto legible para humanos" } }
```

HTTP codes: `400` input inválido · `401` sin/invalid token · `404` no encontrado · `502` Gemini caído · `500` resto.

---

## 2. Schemas de dominio

### 2.1 `FichaTecnica` (objeto central de toda la app)

Campos ausentes en el texto original llegan como `null` — **nunca** se inventan datos.

```json
{
  "contacto": {
    "nombre": "string | null",
    "empresa": "string | null"
  },
  "operacion": "exportacion | importacion | null",
  "origen": {
    "ciudad": "string | null",
    "provincia": "string | null"
  },
  "destino": {
    "ciudad": "string | null",
    "pais": "string | null"
  },
  "carga": {
    "tipo": "string | null",
    "pesoKg": "number | null",
    "volumenM3": "number | null",
    "contenedor": "20ST | 40ST | 40HC | LCL | reefer | null",
    "cantidad": "number | null"
  },
  "incoterm": "string | null",
  "fechaEstimada": "string (ISO) | null",
  "operativa": {
    "ritmoCargaDiario": "string | null",
    "plazoSobreestadiaDias": "number | null",
    "depositoFiscalVacios": "string | null"
  },
  "observaciones": "string | null"
}
```

- `pesoKg` siempre normalizado a kilogramos (`tn` → ×1000).
- `volumenM3` siempre normalizado a metros cúbicos.
- `incoterm`: código de 3 letras si aparece (`FOB`, `CIF`, `EXW`, `CFR`, `DAP`…), `null` si no.
- `operativa` captura los parámetros que el PDF del desafío marca como faltantes frecuentes (ver [[GLOSARIO]]):
  - `ritmoCargaDiario`: cuánta carga despacha el cliente por día — texto libre (`"2 contenedores/día"`, `"500 kg/día"`).
  - `plazoSobreestadiaDias`: días de *free time* que necesita en destino antes de caer en demurrage.
  - `depositoFiscalVacios`: depósito fiscal/extraportuario para retiro o devolución de vacíos (ej. `"COCEL Salta"`) — mitiga el problema del *roundtrip*.

### 2.2 `Alerta`

```json
{
  "campo": "carga.pesoKg",
  "mensaje": "Falta el peso de la carga",
  "pregunta": "¿Cuántos kilogramos pesa la mercadería en total?",
  "severidad": "alta | media"
}
```

`severidad: alta` = campo indispensable para cotizar · `media` = deseable.

### 2.3 `Corredor`

```json
{
  "id": "pacifico",
  "nombre": "Corredor Bioceánico / Pacífico",
  "pasosFronterizos": ["Paso de Jama"],
  "puertos": [
    { "nombre": "Antofagasta", "pais": "CL", "lat": -23.65, "lng": -70.4 }
  ],
  "tiempoEstimadoDias": 3,
  "pros": ["..."],
  "contras": ["..."],
  "consideraciones": ["..."]
}
```

Los datos completos de dominio viven en la skill [[Corredores-NOA]] y se cargan como seed.

---

## 3. Endpoints

### `POST /api/parse` — Módulo 1 (propietario: [[LogisticsParser]])

Transforma texto informal → ficha estructurada + alertas.

```json
// Request
{ "texto": "hola necesito mandar 2 containers de 40 de sal a china, salimos de salta" }

// Response 200
{
  "ficha": { /* FichaTecnica */ },
  "alertas": [ /* Alerta[] */ ],
  "textoOriginal": "hola necesito mandar 2 containers..."
}
```

### `POST /api/validate` — Módulo 2

Re-valida una ficha editada por el usuario (sin llamar a Gemini).

```json
// Request
{ "ficha": { /* FichaTecnica */ } }

// Response 200
{ "alertas": [ /* Alerta[] */ ], "completo": false }
```

### `GET /api/corredores` — Módulo 3 (propietario: [[RouteAnalyzer]])

```json
// Response 200
{
  "corredores": [ /* Corredor[] */ ],
  "depositosFiscales": [
    {
      "nombre": "COCEL Salta",
      "ciudad": "Salta",
      "provincia": "Salta",
      "nota": "Depósito fiscal extraportuario — retiro/devolución de vacíos sin enviar el camión al puerto"
    }
  ]
}
```

`depositosFiscales` alimenta el autocompletado del campo `operativa.depositoFiscalVacios` y la explicación del roundtrip en la UI.

### `POST /api/rfq` — Módulo 4 (propietario: [[RFQGenerator]])

```json
// Request
{ "ficha": { /* FichaTecnica */ }, "corredorId": "pacifico | atlantico | null" }

// Response 200
{
  "rfq": {
    "asunto": "RFQ – Exportación Sal (2x40HC) Salta → Shanghái",
    "texto": "Estimados...",
    "advertencias": [ /* Alerta[] restantes si la ficha está incompleta */ ]
  }
}
```

### `POST /api/rfq/pdf`

```json
// Request
{ "texto": "string", "asunto": "string" }

// Response 200: application/pdf (binary)
```

### Persistencia (Supabase)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/consultas` | sí | Guarda `{ textoOriginal, ficha, alertas }` → `{ id }` |
| `GET` | `/api/consultas` | sí | Historial del usuario autenticado |

### Utilidad

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | `{ "status": "ok" }` — smoke test pre-demo |

---

## 4. Tablas (PostgreSQL / Supabase)

### `consultas`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | default `gen_random_uuid()` |
| `user_id` | uuid | FK a `auth.users`, nullable si la demo corre sin auth |
| `texto_original` | text | |
| `ficha` | jsonb | `FichaTecnica` completa |
| `alertas` | jsonb | `Alerta[]` |
| `created_at` | timestamptz | default `now()` |

### `rfqs`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid pk | |
| `consulta_id` | uuid | FK → `consultas.id` |
| `corredor_id` | text | `pacifico | atlantico | null` |
| `asunto` | text | |
| `texto` | text | cuerpo final del RFQ |
| `created_at` | timestamptz | |

RLS: `consultas` y `rfqs` solo visibles para su `user_id` (`auth.uid() = user_id`).

---

## 5. Reglas de convivencia

1. Campos `null` ≠ string vacío: el front muestra "—" y el motor de alertas los trata como faltantes.
2. El front **siempre** re-valida con `POST /api/validate` después de que el usuario edite la ficha.
3. Si Gemini cae (`502`), el backend responde con el fallback heurístico de [[Parsing-NLP]] y agrega `"modo": "fallback"` en la response.
4. Cualquier cambio de schema acá ⇒ actualizar `[[TASK_BACKLOG-NACHO]]`, `[[TASK_BACKLOG-LUCAS]]` y `[[TASK_BACKLOG-BRUNO]]`.

---

## Relacionado

- [[CONTEXTO_MAESTRO]] — definición de los 4 módulos que este contrato implementa
- [[GLOSARIO]] — vocabulario oficial del desafío (fuente de los campos `operativa.*`)
- [[INDEX]] — índice general del proyecto
- Agentes: [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]] · [[FrontendDev]] · [[BackendDev]] · [[IntegradorQA]]
- Skills: [[Parsing-NLP]] · [[Corredores-NOA]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Stack-Tecnico]]
- Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
