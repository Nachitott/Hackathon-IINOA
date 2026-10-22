---
tipo: journal
tags: [journal, avance, frontend]
owner: Nacho
---

# JOURNAL — Registro de avance

> Bitácora de implementación del proyecto. Una entrada por sesión de trabajo: qué se hizo, decisiones tomadas, verificación y próximos pasos.

---

## 2026-10-22 — Fase 0: Setup & Contratos (frontend)

**Scope:** [[TASK_BACKLOG-NACHO]] Fase 0 completa (N-01..N-04) + **N-07 adelantado** (mocks — el AC de N-03 lo exige y el backlog lo recomienda temprano).

### Hecho

| Tarea | Resultado |
|---|---|
| N-01 Scaffold | `client/` con Vite 8 + React **18.3** (pinned — el stack fija React 18, el template traía 19). Estructura `src/{components,pages,lib}` + `npm run dev` en `:5173`. |
| N-02 Tailwind | Tailwind v4 via `@tailwindcss/vite`. Tokens en `src/index.css` `@theme`: `sev-alta` (rojo), `sev-media` (ámbar), `sev-ok` (verde) + paleta NOA provisional (`noa-tierra`, `noa-cobre`, `noa-andes`, `noa-arena`). |
| N-03 `lib/api.js` | `apiFetch(path, opts)` con `VITE_API_URL`, flag `VITE_USE_MOCK` (default `true`), `ApiError { code, message, status }` normalizando `{ error }` del contrato + helpers por endpoint (`parseTexto`, `validarFicha`, `getCorredores`, `generarRfq`…). |
| N-04 `lib/types.js` | Typedefs JSDoc copia del contrato §2: `FichaTecnica`, `Alerta`, `Corredor`, `DepositoFiscal`, `Rfq` + wrappers de response. |
| N-07 `lib/mocks.js` | `mockFetch` con latencia simulada. Fixtures T-01/T-04/T-09, catálogo de alertas espejo de Validacion-Expediente (incl. regla LCL→volumen-alta y `pesoKg: 0`), corredores con shape estricto §2.3 (lat/lng para N-13), `depositosFiscales` [COCEL Salta], RFQ con sección CONDICIONES OPERATIVAS y `[A COMPLETAR]`. `EJEMPLOS` exportado para N-18. |
| Smoke `App.jsx` | Chips de severidad + paleta + línea viva `GET /corredores` que muestra modo MOCK/API y resultado. |
| Env | `client/.env` (gitignored ✓) + `.env.example` con las 4 vars del contrato §1. |

### Decisiones

- **React 18.3.1** sobre el React 19 del template: [[Stack-Tecnico]] fija React 18.
- **Tailwind v4** (CSS-first, `@theme`) — sin postcss config; tokens centralizados para reemplazo quirúrgico cuando llegue B-06 (branding de Bruno).
- **Mocks espejan specs** (alertas y texto RFQ) solo para dev realista — la lógica de negocio real vive en la API ([[BackendDev]]).
- Corredores en mocks con **shape estricto del contrato §2.3** (`pasosFronterizos: string[]`), no los objetos ricos de [[Corredores-NOA]] — evita divergir del zod del back.
- `VITE_USE_MOCK` (prefijo `VITE_` obligatorio en Vite) implementa el flag `USE_MOCK` del backlog.

### Verificado

- `npm run lint` (oxlint): 0 warnings / 0 errors · `npm run build`: OK (503 ms)
- `npm run dev` sirve en `:5173`; módulos `api.js`/`mocks.js`/`types.js` transforman 200
- Mocks testeados en Node: T-01 → 9 alertas (peso alta + 8 medias) · T-04 → 6 altas · T-09 → `completo: true` con `operativa` poblada · RFQ con `[A COMPLETAR]` y advertencias
- `git check-ignore .env` → ignorado correctamente

### Pendiente / riesgos

- Paleta NOA **provisional** hasta B-06 ([[TASK_BACKLOG-BRUNO]]).
- Sin commit aún — working tree para review.

### Próximo (Fase 1)

- N-05 Layout dashboard hero (3 zonas en 1440px) · N-06 `AppContext` de estado global.
- Con mocks listos, Fase 2 (N-08..N-12) se puede encarar enseguida: ChatInput, FichaViewer, AlertasPanel, Comparador, EditorRFQ.

---

## 2026-10-22 — Fase 1: Fundaciones + módulos core funcionales

