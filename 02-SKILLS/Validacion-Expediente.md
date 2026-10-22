---
tipo: skill
tags: [skill, validacion, modulo-2, reglas]
---

# SKILL: Validacion-Expediente

> Motor de reglas que detecta campos faltantes en una `FichaTecnica` y genera las preguntas que el operador debe hacerle al cliente para completar el expediente. Sin LLM: es lógica determinística.

**Usada por:** [[LogisticsParser]] (post-parseo) · [[RFQGenerator]] (advertencias) · **Ejecutada en:** `POST /api/validate` ([[CONTRATO-API]]).

---

## 1. Regla de negocio

Una consulta de flete solo puede cotizarse si el forwarder/navieria sabe **qué**, **cuánto**, **de dónde a dónde** y **bajo qué condición comercial**. Todo lo demás es deseable.

## 2. Matriz de campos

| Campo (`FichaTecnica`) | Severidad | Motivo | Pregunta para el cliente |
|---|---|---|---|
| `carga.tipo` | alta | Sin tipo de mercadería no hay tarifa ni restricciones | "¿Qué mercadería querés transportar?" |
| `carga.pesoKg` | alta | El peso define tarifa y equipamiento | "¿Cuántos kilogramos pesa la carga en total?" |
| `carga.contenedor` | alta | Define costo (FCL 20/40/40HC vs LCL vs reefer) | "¿Necesitás contenedor completo (20', 40' o 40HC) o carga suelta (LCL)?" |
| `carga.cantidad` | alta | Cantidad de unidades/contenedores | "¿Cuántos contenedores o pallets son?" |
| `origen.ciudad` | alta | Sin punto de origen no hay tramo terrestre | "¿Desde qué ciudad/punto sale la carga?" |
| `destino.pais` | alta | Sin destino no hay corredor ni puerto | "¿A qué país (y ciudad/puerto) va destinada?" |
| `operacion` | alta | Exportación vs importación cambia todo el trámite | "¿Es una exportación o una importación?" |
| `carga.volumenM3` | media | Necesario para LCL y cargas voluminosas | "¿Sabés el volumen total en m³ o las dimensiones de los pallets?" |
| `incoterm` | media | Define quién paga cada tramo | "¿Bajo qué incoterm cotizamos? (FOB, CIF, EXW…)" |
| `fechaEstimada` | media | Disponibilidad de espacio en buque | "¿Para qué fecha necesitás embarcar?" |
| `contacto.empresa` | media | Formalidad del RFQ | "¿A nombre de qué empresa emitimos la solicitud?" |
| `destino.ciudad` | media | Refina puerto de descarga | "¿A qué ciudad o puerto específico llega?" |

## 3. Lógica de ejecución

```
completo = true
alertas = []
para cada fila de la matriz:
  si valor(ficha, campo) es null o vacío:
    alertas.push({ campo, mensaje, pregunta, severidad })
    si severidad == "alta": completo = false
devolver { alertas, completo }
```

- El `campo` se emite en notación dot (`carga.pesoKg`) para que el front lo resalte en el viewer.
- `completo: true` habilita el estado "✅ lista para RFQ" en la UI.
- El orden de `alertas` sigue el orden de la tabla (altas primero).

## 4. Casos borde a testear (input de [[Testing-E2E]])

- `pesoKg: 0` → tratar como faltante (0 no es un peso real).
- `contenedor: "LCL"` + `volumenM3: null` → subir `volumenM3` a severidad **alta** (LCL se cotiza por m³).
- `incoterm` con valor no reconocido → alerta media "Incoterm no estándar, verificar".
- `destino.pais` presente pero `origen.ciudad` null → la alerta de origen no se oculta (común: el cliente menciona destino y olvida el origen).
- Texto con peso en `tn` mal normalizado → el parser corrige, validación solo ve `pesoKg`.

---

## Relacionado

- Agentes: [[LogisticsParser]] · [[RFQGenerator]] · [[BackendDev]] (implementa las reglas) · [[IntegradorQA]] (testea casos borde)
- Skills: [[Parsing-NLP]] · [[Generacion-RFQ]] · [[Corredores-NOA]]
- [[CONTRATO-API]] §2.2/§3 · [[CONTEXTO_MAESTRO]] Módulo 2 · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-NACHO]]
