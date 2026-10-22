# CONTEXTO MAESTRO - HACKATHON INNOA

## 1. DESAFÍO Y LÍNEA DE TRABAJO
* **Evento:** Hackathon INNOA (Desarrollo Web / IA).
* **Eje:** El problema de las operaciones logísticas y comercio exterior del NOA (Jujuy y Salta).

### El Problema
* En la cadena de suministro internacional del NOA, el proceso para atender consultas de exportación e importación está muy fragmentado y se maneja por correos o mensajes informales.
* Esto genera consultas incompletas (omitiendo peso, volumen o tipo de contenedor), costos ineficientes por viajes en vacío (*roundtrips*) de contenedores, y dificultad para comparar visualmente los corredores del Pacífico (Paso de Jama) frente al Atlántico.
* Existen demoras significativas en la redacción manual de pedidos de tarifa.

### El Objetivo
Desarrollar un prototipo de **aplicación web** que funcione como un **asistente inteligente de estructuración logística**. 

*Nota importante:* El sistema NO busca cotizar fletes marítimos variables automáticamente ni conectarse en tiempo real con navieras, sino:
1. Transformar una consulta informal e incompleta en una **ficha técnica operativa**.
2. Detectar **alertas de datos faltantes** (peso, dimensiones, origen, destino, etc.).
3. **Comparar corredores de transporte** (Pacífico vs. Atlántico).
4. Redactar una **solicitud de cotización (RFQ) editable y profesional**.

---

## 2. PILARES FUNCIONALES (MÓDULOS DE LA APP)

### Módulo 1: Parser & Estructurador Lingüístico
* **Input:** Texto crudo (mensaje de WhatsApp, mail informal, prompt libre).
* **Proceso:** Extraer entidad, origen, destino, tipo de carga, volumen, peso, incoterm (si existe).
* **Output:** JSON estructurado + Ficha Técnica en UI.

### Módulo 2: Motor de Validación y Alertas
* **Proceso:** Verificar si faltan campos indispensables para cotizar.
* **Output:** Alertas visuales con las preguntas que se le deben hacer al cliente para completar el expediente.

### Módulo 3: Comparador Visual de Corredores (Pacífico vs. Atlántico)
* **Proceso:** Evaluar rutas logísticas clave para el NOA.
  * **Corredor Bioceánico / Pacífico:** Salida por Paso de Jama hacia puertos del norte de Chile (Antofagasta, Iquique, Mejillones).
  * **Corredor Atlántico:** Salida por puertos de Buenos Aires / Rosario.
* **Output:** Comparativa visual en mapa/cards con pros, contras, pasos fronterizos y consideraciones operativas de cada opción.

### Módulo 4: Generador de RFQ (Request for Quotation)
* **Proceso:** Compilar la ficha técnica validada en un formato estandarizado.
* **Output:** Documento RFQ editable y exportable (PDF / Copiar texto formateado) para ser enviado a navieras/freight forwarders.

---

## 3. INSTRUCCIONES PARA AGENTES DE IA / DEVIN

### Rol General
Actuar como un equipo interdisciplinary de ingenieros de software, diseñadores UX/UI y expertos en logística de comercio exterior.

### Agentes a Implementar:
1. **Agent-LogisticsParser:** Especialista en PNL para entender jerga logística regional y extraer datos desestructurados a formato JSON.
2. **Agent-RouteAnalyzer:** Modulo con conocimiento geográfico/logístico del NOA (Jujuy/Salta, Paso de Jama, Puertos de Chile vs. Puertos del Atlántico).
3. **Agent-RFQGenerator:** Generador de plantillas comerciales formales a partir de la Ficha Técnica validada.

---

## 4. METAS DE IMPLEMENTACIÓN DÍA 1 (HACKATHON)
* [ ] Frontend interactivo con dashboard simple e intuitivo.
* [ ] Chat/Box de entrada de texto informal.
* [ ] Visualizador de Ficha Técnica + Alertas de faltantes.
* [ ] Tab comparativo de rutas Pacífico/Atlántico.
* [ ] Exportador de documento RFQ en vivo.

---

## Documentos relacionados

* [[INDEX]] — hub central del proyecto (navegación completa)
* [[CONTRATO-API]] — contrato front↔back (schemas + endpoints)
* Agentes (`01-AGENTES/`): [[LogisticsParser]] · [[RouteAnalyzer]] · [[RFQGenerator]] · [[FrontendDev]] · [[BackendDev]] · [[IntegradorQA]] · [[UXUIDesigner]] · [[LogisticsExpert]] · [[Pitch]]
* Skills (`02-SKILLS/`): [[Parsing-NLP]] · [[Corredores-NOA]] · [[Validacion-Expediente]] · [[Generacion-RFQ]] · [[Stack-Tecnico]] · [[Testing-E2E]] · [[Pitch-Demo]]
* Backlogs (`03-BACKLOG/`): [[TASK_BACKLOG-NACHO]] · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-BRUNO]]