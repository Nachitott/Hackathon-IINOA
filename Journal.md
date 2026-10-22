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

## Relacionado

- Hub: [[INDEX]] · Backlog: [[TASK_BACKLOG-NACHO]] · Contrato: [[CONTRATO-API]]
- Specs usadas: [[Stack-Tecnico]] · [[Testing-E2E]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Corredores-NOA]]
