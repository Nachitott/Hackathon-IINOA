---
tipo: backlog
tags: [backlog, integracion, fullstack, e2e]
owner: Equipo (Nacho + Lucas + Bruno)
---

# TASK_BACKLOG — INTEGRACIÓN

> **Rol:** Cruce front↔back · **Perfil de agente:** [[IntegradorQA]] + [[FrontendDev]] + [[BackendDev]] · **Objetivo:** el dashboard corre 100% contra la API real (`VITE_USE_MOCK=false`), sin errores, listo para la demo.
> Leyenda — **Prioridad:** `P0` bloquea la demo · `P1` feature completa · `P2` mejora. **Estimación:** `S` <1h · `M` 1-3h · `L` >3h.

**Fuentes:** [[CONTRATO-API]] (schemas/endpoints) · [[Testing-E2E]] (fixtures + checklists) · runbook en [[Journal]] (Fase 4). Backlogs origen: [[TASK_BACKLOG-NACHO]] (client/) · [[TASK_BACKLOG-LUCAS]] (server/).

**Contexto del cruce:** el back vive en `server/` (rama `dev`), el front en `client/` (rama `main`). Ramas disjuntas → merge limpio. Ambas corren local: API `:3001` · dev `:5173` · preview `:4173`.

---

## FASE 0 — Merge & Setup

### I-01 — Merge `origin/dev` → `main` vía rama de integración
`P0` · `S` · depende de: —
- `git checkout -b feat/integracion` desde `main` → `git merge origin/dev`.
- [x] AC: merge limpio sin conflictos (front `client/` y back `server/` en archivos disjuntos).

### I-02 — Dependencias del server
`P0` · `S` · depende de: I-01
- `cd server && npm ci` (hay `package-lock.json` commiteado — instalación reproducible).
- [x] AC: `npm start` levanta en `:3001` y `GET /api/health` → `{"status":"ok"}`.

### I-03 — Variables de entorno (ambos lados)
`P0` · `S` · depende de: I-02
- `server/.env`: `PORT=3001`, `CORS_ORIGIN=http://localhost:5173,http://localhost:4173`, `AUTH_OPTIONAL=true`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `client/.env`: `VITE_API_URL=http://localhost:3001/api`, `VITE_USE_MOCK=false`, `VITE_SUPABASE_*` (mismas keys que el back).
- [x] AC: ambos `.env` gitignored (`git check-ignore` los cubre); el front muestra badge `API` (no `MOCK`).

### I-04 — Healthcheck pre-demo del back
`P0` · `S` · depende de: I-03
- `cd server && npm run healthcheck` — tabla de 8 endpoints.
- [x] AC: 8/8 en verde (health, auth, corredores, validate, parse, rfq, rfq/pdf, consultas).
- Nota: si Gemini da 503 por demanda, `/api/parse` cae a `modo:fallback` — el healthcheck lo declara en la columna Detalles.

### I-05 — Persistencia Supabase
`P1` · `S` · depende de: I-03 · **ya ejecutado:** `001_init.sql` corrida por Lucas
- Verificar roundtrip real: `POST /api/consultas` → `GET /api/consultas` devuelve el registro con `created_at` de Supabase.
- [x] AC: consulta guardada aparece en el GET tras reiniciar el server (persiste, no es el store en memoria).

---

## FASE 1 — Fixes de contrato (desvíos encontrados en el cruce)

### I-06 — `pasosFronterizos` como objetos ricos (crash React)
`P0` · `S` · depende de: I-01 · **Bug P0 real:** back sirve `{nombre, alturaMsnm, tipo, nota}`; front renderizaba `{p}` → "Objects are not valid as a React child"
- `ComparadorCorredores.jsx`: helper `nombrePaso(p)` tolera `string | {nombre,...}`; chips usan `nombre`.
- Bonus: banner de Jama usa `nota` + `alturaMsnm` reales cuando el back los provee.
- `types.js` typedef `PasoFronterizo` + `CONTRATO-API.md` §2.3 actualizados al shape real.
- [x] AC: las cards del comparador renderizan "Paso de Jama" sin crash con la API real.

