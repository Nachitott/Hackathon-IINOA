---
tipo: backlog
tags: [backlog, nacho, frontend, react]
owner: Nacho
---

# TASK_BACKLOG — NACHO

> **Rol:** Frontend (React) · **Perfil de agente:** [[FrontendDev]] · **Objetivo:** UI demo-able de los 4 módulos que corre primero con mocks y luego contra la API real.
> Leyenda — **Prioridad:** `P0` bloquea la demo · `P1` feature completa · `P2` mejora. **Estimación:** `S` <1h · `M` 1-3h · `L` >3h.

**Clave de trabajo en paralelo:** N-07 (mocks) te desacopla del backend — podés construir TODA la UI antes de que exista un solo endpoint real. Después solo cambiás la flag `USE_MOCK`.

---

## FASE 0 — Setup & Contratos

### N-01 — Scaffold Vite + React
`P0` · `S` · depende de: — · skill: [[Stack-Tecnico]]
- `client/` con estructura `src/components`, `src/pages`, `src/lib` + `npm run dev`.
- [ ] AC: app levanta en `:5173` con `App.jsx` renderizando.

### N-02 — Tailwind + tema base
`P0` · `S` · depende de: N-01 · spec: [[UXUIDesigner]]
- Instalar Tailwind; definir tokens: severidades (`alta`=rojo, `media`=ámbar, `ok`=verde) + paleta NOA de B-06 cuando llegue.
- [ ] AC: clases de severidad aplicadas a un componente de prueba visible.

### N-03 — Wrapper `lib/api.js`
`P0` · `S` · depende de: N-01 · spec: [[CONTRATO-API]]
- `apiFetch(path, opts)` con base `VITE_API_URL`, manejo de `{ error }`, loading y flag `USE_MOCK` que desvía a `lib/mocks.js`.
- [ ] AC: `USE_MOCK=true` → las llamadas devuelven mocks sin tocar red.

### N-04 — Typedefs del contrato
`P0` · `S` · depende de: B-01 ([[TASK_BACKLOG-BRUNO]])
- `lib/types.js` con `@typedef` JSDoc de `FichaTecnica`, `Alerta`, `Corredor`, `Rfq` — copy exacto del contrato §2.
- [ ] AC: un typo en el contrato se detecta en review, no en runtime.

---

## FASE 1 — Fundaciones

### N-05 — Layout dashboard hero
`P0` · `M` · depende de: N-02 · spec: [[UXUIDesigner]]
- Vista única: columna input | ficha+alertas | comparador+RFQ (o tabs si el ancho no da). Pensado para proyector.
- [ ] AC: en 1440px se ven las 3 zonas sin scroll horizontal.

### N-06 — Estado global de la ficha
`P0` · `S` · depende de: N-04
- `AppContext` (o `useState` elevado): `ficha`, `alertas`, `corredorSel`, `rfq`, `loading`, `error`.
- [ ] AC: cada panel lee/actualiza el mismo estado.

### N-07 — Mocks `lib/mocks.js`
`P0` · `S` · depende de: N-04 · ejecuta temprano — desbloquea todo lo demás
- Responses de ejemplo para `/parse`, `/validate`, `/corredores`, `/rfq` con shape idéntico al contrato (usar fixtures de B-02 como input).
- [ ] AC: la UI corre el flujo completo sin backend levantado.

---

## FASE 2 — Módulos core (todo con mocks; contra API real cuando [[TASK_BACKLOG-LUCAS]] entregue)

### N-08 — `ChatInput` + botón "Estructurar"
`P0` · `M` · depende de: N-03, N-07
- Textarea tipo chat que acepta texto informal → `POST /api/parse` → guarda `ficha`+`alertas` en estado. Loading con spinner; error visible.
- [ ] AC: pegar T-01 muestra la ficha poblada (con mock primero, con API después).

### N-09 — `FichaViewer`
`P0` · `M` · depende de: N-06
- Render agrupado (contacto / operación / origen-destino / carga / extras). `null` → `"—"` atenuado. Campos con alerta alta: borde rojo.
- [ ] AC: los 7 campos altos faltantes se ven marcados de un vistazo.

