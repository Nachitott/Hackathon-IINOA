---
tipo: moc
tags: [index, moc, navegacion]
---

# INDEX — Hackathon INNOA

> Hub central del vault. Punto de entrada para navegar todo el proyecto: contexto, contrato, agentes, skills y backlogs del equipo.

---

## El proyecto en 1 línea

**Asistente inteligente de estructuración logística** para el NOA (Jujuy/Salta): transforma consultas informales en fichas técnicas, detecta datos faltantes, compara corredores Pacífico/Atlántico y redacta RFQs profesionales. Ver [[CONTEXTO_MAESTRO]].

## Flujo de la app

```text
texto informal (WhatsApp/mail)
        │
        ▼  POST /api/parse        ──► [[LogisticsParser]] + [[Parsing-NLP]]
  FichaTecnica (JSON)
        │
        ▼  POST /api/validate     ──► [[Validacion-Expediente]]
  ficha + Alerta[]  ──────────────► UI: FichaViewer + alertas (el "wow")
        │
        ├─► GET /api/corredores   ──► [[RouteAnalyzer]] + [[Corredores-NOA]]
        │                             comparador Pacífico vs Atlántico
        ▼
  POST /api/rfq (+/pdf)           ──► [[RFQGenerator]] + [[Generacion-RFQ]]
        │
        ▼
  RFQ editable → copiar / PDF → enviar a naviera/forwarder
```

Stack: **React (Vite) → API Express (Node) → PostgreSQL en Supabase · IA: Google Gemini**. Convenciones en [[Stack-Tecnico]].

## Documento fundacional

- [[CONTEXTO_MAESTRO]] — desafío, problema, módulos y objetivos del hackathon
- [[CONTRATO-API]] — **fuente única de verdad** front↔back (schemas + endpoints + env vars)
- [[GLOSARIO]] — vocabulario oficial del desafío (depósito fiscal, roundtrip, free time, Angamos, COCEL, ZOFRI)
- [[Journal]] — bitácora de avance de implementación (`client/` ya scaffolded)

## Agentes — `01-AGENTES/`

| Agente | Rol | Módulo / Área |
|---|---|---|
| [[LogisticsParser]] | NLP: texto informal → JSON | Módulo 1 (producto) |
| [[RouteAnalyzer]] | Comparador de corredores | Módulo 3 (producto) |
| [[RFQGenerator]] | Ficha → documento RFQ formal | Módulo 4 (producto) |
| [[FrontendDev]] | React/UI de todo el sistema | Capa front |
| [[BackendDev]] | Express + Supabase + Gemini | Capa back |
| [[IntegradorQA]] | Testing, integración, calidad | Transversal |
| [[UXUIDesigner]] | Flujos, layout, sistema visual | Diseño |
| [[LogisticsExpert]] | Curador de datos de dominio NOA | Dominio |
| [[Pitch]] | Guion, presentación, Q&A | Demo |

## Skills — `02-SKILLS/`

| Skill | Detalla | Usada por |
|---|---|---|
| [[Parsing-NLP]] | Prompt Gemini, jerga NOA, fallback | [[LogisticsParser]], [[BackendDev]] |
| [[Corredores-NOA]] | Datos de corredores + matriz comparativa | [[RouteAnalyzer]], [[LogisticsExpert]] |
| [[Validacion-Expediente]] | Reglas de campos indispensables | [[LogisticsParser]], [[RFQGenerator]] |
| [[Generacion-RFQ]] | Plantilla RFQ + exportación | [[RFQGenerator]], [[FrontendDev]] |
| [[Stack-Tecnico]] | Convenciones de stack y repo | Todos los devs |
| [[Testing-E2E]] | Fixtures, smoke, checklists demo | [[IntegradorQA]] |
| [[Pitch-Demo]] | Guion pitch + plan B | [[Pitch]], [[IntegradorQA]] |

## Backlogs — `03-BACKLOG/`

| Integrante | Rol | Backlog |
|---|---|---|
| Nacho | Frontend | [[TASK_BACKLOG-NACHO]] |
| Lucas | Backend + Datos | [[TASK_BACKLOG-LUCAS]] |
| Bruno | QA + Integración + Diseño | [[TASK_BACKLOG-BRUNO]] |

> Las 3 backlogs comparten las mismas 5 fases (0 Setup → 4 Demo) con tareas cruzadas por ID — una dependencia `L-09` en el backlog de Nacho referencia la tarea L-09 de Lucas.

---

## Relacionado

- Todo el vault se conecta desde acá: [[CONTEXTO_MAESTRO]] · [[CONTRATO-API]] · [[GLOSARIO]]
- Agentes: [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]] · [[FrontendDev]] · [[BackendDev]] · [[IntegradorQA]] · [[UXUIDesigner]] · [[LogisticsExpert]] · [[Pitch]]
- Skills: [[Parsing-NLP]] · [[Corredores-NOA]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Stack-Tecnico]] · [[Testing-E2E]] · [[Pitch-Demo]]
- Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