### I-07 — Enums como `<select>` en `FichaViewer` (400 en cascada)
`P0` · `M` · depende de: I-01 · **Bug P0 real:** zod (`OperacionEnum`/`ContenedorEnum`) rechaza texto libre → validate/rfq/consultas 400 tras cualquier edición manual
- `operacion` → select (`exportacion`/`importacion`) · `carga.contenedor` → select (`20ST`/`40ST`/`40HC`/`LCL`/`reefer`) · opción vacía → `null`.
- Display con etiqueta legible ("Exportación" en vez de `exportacion`).
- [x] AC: editar ambos campos contra la API real nunca devuelve `VALIDATION_ERROR` por enum.

### I-08 — Guard numérico en edición de ficha
`P2` · `S` · depende de: I-07
- `Number.isFinite` antes de guardar `pesoKg`/`volumenM3`/`cantidad`/`plazoSobreestadiaDias`; no-numérico → `null` (nunca `NaN` en la ficha).
- [x] AC: tipear "abc" en Peso deja el campo en "—" sin romper `/api/validate`.

### I-09 — CORS multi-origen
`P1` · `S` · depende de: I-03
- `server/src/app.js`: `CORS_ORIGIN` admite lista separada por comas → cubre dev `:5173` **y** preview `:4173` (modo demo recomendado).
- [x] AC: preflight `OPTIONS` desde ambos orígenes → `Access-Control-Allow-Origin` correcto; origen ajeno (`:9999`) sin header.

### I-10 — Tests de contrato independientes del `.env`
`P1` · `S` · depende de: I-03 · **Bug encontrado:** el suite asumía `VITE_USE_MOCK=true` en `.env`; al integrar queda `false` y los tests de mocks pegaban a la API real
- `api.contract.test.js`: el bloque "mocks" stubbea `VITE_USE_MOCK=true` + `vi.resetModules()` en `beforeAll` — los tests corren igual con cualquier `.env`.
- [x] AC: `npm test` → 12/12 verde con `.env` en modo API real.

---

## FASE 2 — Verificación E2E contra API real

### I-11 — Smoke por endpoint (Testing-E2E §3)
`P0` · `M` · depende de: I-04
| Endpoint | Prueba | Resultado |
|---|---|---|
| `GET /api/health` | status | ✅ 200 `{"status":"ok"}` |
| `GET /api/auth/health` | sin token, AUTH_OPTIONAL | ✅ 200 `user.isDemo: true` |
| `GET /api/corredores` | 2 corredores + COCEL | ✅ 200 (objetos ricos en pasos) |
| `POST /api/validate` | ficha T-09 | ✅ 200 `{completo:true, 6 alertas}` |
| `POST /api/validate` | `contenedor:"40 pies"` | ✅ 400 `VALIDATION_ERROR` estándar |
| `POST /api/parse` | T-01 sal→China | ✅ 200 `modo:fallback`, 9 alertas |
| `POST /api/parse` | T-09 porotos→India | ✅ 200 `modo:gemini`, `plazoSobreestadiaDias:14`, `depositoFiscalVacios:"COCEL Salta"`, 0 altas |
| `POST /api/parse` | T-10 azúcar→Europa | ✅ 200 `ritmoCargaDiario` extraído, `contenedor` alta correcta |
| `POST /api/rfq` | ficha T-09 + `pacifico` | ✅ asunto `RFQ – Exportación porotos (2x40HC) Perico → India`, Paso de Jama + puertos en cuerpo |
| `POST /api/rfq/pdf` | rfq real | ✅ 200 `application/pdf`, `%PDF` válido, 2 páginas |
| `POST→GET /api/consultas` | persistencia | ✅ 201 → aparece en GET desde Supabase |
- [x] AC: cada endpoint responde el shape del contrato con `{error:{code,message}}` en los 4xx.

### I-12 — Checklist E2E en UI (`VITE_USE_MOCK=false`)
`P0` · `M` · depende de: I-06..I-09 · checklist [[Testing-E2E]] §4 + runbook [[Journal]]
- [x] AC: Ejemplo T-01 → ficha poblada con "—" en nulls.
- [x] AC: alertas ordenadas alta→media con preguntas; click linkea al campo (`data-campo` + flash).
- [x] AC: editar campo → `POST /api/validate` actualiza alertas (selects sin 400).
- [x] AC: comparador muestra ambos corredores (pasos como chips, sin crash) + banner Jama con datos del back.
- [x] AC: Generar RFQ → asunto correcto, texto editable, `[A COMPLETAR]` + sección CONDICIONES OPERATIVAS.
- [x] AC: Copiar copia el texto EDITADO; Descargar PDF entrega PDF real (fallback de impresión intacto).
- [x] AC: Historial → guardar consulta → click repuebla ficha+alertas (persistencia Supabase).
- [x] AC: badge `modo:fallback` visible cuando el parser corre sin IA.
- [x] AC: back caído → `NETWORK_ERROR` en banner, UI no se rompe (auto-dismiss 8s).
- [ ] AC: verificación visual final en pantalla del usuario (share de captura del preview).