### N-10 — `AlertasPanel`
`P0` · `M` · depende de: N-09
- Lista de alertas con icono de severidad + la `pregunta` sugerida al cliente (el momento wow de la demo). Badge "✅ expediente completo" cuando `completo: true`.
- [ ] AC: orden altas→medias; cada alerta linkea visualmente a su campo en la ficha.

### N-11 — `ComparadorCorredores`
`P0` · `M` · depende de: N-06 · datos: [[Corredores-NOA]]
- Dos cards (Pacífico/Atlántico) con pros/contras/pasos/puertos + selector que guarda `corredorSel`. Banner de advertencia invernal sobre Jama.
- [ ] AC: seleccionar un corredor habilita la generación de RFQ con contexto.

### N-12 — `EditorRFQ` + copiar
`P0` · `M` · depende de: N-06
- Botón "Generar RFQ" → `POST /api/rfq` → muestra `asunto` + textarea editable del `texto` + botón "Copiar" (`navigator.clipboard`). Banner si hay `advertencias`.
- [ ] AC: el texto editado es lo que se copia; `[A COMPLETAR]` visible donde faltan datos.

---

## FASE 3 — Features extra

### N-13 — `MapaCorredores` (Leaflet)
`P1` · `L` · depende de: N-11
- Leaflet + OSM: marcadores de puertos (lat/lng del contrato) y líneas Salta/Jujuy→puertos. Fallback: si el mapa no carga, quedan solo las cards de N-11.
- [ ] AC: el mapa muestra ambos corredores diferenciados por color.

### N-14 — Login UI (Supabase Auth)
`P1` · `M` · depende de: L-15 ([[TASK_BACKLOG-LUCAS]])
- `@supabase/supabase-js` en el front: form login + guard de ruta + header con usuario. Si `AUTH_OPTIONAL`, botón "Entrar como demo".
- [ ] AC: login real muestra historial propio; modo demo salta el login.

### N-15 — `HistorialConsultas`
`P1` · `M` · depende de: L-14
- Lista de consultas guardadas (`GET /api/consultas`) → click recarga la ficha en el dashboard.
- [ ] AC: re-cargar una consulta vieja repuebla ficha+alertas.

### N-16 — Exportar RFQ a PDF
`P1` · `S` · depende de: L-16
- Botón "Descargar PDF" → `POST /api/rfq/pdf` → download. Fallback siempre disponible: "Copiar texto" (N-12).
- [ ] AC: PDF descargado se abre con la ficha + texto del RFQ.

### N-17 — Pulido visual y estados
`P1` · `M` · depende de: N-05, B-06 · spec: [[UXUIDesigner]]
- Empty states, toasts de error, responsive básico, indicador `"modo": "fallback"` cuando el parser corre sin Gemini.
- [ ] AC: ningún estado de la app se ve "roto" en la demo.

---

## FASE 4 — Demo

### N-18 — Botón "Cargar ejemplo"
`P0` · `S` · depende de: B-02
- Atajo que pega fixture T-01 (y T-04 como caso incompleto extremo) en el input — la demo no depende de tipear en vivo.
- [ ] AC: un click carga el texto de ejemplo.

### N-19 — Checklist visual pre-demo
`P0` · `S` · depende de: N-07..N-12
- Recorrer el flujo feliz completo en `USE_MOCK=false` contra la API real + reportar a B-14.
- [ ] AC: flujo parse→alertas→corredor→RFQ→copiar verificado E2E.

### N-20 — Ensayo en máquina de presentación
`P0` · `S` · depende de: B-14
- Levantar front+back en la laptop que presenta, zoom de fuente al 125-150% para proyector.
- [ ] AC: la demo corre en la máquina real, no solo en la tuya.

---

## Relacionado

- Hub: [[INDEX]] · Contexto: [[CONTEXTO_MAESTRO]] · Contrato: [[CONTRATO-API]]
- Mi perfil: [[FrontendDev]] · renderizo a: [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]]
- Specs de diseño: [[UXUIDesigner]] · Skills: [[Stack-Tecnico]] · [[Generacion-RFQ]]
- Backlogs del equipo: [[TASK_BACKLOG-LUCAS]] (provee la API) · [[TASK_BACKLOG-BRUNO]] (QA + branding B-06 + fixtures B-02)
- Bugs que me reportan: template en [[Testing-E2E]] §6
