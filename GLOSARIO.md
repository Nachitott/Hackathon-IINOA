---
tipo: glosario
tags: [glosario, dominio, comex, referencia]
---

# GLOSARIO — Comercio Exterior y Logística

> Glosario pedagógico del desafío oficial *Comex-PuertoNoa ZOFRI* + términos regionales que el sistema usa. Es la referencia de vocabulario para todo el equipo: lo que el parser detecta, lo que el RFQ redacta y lo que el pitch puede decir sin equivocarse.

**Fuente:** material oficial del hackathon (§5 Glosario pedagógico). Curado por [[LogisticsExpert]].

---

## 1. Términos del desafío oficial

| Término técnico | Definición pedagógica y aplicación operativa |
|---|---|
| **Contenedor 40' HC (High Cube)** | Contenedor metálico estándar de 40 pies de largo con mayor altura (2,89 m / volumen de ~76,3 m³), muy utilizado para cargas agrícolas procesadas o voluminosas. |
| **Freight Forwarder (Agente de Carga)** | Empresa intermediaria especializada que organiza, coordina y cotiza las distintas etapas del transporte internacional (camión, puerto, barco) en representación del cliente. |
| **Armador / Línea Naviera** | Empresa propietaria o administradora de buques cargueros que realiza el transporte marítimo internacional (ej. MSC, Maersk, COSCO). |
| **Depósito Fiscal / Extraportuario** | Predio autorizado para el almacenamiento de mercancías bajo control aduanero y acopio de contenedores vacíos (ej. COCEL Salta). Disponer de vacíos localmente evita trasladar el camión sin carga. |
| **Roundtrip (Viaje en vacío)** | Ineficiencia logística que ocurre cuando un camión recorre cientos de kilómetros vacío únicamente para ir a retirar un contenedor al puerto. |
| **Free Time (Días Libres)** | Período de días libres de cobro que la naviera otorga al cliente en el puerto de destino antes de empezar a cobrar multas por sobreestadía (*demurrage*). |
| **Paso de Jama** | Paso fronterizo cordillerano en la provincia de Jujuy que conecta la región del NOA con los puertos del Norte de Chile (Iquique, Angamos) sobre el Océano Pacífico. |
| **RFQ (Request for Quotation)** | Solicitud formal de cotización enviada a proveedores logísticos detallando las especificaciones técnicas y requerimientos de la carga. |

## 2. Términos regionales del sistema

| Término | Significado en este proyecto |
|---|---|
| **Angamos** | Complejo portuario privado en Mejillones (Chile). El PDF lo nombra junto a Iquique como puerto del Corredor Pacífico — en el sistema figura como `Angamos (Mejillones)`. |
| **COCEL Salta** | Depósito fiscal extraportuario de referencia en Salta. Punto donde se puede retirar/devolver contenedores vacíos sin mandar el camión al puerto — es la contracara operativa del *roundtrip*. Campo `operativa.depositoFiscalVacios` del schema. |
| **ZOFRI** | Zona Franca de Iquique — polo comercial del norte chileno; da contexto al corredor Pacífico para importaciones. |
| **Demurrage / Sobreestadía** | Multa diaria que cobra la naviera cuando se excede el *free time*. El campo `operativa.plazoSobreestadiaDias` captura cuántos días libres necesita el cliente. |
| **Ritmo diario de carga** | Cuánta carga puede despachar el cliente por día (ej. "2 contenedores/día", "500 kg/día"). Dato que el PDF marca como faltante frecuente → campo `operativa.ritmoCargaDiario`. |

## 3. Dónde vive cada término en el sistema

| Término | Implementación |
|---|---|
| Depósito fiscal / Roundtrip / Free Time / Ritmo de carga | Campos `operativa.*` de `FichaTecnica` → [[CONTRATO-API]] §2.1, reglas en [[Validacion-Expediente]] |
| Jerga completa (sinónimos y variantes) | Diccionario de [[Parsing-NLP]] §2 |
| Angamos / Paso de Jama / COCEL / ZOFRI | Datos de dominio en [[Corredores-NOA]] |
| RFQ / Forwarder / Naviera | Plantilla y destinatarios en [[Generacion-RFQ]] |
| 40' HC y equipamiento | Enum `contenedor` del schema + specs en [[Corredores-NOA]] |

---

## Relacionado

- Hub: [[INDEX]] · Contexto: [[CONTEXTO_MAESTRO]] · Contrato: [[CONTRATO-API]]
- Skills que lo operacionalizan: [[Parsing-NLP]] · [[Corredores-NOA]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Testing-E2E]]
- Agentes: [[LogisticsExpert]] (curador) · [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]] · [[Pitch]]
- Backlogs: [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]
