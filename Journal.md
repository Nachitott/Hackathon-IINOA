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

## Relacionado

- Hub: [[INDEX]] · Backlog: [[TASK_BACKLOG-NACHO]] · Contrato: [[CONTRATO-API]]
- Specs usadas: [[Stack-Tecnico]] · [[Testing-E2E]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Corredores-NOA]]
