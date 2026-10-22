---
tipo: skill
tags: [skill, testing, qa, e2e, demo]
---

# SKILL: Testing-E2E

> Estrategia de pruebas del proyecto: dataset de mensajes con jerga, smoke tests de API, casos borde del motor de validación y checklist final de demo.

**Usada por:** [[IntegradorQA]] (propietario) · apoya a [[FrontendDev]] y [[BackendDev]].

---

## 1. Pirámide de pruebas (hackathon — pragmática)

1. **Smoke API** — curls/postman por cada endpoint de [[CONTRATO-API]].
2. **Contract tests** — los outputs respetan los schemas (zod o validación manual).
3. **Casos de dominio** — el parser + validación sobre el dataset de §2.
4. **E2E manual** — flujo completo en la UI + checklist de demo.

## 2. Dataset de fixtures (`tests/fixtures/mensajes.json`)

Mínimo 8 casos cubriendo completos/incompletos/jerga:

| ID | Texto de entrada | Debe detectar | Alertas esperadas |
|---|---|---|---|
| T-01 | "necesito mandar 2 containers de 40 de sal a china desde salta" | export, 40ST×2, sal, Salta→China | peso, incoterm (altas) |
| T-02 | "quiero exportar 18 tn de arandanos a miami, un reefer, sale de guemes jujuy, fob" | 18.000 kg, reefer, FOB, Jujuy→EE.UU. | destino.pais ok, origen.ciudad (Güemes) |
| T-03 | "me traen maquinaria de brasil, puerto santos, 12 pallets, 8 ton" | import, LCL×12, 8.000 kg, Santos | destino, volumen (LCL→alta) |
| T-04 | "hola, tengo una exportacion" | operacion sola | todas las altas |
| T-05 | "exportar limones a chile, camion completo, 20 pallets de 500kg" | TIR/terrestre → contenedor null pero peso 10.000 kg | contenedor (alta) |
| T-06 | "cif valparaiso, azucar 25tn en un 40" | import implícita?, CIF, 25.000 kg, 40ST | operacion ambigua → alta |
| T-07 | "sal a india, 3x40hc, 80 toneladas totales, salimos de oran, EXW" | ficha casi completa → `completo: true` | fecha, empresa (medias) |
| T-08 | "precio puesto en puerto de antofagasta, litio 20tn" | incoterm≈FOB en observaciones, Antofagasta origen/destino? | caso engañoso — validar con [[LogisticsExpert]] |

## 3. Smoke tests API (checklist)

```bash
curl localhost:3001/api/health                                    # 200
curl -X POST localhost:3001/api/parse -d '{"texto":"<T-01>"}'    # ficha + alertas
curl -X POST localhost:3001/api/validate -d '{"ficha":{...}}'    # {alertas, completo}
curl localhost:3001/api/corredores                               # 2 corredores
curl -X POST localhost:3001/api/rfq -d '{"ficha":{...}}'         # asunto + texto
curl -X POST localhost:3001/api/rfq/pdf -d '{"texto":"..."}'     # application/pdf
curl -X POST localhost:3001/api/consultas -H "Authorization: Bearer <jwt>"  # 401 sin token
```

## 4. Checklist E2E (flujo feliz)

- [ ] Pegar T-01 → ficha se renderiza con campos completos y "—" en nulls
- [ ] Panel de alertas muestra solo las altas/medias correctas con preguntas
- [ ] Editar ficha en UI → re-valida (`/api/validate`) y actualiza alertas
- [ ] Comparador muestra ambos corredores con pros/contras
- [ ] Generar RFQ → asunto correcto, texto editable, `[A COMPLETAR]` donde falte
- [ ] Copiar texto funciona; PDF descarga o fallback documentado
- [ ] Login → historial muestra la consulta guardada
- [ ] Estado "modo fallback" visible si Gemini está caído

## 5. Checklist final pre-demo (con [[Pitch-Demo]])

- [ ] `GET /api/health` verde 30 min antes de presentar
- [ ] Gemini responde (o fallback listo y declarado)
- [ ] Datos demo precargados en historial
- [ ] Screenshots + video backup (plan B) en la laptop de presentación
- [ ] Wi-Fi probado / hotspot de respaldo
- [ ] Bug tracker limpio: sin P0 abiertos

## 6. Reporte de bugs (template)

```text
SEV: P0 (bloquea demo) | P1 | P2
Pasos: 1) ... 2) ...
Esperado / Real:
Fixture (si aplica): T-0X
Asignado a: tarea del backlog (ej. L-09 de [[TASK_BACKLOG-LUCAS]])
```

---

## Relacionado

- Agentes: [[IntegradorQA]] (propietario) · [[LogisticsParser]] · [[BackendDev]] · [[FrontendDev]] · [[Pitch]]
- Skills: [[Parsing-NLP]] · [[Validacion-Expediente]] · [[Pitch-Demo]] · [[Stack-Tecnico]]
- [[CONTRATO-API]] · [[TASK_BACKLOG-BRUNO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-NACHO]]