### I-13 — Gates de calidad del client
`P0` · `S` · depende de: I-10
- [x] AC: `npm run lint` → 0 warnings / 0 errors.
- [x] AC: `npm test` → 12/12.
- [x] AC: `npm run build` → OK; `npm run preview` sirve en `:4173` contra la API real.

---

## FASE 3 — Cierre & demo

### I-14 — Documentación del cruce
`P1` · `S` · depende de: I-12
- [x] AC: este backlog + `INDEX.md` enlazado + entrada en `Journal.md` con los hallazgos P0.
- [x] AC: `CONTRATO-API.md` refleja la realidad (§2.3 pasos ricos, `modo` siempre presente, `CORS_ORIGIN` lista, `AUTH_OPTIONAL`).

### I-15 — Marcar tareas originales desbloqueadas
`P1` · `S` · depende de: I-12
- [x] AC: **N-19** ([[TASK_BACKLOG-NACHO]]) marcada — checklist E2E corrido contra API real.
- [ ] AC: **N-20** sigue pendiente — ensayo en la máquina de presentación (zoom 125–150%, screenshots de respaldo).

### I-16 — Merge a `main` y orden de arranque
`P0` · `S` · depende de: I-12, I-14
- [x] AC: `feat/integracion` mergeada a `main` local.
- [ ] AC: push a `origin` — **pendiente de confirmación explícita del usuario**.
- Runbook demo: `cd server && npm start` → `cd client && npm run preview` (o `dev`) → abrir `:4173`/`:5173` → `npm run healthcheck` 30 min antes.

### I-17 — (Opcional) Login real con usuario demo
`P2` · `S` · depende de: I-05
- Crear usuario en Supabase Auth (script `create-demo-user.js` o dashboard) para probar JWT real + RLS por usuario.
- [ ] AC: login real muestra historial filtrado por `user_id`; modo demo sigue disponible con `AUTH_OPTIONAL=true`.

---

## FASE 4 — Bug-fixes post-testeo demo (rama `fix/demo-bugs`)

Bugs reportados por el equipo tras probar la app integrada. Todos verificados contra API real + build/lint/tests verdes.

### B-01 — Mapa reactivo a la consulta + distancias reales
`P0` · `M` · bug reportado: "comparador/mapa marca distancias incorrectas y no se actualiza por consulta"
- [x] Causa raíz: `MapaCorredores` usaba orígenes hardcodeados (Salta + SSJ) y su effect ignoraba `ficha`; el front nunca consumía `distanciaAproxKm` del back.
- [x] Fix: nuevo `client/src/lib/origen.js` — `resolveOrigen(ficha)` mapea ciudades NOA (Salta, SSJ, Perico, Gral. Güemes, Orán) → coords + slug de distancia; fallback a ambos orígenes si la ciudad es nula/desconocida.
- [x] Fix: mapa dibuja líneas/marcadores desde el origen de la ficha y se redibuja por `origenes` memoizado → cada consulta nueva refresca el mapa.
- [x] Fix: tooltips de puertos muestran `~N km desde {origen}` con `distanciaAproxKm["slugOrigen-puerto"]`; cards del comparador muestran `~N días · ~N km`.
- [x] AC: parse de "desde Jujuy…" → mapa dibuja un solo origen (SSJ) con distancia real en tooltips/cards; origen desconocido → fallback regional sin romper.