**Rama:** `feat/fase-1-fundaciones` (sale de `feat/fase-0-setup`).

**Scope:** [[TASK_BACKLOG-NACHO]] Fase 1 (N-05, N-06 — N-07 ya estaba) + **Fase 2 funcional** (N-08..N-12) + N-18 adelantado: los mocks ya estaban listos y los ACs de N-06 ("cada panel lee/actualiza el mismo estado") solo se prueban con paneles reales.

### Hecho

| Pieza | Detalle |
|---|---|
| N-06 Estado | `lib/appContext.js` (contexto + `useApp`) + `lib/AppProvider.jsx` (provider) — separados para que fast-refresh funcione. Estado: `ficha, alertas, completo, modo, corredores, depositosFiscales, corredorSel, rfq, loading{}, error`. Acciones: `estructurar`, `actualizarFicha` (re-valida, regla §5.2), `cargarCorredores`, `generarRfq`, `reset`. |
| N-05 Layout | `pages/Dashboard.jsx`: 3 zonas en `xl:grid-cols-12` (input 3 · ficha+alertas 5 · corredor+RFQ 4) — a 1440px todo visible sin scroll h; en pantallas menores se apila. Header sticky con badges MOCK/API, `modo:fallback` y error global dismissible. |
| N-08 ChatInput | textarea + "Estructurar consulta" (spinner, disabled vacío) + error inline + botones "Ejemplo T-01/T-04/T-09" (**N-18** adelantado — un click carga el texto). |
| N-09 FichaViewer | 6 grupos (contacto/operación/origen-destino/carga/**operativa**/extras); `null` → "—" atenuado; borde rojo/ámbar según severidad por campo; `data-campo` para linkeo; **edición inline** (click → input → Enter guarda → `POST /api/validate`). |
| N-10 AlertasPanel | orden altas→medias, dot de severidad, `pregunta` en itálica "Preguntar: …", click → scroll + ring flash al campo; badge "✔ Expediente completo" o "N altas". |
| N-11 Comparador | 2 cards con puertos/pasos chips, pros/contras, consideraciones en `<details>`; selector toggle → `corredorSel`; banner Jama siempre que se elige Pacífico + refuerzo si `esInvierno()` (jun–ago). |
| N-12 EditorRFQ | "Generar RFQ" → asunto + textarea **editable** + "Copiar" (clipboard del texto EDITADO + fallback `execCommand`) + banner ámbar con `advertencias`; sync con render-phase adjust (sin effect). |
| Router | `App.jsx` = `AppProvider` + `BrowserRouter` + ruta `/` → Dashboard (listo para Login/Historial en Fase 3). |

### Decisiones

- `appContext.js` + `AppProvider.jsx` separados: oxlint `only-export-components` exige archivos de componente puros.
- Sync del texto RFQ con patrón "ajustar estado durante render" (evita warning `set-state-in-effect`).
- Edición inline en FichaViewer: cumple la regla de convivencia §5.2 (siempre re-validar tras editar) y da vida a `/api/validate` en la demo.
- La edición acepta vacío → `null` y numéricos → `Number` según el campo.

### Verificado

- `npm run lint` (oxlint): **0 warnings / 0 errors** (corregidos 2 warnings del primer pase) · `npm run build`: OK (32 módulos)
- Dev server sirve todos los módulos 200 · flujo mock end-to-end: Ejemplo T-01 → parse → ficha + 9 alertas → corredor → RFQ con `[A COMPLETAR]`
- Backlog: marcados 11 ACs (N-05..N-12, N-18) — quedan pendientes N-13..N-17, N-19, N-20

### Pendiente / riesgos

- Polish de Fase 2 si hace falta tras review visual (espaciados, copy).
- Próximos: Fase 3 — N-13 MapaCorredores (leaflet ya instalado), N-14 login Supabase, N-15 historial, N-16 PDF, N-17 pulido.

---

## 2026-10-22 — Fase 3: Features extra (mapa, auth, historial, PDF, pulido)

**Rama:** `feat/fase-1-fundaciones` (continuación — pendiente consolidar ramas al cerrar).

**Scope:** [[TASK_BACKLOG-NACHO]] Fase 3 completa (N-13..N-17). **Aclaración de contexto:** el backend lo construye otro integrante — el front se cierra 100% contra mocks y el cruce real queda para N-19 (`VITE_USE_MOCK=false`).

### Hecho

