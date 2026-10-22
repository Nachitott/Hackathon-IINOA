# INNOA — Frontend (client)

UI del asistente de estructuración logística NOA.
Stack: Vite + React 18 (JS) + Tailwind v4 + React Router + Leaflet.

## Arranque

```bash
npm install
npm run dev        # → http://localhost:5173
```

## Variables de entorno

Copiar `.env.example` → `.env` (nunca commitear `.env`).

| Var | Qué hace |
|---|---|
| `VITE_USE_MOCK=true` | `lib/api.js` devuelve `lib/mocks.js` sin tocar red — toda la UI corre sin backend |
| `VITE_USE_MOCK=false` | pega a la API real en `VITE_API_URL` |

## Convenciones

- Componentes en `src/components/`, páginas en `src/pages/`.
- Wrapper fetch único: `src/lib/api.js` (`apiFetch` + helpers por endpoint).
- Errores estándar del contrato: `ApiError { code, message, status }`.
- Mocks con shape exacto del contrato: `src/lib/mocks.js`.
- Typedefs JSDoc del contrato: `src/lib/types.js`.
- Campos `null` se renderizan como `"—"`, nunca rompen la UI.

Fuente de verdad del contrato: `../CONTRATO-API.md`.
