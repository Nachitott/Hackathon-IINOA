---
tipo: skill
tags: [skill, stack, convenciones, react, express, supabase, gemini]
---

# SKILL: Stack-Tecnico

> Convenciones técnicas del proyecto para que los 3 integrantes (y los agentes) trabajen con las mismas decisiones. Si cambiás algo de acá, actualizá [[CONTRATO-API]] y los backlogs.

**Usada por:** [[FrontendDev]] · [[BackendDev]] · [[IntegradorQA]] · todos los perfiles de desarrollo.

---

## 1. Stack fijado

| Capa | Elección | Motivo |
|---|---|---|
| Frontend | Vite + React 18 (JS) | Scaffold en minutos, sin overhead de TS en hackathon |
| Estilos | Tailwind CSS | UI rápida y consistente sin diseñar CSS desde cero |
| Routing | React Router | SPA con vistas: dashboard, historial, login |
| Mapa | Leaflet + OpenStreetMap | Gratis, sin API key — ideal para corredores |
| Backend | Node 20 + Express 4 | Simple, conocido por todos |
| Validación | zod | Schemas compartidos con [[CONTRATO-API]] |
| IA | `@google/genai` (Gemini) | Modelo `gemini-2.0-flash`, `temperature: 0` |
| DB | PostgreSQL en Supabase | `@supabase/supabase-js` + RLS |
| Auth | Supabase Auth (email magic link o password) | JWT validado en middleware Express |
| PDF | pdfkit (server) | Fallback: copiar texto / print CSS |

## 2. Estructura de repo sugerida

```text
repo/
├── client/                 # Vite + React
│   ├── src/
│   │   ├── components/     # ChatInput, FichaViewer, AlertasPanel, ComparadorCorredores, EditorRFQ, MapaCorredores
│   │   ├── pages/          # Dashboard, Historial, Login
│   │   ├── lib/api.js      # wrapper fetch contra el contrato
│   │   └── lib/types.js    # JSDoc typedefs de FichaTecnica/Alerta/Corredor
│   └── .env                # VITE_API_URL, VITE_SUPABASE_*
├── server/                 # Express
│   ├── src/
│   │   ├── routes/         # parse.js, validate.js, corredores.js, rfq.js, consultas.js
│   │   ├── services/       # gemini.js, parser-fallback.js, rfq-template.js, pdf.js
│   │   ├── db/             # supabase.js, migrations/, seeds/
│   │   └── middleware/     # auth.js, errors.js
│   └── .env                # GEMINI_API_KEY, SUPABASE_*, PORT
└── tests/fixtures/         # dataset de mensajes (ver Testing-E2E)
```

## 3. Convenciones

- **Ramas:** `main` protegida · feature branches `feat/n-07-chat-input`, `fix/...` — PRs cortos.
- **Commits:** `tipo: mensaje` en español (`feat:`, `fix:`, `chore:`).
- **Secrets:** nunca commitear `.env` — solo `.env.example` con placeholders.
- **Mocks:** el front consume `src/lib/mocks.js` mientras el back no esté listo → mismo shape del contrato.
- **Scripts:** `npm run dev` en `client/` (5173) y `server/` (3001) — documentar en README.

## 4. Decisiones pendientes (registrar acá)

- [ ] Deploy: ¿Render/Railway o demo 100% local?
- [ ] Auth en demo: ¿Supabase Auth real o botón "entrar como demo"?
- [ ] Export PDF: ¿server (pdfkit) o client (jsPDF)?

---

## Relacionado

- Agentes: [[FrontendDev]] · [[BackendDev]] · [[IntegradorQA]] · [[UXUIDesigner]]
- Skills: [[Parsing-NLP]] · [[Generacion-RFQ]] · [[Testing-E2E]]
- [[CONTRATO-API]] · [[INDEX]] · Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
