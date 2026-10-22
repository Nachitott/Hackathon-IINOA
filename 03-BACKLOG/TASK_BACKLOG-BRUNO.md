---
tipo: backlog
tags: [backlog, bruno, qa, testing, integracion, diseño]
owner: Bruno
---

# TASK_BACKLOG — BRUNO

> **Rol:** QA + Integración + apoyo en Diseño · **Perfil de agente:** [[IntegradorQA]] · **Objetivo:** que el flujo completo funcione de punta a punta y la demo no falle en vivo.
> Leyenda — **Prioridad:** `P0` bloquea la demo · `P1` feature completa · `P2` mejora. **Estimación:** `S` <1h · `M` 1-3h · `L` >3h.

**Tu rol transversal:** sos el pegamento entre [[TASK_BACKLOG-NACHO]] (front) y [[TASK_BACKLOG-LUCAS]] (back). Ellos construyen en paralelo; vos verificás que las piezas encajen. Tenés veto de calidad: con un `P0` abierto la demo no sale.

---

## FASE 0 — Setup & Contratos

### B-01 — Validar [[CONTRATO-API]] con el equipo
`P0` · `S` · depende de: — · desbloquea: N-04, L-08
- Reunión de 30' con Nacho y Lucas: recorrer schemas §2 y endpoints §3; anotar dudas y resolverlas ANTES de que nadie programe contra el contrato.
- [ ] AC: los 3 confirman el contrato; dudas resueltas quedan escritas en el mismo archivo.

### B-02 — Dataset de fixtures `tests/fixtures/mensajes.json`
`P0` · `M` · depende de: — · skill: [[Testing-E2E]] §2 · valida: [[LogisticsExpert]]
- Mínimo 8 mensajes con jerga NOA (la tabla T-01..T-08 de la skill) + el output esperado de cada uno.
- [ ] AC: cada fixture tiene `input`, `fichaEsperada` parcial y `alertasEsperadas` — sirve para parser (B-05) y para el botón "ejemplo" del front (N-18).

### B-03 — Convenciones de repo + README
`P0` · `S` · depende de: — · skill: [[Stack-Tecnico]] §3
- `main` protegida, ramas `feat/` `fix/`, `.env.example` verificado (sin secrets commiteados), README con orden de arranque front+back.
- [ ] AC: cualquiera del equipo clona y levanta siguiendo solo el README.

---

## FASE 1 — Fundaciones

### B-04 — Smoke tests de API
`P0` · `M` · depende de: B-01, L-03 · skill: [[Testing-E2E]] §3
- Colección (Postman/Thunder o script `smoke.sh` con curls) de todos los endpoints del contrato; corre contra `:3001`.
- [ ] AC: un comando/colección recorre los 7 endpoints y reporta verde/rojo.

### B-06 — Branding rápido para la UI
`P1` · `S` · depende de: — · spec: [[UXUIDesigner]] · entrega a: N-02, N-17
- Paleta NOA (tierra/cobre/andes), logo simple (SVG), nombre de la app, favicon.
- [ ] AC: tokens de color listados para Tailwind + assets en `client/public/`.

### B-05 — Validar parser contra fixtures
`P0` · `M` · depende de: B-02, L-09 · skill: [[Parsing-NLP]]
- Correr los 8 fixtures contra `/api/parse` real y comparar output vs. esperado → tabla de resultados (fixture | campo | esperado | real | ok?).
- [ ] AC: discrepancias reportadas como bugs a L-09; objetivo ≥7/8 campos clave correctos.

---

## FASE 2 — Módulos core

### B-07 — Test de reglas de validación
`P0` · `M` · depende de: L-10 · skill: [[Validacion-Expediente]] §4
- Casos borde: `pesoKg: 0`, LCL sin volumen, incoterm inventado, ficha vacía, ficha T-07 completa.
- [ ] AC: la regla LCL→volumen-alta y los 5 casos dan el resultado esperado.

### B-09 — Bug tracker + template
`P0` · `S` · depende de: — · skill: [[Testing-E2E]] §6
- Issues del repo (o `BUGS.md` en raíz) con el template: sev, pasos, esperado/real, fixture, tarea asignada.
- [ ] AC: existe un lugar único donde los 3 reportan y ven bugs.

### B-08 — E2E del flujo feliz
`P0` · `M` · depende de: L-09..L-12, N-07..N-12 · skill: [[Testing-E2E]] §4
- Recorrer el checklist E2E completo contra la app integrada (sin mocks).
- [ ] AC: checklist §4 todo en verde, o bugs P0 reportados y asignados.

---

## FASE 3 — Features extra + Plan B

### B-10 — Verificar extras y sus fallbacks
`P1` · `M` · depende de: N-13..N-16, L-14..L-16
- Mapa (si Leaflet falla → quedan cards), PDF (si falla → copiar texto), auth (si falla → `AUTH_OPTIONAL`).
- [ ] AC: cada extra tiene su fallback verificado funcionando — nada queda "o anda o nada".

### B-11 — Plan B de la demo
`P0` · `M` · depende de: B-08 · skill: [[Pitch-Demo]] §3
- Screenshots de cada paso + video del flujo completo + hotspot del celular probado.
- [ ] AC: la demo podría presentarse completa con pantalla caída (solo video+slides).

### B-12 — Assets UI complementarios
`P1` · `S` · depende de: B-06
- Iconos de severidad, imágenes/ilustración de corredores para el comparador, spinner/logo de carga.
- [ ] AC: entregados a N-17 en `client/src/assets/` o `public/`.

---

## FASE 4 — Demo

### B-13 — Guion de demo + timing
`P0` · `M` · depende de: B-08 · ejecuta: [[Pitch]] · skill: [[Pitch-Demo]] §2
- Escribir con el equipo el guion paso a paso (qué fixture, qué se señala, quién habla) y medirlo: < 2'30" en pantalla.
- [ ] AC: guion escrito y cronometrado en ensayo.

### B-14 — Checklist final pre-demo
`P0` · `S` · depende de: L-19, N-19 · skill: [[Testing-E2E]] §5
- Ejecutar TODA la checklist §5: health verde, Gemini respondiendo (o fallback declarado), datos precargados, plan B en la laptop, red probada, 0 bugs P0.
- [ ] AC: checklist firmada — tu veto a favor.

### B-15 — Ensayo general
`P0` · `M` · depende de: B-13, B-14
- Demo completa de corrido con los 3, en la máquina de presentación (N-20), con Q&A simulado ([[Pitch-Demo]] §4).
- [ ] AC: una pasada completa sin tropiezos técnicos ni de guion.

### B-16 — Slides de apoyo (opcional)
`P2` · `M` · depende de: B-13 · skill: [[Pitch-Demo]] §5
- 4 slides máximo: problema → solución → corredores → stack+equipo.
- [ ] AC: solo si sobra tiempo — la demo en vivo es la prioridad.

---

## Relacionado

- Hub: [[INDEX]] · Contexto: [[CONTEXTO_MAESTRO]] · Contrato: [[CONTRATO-API]] (lo custodiás, B-01)
- Mi perfil: [[IntegradorQA]] · co-demo con: [[Pitch]] · apoyo diseño de: [[UXUIDesigner]] · validación de dominio: [[LogisticsExpert]]
- Skills: [[Testing-E2E]] · [[Pitch-Demo]] · [[Stack-Tecnico]] · [[Validacion-Expediente]]
- Backlogs del equipo: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]]
- Producto que testeás: [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]]