| Pieza | Detalle |
|---|---|
| N-13 `MapaCorredores` | Leaflet + OSM (sin API key): `circleMarker` por puerto (lat/lng del contrato §2.3), líneas dashed Salta/Jujuy→puertos, color por corredor (pacífico=andes, atlántico=cobre), leyenda, `fitBounds`, atenuado del no-seleccionado. **Fallback: devuelve null → quedan las cards.** `scrollWheelZoom` off para no secuestrar el scroll de la página. |
| N-14 Login | `@supabase/supabase-js` v2 + `lib/supabase.js` (cliente solo si hay env vars) + `authContext`/`AuthProvider` (mismo patrón split que app) + página `/login` + `RequireAuth` guard. "Entrar como demo" siempre disponible; form real aparece solo con `VITE_SUPABASE_*` configuradas. Token JWT via `token()` para `Authorization: Bearer`. |
| N-15 `HistorialConsultas` | Ruta `/historial`: `GET /api/consultas` (tolera `{consultas:[]}` o array), cards con operación/carga/destino/nº altas/fecha → click repuebla estado y vuelve al dashboard. Botón "Guardar consulta" en header → `POST /api/consultas`. Mock ampliado a 2 consultas (T-01 + T-09). |
| N-16 Exportar PDF | Botón en EditorRFQ → `POST /api/rfq/pdf` (nuevo `descargarRfqPdf` binario en api.js) → download. **Doble fallback**: ventana de impresión limpia (`window.print`, funciona sin back) → y "Copiar texto" que ya existía. En mock el endpoint tira `MOCK_SIN_PDF` controlado para ejercitar el fallback real. |
| N-17 Pulido | Skeletons `animate-pulse` en FichaViewer/AlertasPanel durante `loading.parse`; error global auto-dismiss a los 8s; skeletons también en Historial. |

### Decisiones

- **Auth separada de app state**: `AuthProvider` envuelve a `AppProvider` — el guard usa `useAuth`, los paneles `useApp`. Token se pasa por parámetro a los helpers (el front no lo guarda).
- **`GET /consultas` tolerante al shape** — el contrato no fija `{consultas:[]}` vs `[]` → se aceptan ambos (punto a confirmar con el back en el cruce).
- Coordenadas Salta/Jujuy hardcodeadas en el mapa como `ORIGENES` — son presentación, no dato del contrato.
- Leaflet con `circleMarker`/`divIcon` en vez de markers default (evita el clásico problema de iconos rotos en bundlers).

### Verificado

- `npm run lint`: **0/0** · `npm run build`: OK (84 módulos, ~118 kB gzip con leaflet)
- Mocks en Node: 2 consultas en historial · `MOCK_SIN_PDF` controlado · POST consulta devuelve id
- Todos los módulos nuevos sirven 200 en dev
- Backlog: +5 ACs marcados (N-13..N-17) → **quedan solo N-19 y N-20, que dependen del back real**

### Pendiente / riesgos

- **Login real e historial propio no testeables** hasta que exista Supabase + back (L-01/L-14/L-15) — el shell y el guard quedan listos.
- En el cruce: confirmar shape de `GET /consultas`, CORS `:5173`, y que `/rfq/pdf` devuelva `application/pdf`.
- N-19 (checklist E2E con `USE_MOCK=false`) y N-20 (ensayo en máquina de presentación) son la integración misma.

### Próximo

- **Integración** cuando el compañero entregue el back: `VITE_USE_MOCK=false`, recorrer checklist E2E (Testing-E2E §4), reportar a B-14.

---

## 2026-10-22 — Fase 4: preparación de demo (N-19 parcial + runbook N-20)

**Rama:** `feat/fase-4-demo`.

**Scope:** N-19 (checklist E2E) y N-20 (ensayo) dependen del **back real** que está construyendo otro integrante — no quedan marcados. Lo que SÍ se pudo cerrar hoy: verificación del path real del wrapper + modo producción + runbook.

### Hecho

| Pieza | Detalle |
|---|---|
| Tests de contrato | `client/src/lib/api.contract.test.js` + vitest + `npm test`. **12 tests**: 6 verifican shapes del contrato en mocks; 6 verifican el path real (`USE_MOCK=false`) contra stub `node:http` — método/URL/body, `Authorization: Bearer`, `401`/`400 { error }` → `ApiError`, PDF binario → `Blob`, API caída → `NETWORK_ERROR`. |
| Modo producción | `npm run preview` sirve el build en `:4173` — verificado 200. **Para presentar, preferir preview sobre dev server** (sin HMR, más estable). |
| Zoom proyector | La UI usa unidades `rem` → escala limpio con zoom del browser al 125–150% (N-20). Grid `xl` se mantiene porque el zoom reduce px efectivos, no los aumenta. |

