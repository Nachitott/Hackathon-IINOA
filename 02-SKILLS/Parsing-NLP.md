---
tipo: skill
tags: [skill, nlp, gemini, modulo-1]
---

# SKILL: Parsing-NLP

> Extracción de datos logísticos desde texto informal (WhatsApp, mail, prompt libre) hacia `FichaTecnica` JSON. Implementada con Google Gemini + fallback heurístico sin LLM.

**Usada por:** [[LogisticsParser]] · **Ejecutada en:** `POST /api/parse` ([[CONTRATO-API]]).

---

## 1. Propósito

Recibir un texto desestructurado con jerga logística regional del NOA y devolver **solo** un JSON que cumpla el schema `FichaTecnica`. Regla de oro: **un dato ausente es `null`, nunca inventado**.

## 2. Diccionario de jerga logística regional

| Expresión informal | Normalización |
|---|---|
| "veinte pies", "un 20", "container de 20" | `contenedor: "20ST"` |
| "cuarenta", "un 40", "container de 40" | `contenedor: "40ST"` |
| "cuarenta high cube", "40HC" | `contenedor: "40HC"` |
| "suelto", "carga suelta", "pallets sueltos", "compartido" | `contenedor: "LCL"` |
| "reefer", "refrigerado", "camara fria" | `contenedor: "reefer"` |
| "tn", "toneladas", "tonelada" | `pesoKg = valor × 1000` |
| "kg", "kilos" | `pesoKg = valor` |
| "m3", "metros cubicos", "cubos" | `volumenM3 = valor` |
| "full", "contenedor completo", "FCL" | `contenedor` = tipo completo (no LCL) |
| "exportar", "mandar afuera", "sacar del pais" | `operacion: "exportacion"` |
| "importar", "traer de", "comprar afuera" | `operacion: "importacion"` |

### Orígenes/destinos típicos del dominio

- Origen frecuente: `Salta`, `Jujuy`, `San Salvador de Jujuy`, `Güemes`, `Perico`, `Orán` → `provincia: "Salta"|"Jujuy"`.
- Puertos Pacífico: `Antofagasta`, `Mejillones`, `Iquique` (Chile) — vía [[Corredores-NOA]] Paso de Jama.
- Puertos Atlántico: `Buenos Aires`, `Rosario`, `Zárate`.
- Destinos de exportación comunes NOA: `China`, `India`, `EE.UU.`, `Brasil`, `Europa` (normalizar país).

### Cargas típicas NOA (para `carga.tipo`, texto libre pero normalizar)

`sal`, `litio`, `minerales`, `azúcar`, `cítricos/limones`, `arándanos`, `pimientos`, `tabaco`, `legumbres/porotos`, `maquinaria`, `insumos mineros`.

### Incoterms a detectar

`EXW`, `FCA`, `FOB`, `CFR`, `CIF`, `DAP`, `DDP` → extraer tal cual; si dice "precio puesto en puerto" ≈ `FOB`, "con flete y seguro incluido" ≈ `CIF` → marcar en `observaciones` la inferencia.

## 3. Prompt para Gemini (template)

```text
Sos un extractor de datos logísticos de comercio exterior para el NOA argentino
(Jujuy y Salta). Extraé del texto del usuario una ficha técnica JSON.

REGLAS:
- Devolvé ÚNICAMENTE JSON válido, sin markdown ni comentarios.
- Campo ausente en el texto = null. NUNCA inventes datos.
- Normalizá pesos a kg (pesoKg) y volúmenes a m3 (volumenM3).
- "contenedor" solo puede ser: "20ST", "40ST", "40HC", "LCL", "reefer" o null.
- "operacion" solo: "exportacion", "importacion" o null.
- "incoterm": código de 3 letras o null.
- Jerga regional permitida: ver diccionario adjunto.

SCHEMA ESPERADO:
{schema FichaTecnica de CONTRATO-API §2.1, pegado literalmente}

TEXTO DEL USUARIO:
"""{textoOriginal}"""
```

**Modelo recomendado:** `gemini-2.0-flash` (o el flash vigente) — barato y rápido para extracción. `temperature: 0` para determinismo. `responseMimeType: "application/json"`.

## 4. Fallback heurístico (sin LLM)

Si Gemini cae (`502`), el backend corre este parser de respaldo:

1. `/(export|mandar|enviar).*(a|afuera)/i` → `operacion: "exportacion"`; `/(import|traer|comprar).*(de|desde)/i` → `importacion`.
2. Regex de contenedor: `/(20|cuarenta|40)[ -]?(pies|st|hc|')?/i` + keywords `hc|high cube`, `reefer|frio`, `suelto|lcl|pallet`.
3. Peso: `/(\d+[.,]?\d*)\s?(tn|ton|kg|kilo)/i` → normalizar.
4. Volumen: `/(\d+[.,]?\d*)\s?(m3|metro cubico)/i`.
5. Origen/destino: lookup contra lista fija de ciudades/provincias/países del dominio.
6. Incoterm: `/(EXW|FCA|FOB|CFR|CIF|DAP|DDP)/i`.

El response agrega `"modo": "fallback"` para que el front lo muestre (transparencia en demo).

## 5. Ejemplos few-shot

**Input:** `"hola necesito mandar 2 containers de 40 de sal a china, salimos de salta capital"`

```json
{
  "contacto": { "nombre": null, "empresa": null },
  "operacion": "exportacion",
  "origen": { "ciudad": "Salta", "provincia": "Salta" },
  "destino": { "ciudad": null, "pais": "China" },
  "carga": { "tipo": "sal", "pesoKg": null, "volumenM3": null, "contenedor": "40ST", "cantidad": 2 },
  "incoterm": null,
  "fechaEstimada": null,
  "observaciones": null
}
```

**Input:** `"buenas, soy martin de agroandina, quiero importar maquinaria desde brasil, unos 12 pallets, 8 ton total, llegaria a jujuy por septiembre, FOB santos"`

```json
{
  "contacto": { "nombre": "Martin", "empresa": "Agroandina" },
  "operacion": "importacion",
  "origen": { "ciudad": "Santos", "provincia": null },
  "destino": { "ciudad": null, "provincia": "Jujuy" },
  "carga": { "tipo": "maquinaria", "pesoKg": 8000, "volumenM3": null, "contenedor": "LCL", "cantidad": 12 },
  "incoterm": "FOB",
  "fechaEstimada": null,
  "observaciones": "Fecha deseada: septiembre (sin año). Origen Brasil deducido del puerto de Santos."
}
```

## 6. Post-parseo

La ficha se pasa **siempre** por el motor [[Validacion-Expediente]] antes de responder — el endpoint devuelve `ficha` + `alertas` juntas (ver [[CONTRATO-API]] §3).

---

## Relacionado

- Agentes: [[LogisticsParser]] (propietario) · [[BackendDev]] (implementa el endpoint) · [[IntegradorQA]] (testea contra dataset de [[Testing-E2E]])
- Skills: [[Validacion-Expediente]] · [[Corredores-NOA]] · [[Stack-Tecnico]]
- [[CONTRATO-API]] · [[CONTEXTO_MAESTRO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
