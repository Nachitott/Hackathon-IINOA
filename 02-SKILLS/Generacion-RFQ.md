---
tipo: skill
tags: [skill, rfq, modulo-4, documento, pdf]
---

# SKILL: Generacion-RFQ

> Compila una `FichaTecnica` validada en una **Request for Quotation** formal, editable y exportable, lista para enviar a navieras / freight forwarders.

**Usada por:** [[RFQGenerator]] · **Ejecutada en:** `POST /api/rfq` y `POST /api/rfq/pdf` ([[CONTRATO-API]]).

---

## 1. Propósito

El RFQ es el output "comercial" del sistema: transforma el expediente técnico en un documento que un humano puede enviar por mail tal cual o editar mínimamente.

## 2. Plantilla del documento

```text
ASUNTO: RFQ – {operacion} {carga.tipo} ({cantidad}x{contenedor}) {origen.ciudad} → {destino.pais}

Estimados:

Por medio del presente solicito cotización para el siguiente servicio
de transporte internacional:

OPERACIÓN
  Tipo:               {exportacion|importacion}
  Origen:             {origen.ciudad}, {origen.provincia}, Argentina
  Destino:            {destino.ciudad ? destino.ciudad + ', ' : ''}{destino.pais}
  Corredor evaluado:  {corredor.nombre} (vía {pasosFronterizos|puertos})
  Incoterm:           {incoterm | "a convenir"}

CARGA
  Mercadería:         {carga.tipo}
  Peso total:         {carga.pesoKg} kg
  Volumen:            {carga.volumenM3} m³
  Equipamiento:       {cantidad} x {contenedor}
  Fecha estimada:     {fechaEstimada | "a definir"}

SE SOLICITA COTIZAR
  1. Flete marítimo {puerto_origen} → {puerto_destino}
  2. Cargos de terminal en origen (THC)
  3. Documentación y fees (B/L, handling)
  4. Tiempo de tránsito estimado y próximas salidas
  5. Validez de la tarifa ofrecida

{si alertas: "DATOS A CONFIRMAR: ..."  ← advertencias de Validacion-Expediente}

Quedo a disposición para ampliar información del embarque.

Saludos cordiales,
{contacto.nombre} — {contacto.empresa}
```

## 3. Reglas de generación

1. **Campos null** → se renderizan como `[A COMPLETAR]` en el texto (nunca vacíos ni inventados).
2. Si `completo: false` (ver [[Validacion-Expediente]]), el response incluye `advertencias` con las alertas restantes y el front muestra el banner "Ficha incompleta".
3. `corredorId` es opcional: si llega, se agrega el párrafo de corredor evaluado con los datos de [[Corredores-NOA]]; si no, se omite.
4. El `asunto` sigue el formato del template; si falta `contenedor`/`cantidad` se omite el paréntesis.
5. El texto se devuelve editable: el usuario puede retocar antes de exportar (el front guarda la versión editada).

## 4. Exportación

| Formato | Implementación | Endpoint |
|---|---|---|
| Copiar texto | `navigator.clipboard` en el front | — (client-side) |
| PDF | generación server-side (pdfkit) o client-side (jsPDF / print CSS) | `POST /api/rfq/pdf` |

Fallback de demo: si el PDF falla, siempre funciona "copiar texto" → no bloquear la demo por esto.

## 5. Tono

Formal-comercial en español rioplatense neutro. Opción futura: toggle ES/EN (los freight forwarders internacionales responden en inglés) — anotar como mejora post-demo.

---

## Relacionado

- Agentes: [[RFQGenerator]] (propietario) · [[BackendDev]] (endpoint + PDF) · [[FrontendDev]] (editor + export) · [[LogisticsExpert]] (valida el formato comercial)
- Skills: [[Validacion-Expediente]] · [[Corredores-NOA]] · [[Stack-Tecnico]]
- [[CONTRATO-API]] §3 · [[CONTEXTO_MAESTRO]] Módulo 4 · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-NACHO]]
