---
tipo: backlog
tags: [backlog, lucas, backend, datos]
owner: Lucas
---

# TASK_BACKLOG — LUCAS

> **Rol:** Backend + Datos · **Perfil de agente:** [[BackendDev]] · **Objetivo:** API Express + Supabase + Gemini funcionando para la demo.
> Leyenda — **Prioridad:** `P0` bloquea la demo · `P1` feature completa · `P2` mejora. **Estimación:** `S` <1h · `M` 1-3h · `L` >3h.

**Contrato de trabajo:** [[CONTRATO-API]] — todo response debe respetar sus schemas. Cambios al contrato se avisan a [[TASK_BACKLOG-NACHO]] y [[TASK_BACKLOG-BRUNO]].

---

## FASE 0 — Setup & Contratos

### L-01 — Crear proyecto Supabase
`P0` · `S` · depende de: — · ejecuta: [[BackendDev]]
- Crear proyecto en supabase.com (región más cercana a AR), anotar `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [x] AC: las 3 keys en `.env` local de `server/` (nunca commiteado) y compartidas con el equipo por canal seguro.

### L-02 — Conseguir GEMINI_API_KEY
`P0` · `S` · depende de: — · ejecuta: [[BackendDev]]
- Generar key en Google AI Studio; verificar con un request de prueba al endpoint de Gemini.
- [x] AC: `curl` de prueba devuelve 200 con texto generado.

### L-03 — Scaffold API Express
`P0` · `S` · depende de: — · skill: [[Stack-Tecnico]]
- Estructura `server/` según skill: `routes/`, `services/`, `db/`, `middleware/` + `npm run dev`.
- [x] AC: `GET /api/health` responde `{ "status": "ok" }` en `:3001`.

### L-04 — `.env.example` + CORS + error handler
`P0` · `S` · depende de: L-03 · skill: [[Stack-Tecnico]]
- `.env.example` con todas las vars del contrato §1; middleware CORS para `:5173`; error handler con shape `{ error: { code, message } }`.
- [x] AC: request a endpoint inexistente devuelve `{ error }` JSON, no HTML.

---

## FASE 1 — Fundaciones

### L-05 — Migración `consultas` + `rfqs` con RLS
`P0` · `M` · depende de: L-01
- SQL en `server/src/db/migrations/001_init.sql` con el schema del contrato §4 + políticas RLS (`auth.uid() = user_id`).
- [x] AC: tablas visibles en Supabase Dashboard; insert anónimo sin auth rechazado por RLS.

### L-06 — Seed de corredores
`P0` · `M` · depende de: L-05 · datos: [[Corredores-NOA]] · cura: [[LogisticsExpert]]
- Cargar Pacífico y Atlántico (tabla `corredores` o JSON servido) con puertos, pasos, pros/contras, coordenadas lat/lng para el mapa + `depositosFiscales` (COCEL Salta, ver [[Corredores-NOA]] §2.1).
- [x] AC: los dos objetos `Corredor` completos según contrato §2.3 + array `depositosFiscales` en la response.

### L-07 — Cliente Supabase server-side
`P0` · `S` · depende de: L-01, L-03
- `server/src/db/supabase.js` con service role (server-only) + helper `getUserClient(token)` para queries con RLS.
- [x] AC: consulta de prueba a `corredores` desde Node devuelve el seed.

### L-08 — Schemas zod del contrato
`P0` · `S` · depende de: B-01 ([[TASK_BACKLOG-BRUNO]])
- `FichaTecnica`, `Alerta`, `Corredor` como schemas zod en `server/src/lib/schemas.js` — validación de entrada en cada endpoint.
- [x] AC: POST con body inválido → `400 { error: { code: "VALIDATION_ERROR" } }`.

---

## FASE 2 — Módulos core (paralelizable con N-07..N-12 del front, que usan mocks)

### L-09 — `POST /api/parse` (Gemini + fallback)
`P0` · `L` · depende de: L-02, L-08 · implementa: [[LogisticsParser]] · skill: [[Parsing-NLP]]
- Prompt del template §3 + `responseMimeType: "application/json"` + `temperature: 0`; parseo seguro (JSON.parse con manejo de error → retry 1 vez con prompt de corrección).
- Fallback heurístico §4 ejecutándose si Gemini da 5xx → response con `"modo": "fallback"`.
- Post-parseo: correr motor de validación (L-10) y devolver `ficha` + `alertas`.
- [x] AC: fixture T-01 devuelve `operacion: "exportacion"`, `contenedor: "40ST"`, `cantidad: 2`, `pesoKg: null` + alertas de peso/incoterm.
- [x] AC: fixture T-09 extrae `operativa.depositoFiscalVacios: "COCEL Salta"` y `plazoSobreestadiaDias: 14`.

### L-10 — `POST /api/validate`
`P0` · `M` · depende de: L-08 · implementa: [[Validacion-Expediente]]
- Función pura `validarExpediente(ficha)` con la matriz de severidades; regla especial LCL→volumen alta.
- [x] AC: ficha vacía → 7 alertas altas; ficha T-07 → `completo: true`.

### L-11 — `GET /api/corredores`
`P0` · `S` · depende de: L-06 · implementa: [[RouteAnalyzer]]
- Servir el seed tal cual contrato §2.3.
- [x] AC: response contiene `pacifico` y `atlantico` con `puertos[].lat/lng` presentes + `depositosFiscales` con COCEL Salta.

### L-12 — `POST /api/rfq`
`P0` · `M` · depende de: L-08 · implementa: [[RFQGenerator]] · skill: [[Generacion-RFQ]]
- Template string interpolation; `null` → `[A COMPLETAR]`; incluir `advertencias` corriendo L-10 sobre la ficha recibida.
- [x] AC: con `corredorId: "pacifico"` el texto menciona Paso de Jama y puertos chilenos.
- [x] AC: el RFQ incluye sección "CONDICIONES OPERATIVAS" (ritmo, free time, depósito fiscal) con `[A COMPLETAR]` si faltan.

### L-13 — Pase por `IntegradorQA`
`P0` · `S` · depende de: L-09..L-12
- Entregar colección de requests a Bruno para smoke (B-04) y validación de fixtures (B-05).
- [x] AC: los 4 endpoints core en verde en la tabla de resultados de [[Testing-E2E]].

---

## FASE 3 — Features extra

### L-14 — Persistencia `POST`/`GET /api/consultas`
`P1` · `M` · depende de: L-05, L-09
- Guardar `texto_original`, `ficha`, `alertas`; GET devuelve historial del `user_id` del JWT (o todas si demo sin auth, flag `AUTH_OPTIONAL=true`).
- [x] AC: consulta guardada aparece en GET y en Supabase Dashboard.

### L-15 — Middleware auth Supabase
`P1` · `M` · depende de: L-07
- Verificar JWT (`supabase.auth.getUser(token)`); proteger `/api/consultas`; endpoint `/api/auth/health` para probar.
- [x] AC: request sin token → `401`; con token válido → pasa.

### L-16 — `POST /api/rfq/pdf`
`P1` · `M` · depende de: L-12 · skill: [[Generacion-RFQ]] §4
- pdfkit: documento con header, la ficha en tabla, cuerpo del RFQ. Fallback: si falla, el front usa copiar texto.
- [x] AC: response `Content-Type: application/pdf` abre y es legible.

### L-17 — Deploy (opcional) o runbook local
`P2` · `M` · depende de: L-13
- Render/Railway para la API, o documentar `npm start` local + orden de arranque en README.
- [x] AC: cualquier integrante levanta el back con el README, sin ayuda.

---

## FASE 4 — Demo

### L-18 — Datos demo precargados
`P0` · `S` · depende de: L-14
- 2-3 consultas de ejemplo en la tabla para mostrar historial rico.
- [x] AC: historial de la demo no arranca vacío.

### L-19 — Health-check pre-demo
`P0` · `S` · depende de: L-09..L-16 · con: [[IntegradorQA]] (B-14)
- Script `npm run healthcheck`: ping a todos los endpoints + test de Gemini → reporte verde/rojo.
- [x] AC: un comando dice si el back está listo para presentar.

### L-20 — Variable `AUTH_OPTIONAL` + modo demo
`P1` · `S` · depende de: L-15
- Flag que permite correr la demo sin login si auth falla (RLS con user demo).
- [x] AC: `AUTH_OPTIONAL=true npm run dev` → consultas se guardan sin login.

---

## Relacionado

- Hub: [[INDEX]] · Contexto: [[CONTEXTO_MAESTRO]] · Contrato: [[CONTRATO-API]]
- Mi perfil: [[BackendDev]] · implemento a: [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]]
- Skills que uso: [[Parsing-NLP]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Corredores-NOA]] · [[Stack-Tecnico]] · Vocabulario: [[GLOSARIO]]
- Backlogs del equipo: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-BRUNO]]
- Bugs que me reportan: template en [[Testing-E2E]] §6