### Runbook de integración (cuando el back esté en :3001)

```bash
# 1. Back del compañero corriendo
curl http://localhost:3001/api/health                    # → {"status":"ok"}

# 2. Front apuntando a la API real
cd client
echo 'VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3001/api' > .env
npm run preview   # o npm run dev

# 3. Checklist E2E (Testing-E2E §4) — reportar resultado a B-14
#    [ ] Ejemplo T-01 → ficha con "—" en nulls
#    [ ] alertas ordenadas alta→media, click linkea al campo
#    [ ] editar campo → /api/validate actualiza alertas
#    [ ] elegir corredor → Generar RFQ con párrafo del corredor
#    [ ] [A COMPLETAR] visible · Copiar texto copia lo editado
#    [ ] Descargar PDF abre / fallback de impresión
#    [ ] Historial: guardar consulta → recargarla repuebla
#    [ ] modo:fallback visible si el parser corrió sin Gemini
```

### Puntos a confirmar con el back en el cruce

- `GET /api/consultas` → `{ consultas: [] }` (el front también tolera array directo)
- `POST /api/consultas` body esperado: `{ textoOriginal, ficha, alertas }`
- CORS habilitado para `:5173` (su L-04) — el stub de tests ya lo ejercita
- `/api/rfq/pdf` → `Content-Type: application/pdf` binario
- Códigos de error: `{ error: { code, message } }` — el front muestra `code: message`

### Verificado

- `npm test`: 12/12 ✓ · `npm run lint`: 0/0 · `npm run build`: OK · `npm run preview`: sirve en `:4173`

### Pendiente para cerrar el backlog

- **N-19**: correr el checklist E2E de arriba con `USE_MOCK=false` contra la API real → reportar a B-14.
- **N-20**: ensayo en la máquina de presentación (front + back, zoom 125–150%, plan B con screenshots).

---

## 2026-10-22 — Integración front↔back (cruce real)

**Rama:** `feat/integracion` (merge `origin/dev` → `main`, limpio: archivos disjuntos).

**Scope:** [[TASK_BACKLOG-INTEGRACION]] completo — merge, setup de envs, fixes de contrato y verificación E2E con `VITE_USE_MOCK=false`. Cierra **N-19** (pendiente solo check visual final del usuario + N-20 en máquina de presentación).

### Bugs encontrados en el cruce (antes de tocar nada)

| # | Bug | Fix |
|---|---|---|
| 1 | `pasosFronterizos`: back sirve objetos `{nombre,alturaMsnm,tipo,nota}` y `ComparadorCorredores` renderizaba `{p}` → **crash React** | Helper `nombrePaso()` tolera ambos shapes + banner Jama usa `nota`/`alturaMsnm` reales · [[CONTRATO-API]] §2.3 actualizado |
| 2 | `operacion`/`carga.contenedor` editables como texto libre → zod rechaza (`VALIDATION_ERROR`) en validate/rfq/consultas | `<select>` con enums del contrato en `FichaViewer` (+ etiqueta legible) |
| 3 | `CORS_ORIGIN` aceptaba un solo origen → preview `:4173` bloqueado | `app.js` parsea lista separada por comas |
| 4 | Tests de mocks dependían del `.env` local (`VITE_USE_MOCK=true`) | `beforeAll` stubbea env + `vi.resetModules` — tests corren con cualquier `.env` |
| 5 | `Number("abc")`→`NaN` en campos numéricos | guard `Number.isFinite` → `null` |

### Verificado contra API real (`:3001`)

- **`npm run healthcheck`: 8/8 ✅** — Gemini 503 intermitente → `/api/parse` alterna `modo:gemini`/`fallback`, ambos verificados.
- **Parse:** T-01 (fallback) ficha idéntica al esperado · T-09 (gemini) extrae `plazoSobreestadiaDias:14` + `depositoFiscalVacios:"COCEL Salta"` con 0 alertas altas · T-10 `ritmoCargaDiario` capturado.
- **Validate:** T-09 → `completo:true` · enum inválido → 400 `{error:{code,message}}` estándar.
- **RFQ:** `RFQ – Exportación porotos (2x40HC) Perico → India` con Paso de Jama, puertos y CONDICIONES OPERATIVAS.
- **PDF:** `application/pdf` 200, `%PDF` válido, 2 páginas.
- **Persistencia Supabase real:** POST `/consultas` → 201 UUID → GET lo devuelve (migración de Lucas ya aplicada).
- **CORS:** preflight OK desde `:5173` y `:4173`; origen ajeno sin header.
- **Client:** lint 0/0 · tests 12/12 · build OK · dev `:5173` + preview `:4173` contra API real.