### B-02 — Gate de RFQ hasta expediente completo (0 alertas)
`P0` · `S` · bug reportado: "corregidas las altas permite generar RFQ con medias pendientes"
- [x] Causa raíz: `completo` del back solo considera severidad `alta`; el botón no tenía gate y el badge ocultaba las medias cuando no quedaban altas.
- [x] Fix: `EditorRFQ` — botón `disabled` mientras `alertas.length > 0`, con tooltip + texto auxiliar indicando cuántos datos faltan.
- [x] Fix: `AlertasPanel` — muestra TODAS las alertas (badge "N altas · M medias"); "✔ Expediente completo" solo cuando `alertas.length === 0`, consistente con el gate del RFQ.
- [x] AC: ficha con solo medias pendientes → medias visibles, sin badge verde, botón RFQ deshabilitado; 0 alertas → badge verde + RFQ habilitado.

### B-03 — Textarea de consulta adaptable verticalmente
`P1` · `S` · bug reportado: "el apartado de consulta debe adaptarse al texto a lo vertical"
- [x] Causa raíz: `rows={10}` fijo + `flex-1`/`h-full` heredaban el alto de la grilla, no del contenido.
- [x] Fix: `ChatInput` auto-grow vía `ref` + `scrollHeight` (tope ~40vh, scroll interno después), `resize-none`, `self-start` en la card.
- [x] AC: pegar texto largo → el campo crece hasta el tope; texto corto → altura mínima razonable.

### B-04 — Parser fallback entiende lenguaje natural del usuario
`P0` · `M` · bug reportado: "campos aclarados en la consulta no se reflejaron en la ficha" (modo fallback activo)
- [x] Causa raíz: `parser-fallback.js` solo reconocía "soy X de Y" para contacto, un diccionario fijo sin "coca"/"porotos"-style libre, sin "tierra del fuego" ni direccionalidad `desde/hasta`; además el bloque "jujuy" pisaba ciudades específicas (Perico → SSJ).
- [x] Fix: patrones nuevos — "mi nombre es X", "somos la empresa X", "la mercadería es X", "N kilos/kg/tn", Tierra del Fuego; guard para no pisar ciudad específica con la provincia; limpieza de puntuación final en nombre/empresa.
- [x] Fix: prompt de `gemini.js` — mismas reglas para que Gemini y fallback extraigan lo mismo.
- [x] AC: texto exacto reportado → `Peluk`/`Vitex`, origen `San Salvador de Jujuy/Jujuy`, destino `Tierra del Fuego/Argentina`, `coca`, `40 kg` (verificado vía `POST /api/parse`, `modo:fallback`).
- [x] AC regresión: seeds reales (Perico×COCEL, Salta→China, Güemes→Miami) y T-10 parsean igual o mejor que antes.

### B-05 — Calendario en `fechaEstimada`
`P1` · `S` · pedido del usuario: "un calendario para elegir la fecha dentro de la ficha técnica"
- [x] Fix: `FichaViewer` — `Campo` gana rama `<input type="date">` para `fechaEstimada` (commit al elegir, Escape cancela); display ISO → `dd/mm/aaaa`, no-ISO → string crudo, null → `—`.

### B-06 — Logo ZOFRI en el header
`P2` · `S` · pedido del usuario: "logo_zofri.jpg arriba a la izquierda, al lado del título"
- [x] Fix: asset copiado a `client/public/logo-zofri.jpg`; `Dashboard.jsx` muestra `<img>` (h-10, badge blanco redondeado) a la izquierda de "Asistente Logístico NOA".

---

## Riesgos / notas del cruce

- **Gemini 503 intermitente** (`gemini-*-flash` por demanda): el back reintenta con el siguiente modelo y cae a `modo:fallback` declarado en UI — la demo nunca se bloquea; el badge lo transparenta.
- **`POST /api/consultas` responde el registro completo** (superset del `{id}` del contrato) — compatible.
- **`GET /api/consultas` con Supabase vacío** devuelve `DEMO_CONSULTAS` precargadas — historial demo nunca vacío.
- **`*.pdf` en `.gitignore`** (vino con el merge) — los PDFs de prueba no se commitean.
- Credenciales: `.env` de ambos lados contiene keys reales — **nunca commitear**; rotar las que se compartieron por chat si la postura es estricta.

## Relacionado

- Hub: [[INDEX]] · Contrato: [[CONTRATO-API]] · Bitácora: [[Journal]] · Fixtures: [[Testing-E2E]]
- Agentes: [[IntegradorQA]] · [[FrontendDev]] · [[BackendDev]]
- Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