### Pendiente

- Check visual final del usuario en el preview (compartir captura).
- N-20: ensayo en máquina de presentación.
- Push a `origin` — pendiente de confirmación.
- (Opcional I-17) usuario demo en Supabase Auth para login real + RLS.

---

## 2026-10-22 — Bug-fixes post-testeo demo (fix/demo-bugs)

**Rama:** `fix/demo-bugs` → merge a `main` local. Backlog: FASE 4 (B-01..B-04) de [[TASK_BACKLOG-INTEGRACION]].

El equipo testeó la app integrada y reportó 4 bugs de demo. Causas raíz y fixes:

| # | Bug reportado | Causa raíz | Fix |
|---|---|---|---|
| 1 | Mapa/comparador: distancias incorrectas, no se actualiza por consulta | Orígenes hardcodeados (Salta+SSJ), effect sin `ficha`, `distanciaAproxKm` del back nunca consumido | `client/src/lib/origen.js` (resolveOrigen: Salta/SSJ/Perico/Güemes/Orán → coords+slug) · mapa redibuja por origen memoizado · `~N km` real en tooltips + cards |
| 2 | RFQ generable con medias pendientes | `completo` solo cuenta `alta`; botón sin gate; panel ocultaba medias sin altas | `EditorRFQ` disabled mientras `alertas.length>0` (+ conteo en tooltip/texto) · `AlertasPanel` lista TODAS las alertas, badge verde solo con 0 |
| 3 | Textarea de consulta no se adapta al texto | `rows={10}` fijo + `flex-1`/`h-full` heredaban alto de grilla | auto-grow por `scrollHeight` (tope ~40vh), `resize-none`, `self-start` |
| 4 | Datos del usuario no llegaban a la ficha | `parseFallback` no reconocía "mi nombre es", "somos la empresa", "la mercadería es", "N kilos", Tierra del Fuego; y pisaba Perico con SSJ | patrones nuevos + guard de ciudad específica + limpieza de puntuación · mismas reglas en prompt de Gemini |

### Verificación

- `POST /api/parse` con el texto exacto reportado → `Peluk`/`Vitex`, `San Salvador de Jujuy/Jujuy` → `Tierra del Fuego/Argentina`, `coca`, `40 kg`, `exportacion` (modo fallback).
- Regresión: seeds reales (Perico/COCEL/14d free time, Salta→China 2×40ST, Güemes→Miami reefer FOB) + T-10 (ritmo 1/día) parsean correctos.
- Client: `npm run lint` 0/0 · `npm test` 12/12 · `npm run build` OK · módulos editados sirven 200 en `:5173`.
- Back reiniciado y healthcheck OK tras los cambios del parser.

### Pendiente

- Check visual del usuario: mapa por consulta, RFQ bloqueado con medias, textarea auto-grow.
- N-20 (máquina de presentación) · push a `origin` pendiente de confirmación.

---

## 2026-10-22 — Extras de UI: calendario + logo ZOFRI

**Rama:** `feat/calendario-logo` → merge a `main` local. Backlog: B-05/B-06 de [[TASK_BACKLOG-INTEGRACION]].

- **`fechaEstimada` con calendario:** `FichaViewer` edita el campo con `<input type="date">` nativo — el valor ISO `YYYY-MM-DD` coincide con el contrato; display `dd/mm/aaaa`. Sin dependencias nuevas.
- **Logo ZOFRI en header:** `client/public/logo-zofri.jpg` servido como estático; `<img>` a la izquierda de "Asistente Logístico NOA" en `Dashboard.jsx` (badge blanco redondeado sobre el fondo arena).
- Verificación: lint 0/0 · tests 12/12 · build OK · asset y módulos sirven 200 en `:5173`.

---

## Relacionado

- Hub: [[INDEX]] · Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-INTEGRACION]] · Contrato: [[CONTRATO-API]]
- Specs usadas: [[Stack-Tecnico]] · [[Testing-E2E]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Corredores-NOA]]
