---
tipo: skill
tags: [skill, pitch, demo, presentacion]
---

# SKILL: Pitch-Demo

> Estructura del pitch y guion de la demo en vivo para la presentación del hackathon INNOA.

**Usada por:** [[Pitch]] (propietario) · ejecutada con [[IntegradorQA]] en la fase de demo.

---

## 1. Estructura del pitch (~5 min)

1. **El problema (45")** — Operaciones logísticas del NOA atendidas por WhatsApp/mails informales → consultas incompletas, viajes en vacío de contenedores, redacción manual de RFQs lenta. Frase ancla: *"Hoy pedir una cotización de flete desde Salta es un ida y vuelta de correos que puede tardar días."*
2. **La solución (30")** — Asistente inteligente que estructura la consulta, no un cotizador automático: aclarar el *scope honesto* (ver §4).
3. **Demo en vivo (2'30")** — guion de §2.
4. **Impacto y diferencial (45")** — Pacífico vs Atlántico visual + expediente completo + RFQ profesional en minutos.
5. **Stack y equipo (30")** — React + Express + Supabase + Gemini; arquitectura de agentes.

## 2. Guion de la demo en vivo

| Paso | Acción | Qué mostrar |
|---|---|---|
| 1 | Pegar fixture incompleto (T-01) en el input tipo chat | el público reconoce "un WhatsApp típico" |
| 2 | Click "Estructurar" → ficha renderizada | extracción automática: 2×40ST, sal, Salta→China |
| 3 | Señalar panel de alertas | **el momento wow**: "la app te dice qué preguntarle al cliente" |
| 4 | Abrir comparador | mapa/cards Pacífico vs Atlántico + por qué para China gana el Pacífico |
| 5 | Generar RFQ | documento profesional editable + copiar/PDF |
| 6 | (opcional) historial + login | persistencia real en Supabase |

**Tiempo total en pantalla: < 2'30".** Ensayar hasta que salga de memoria.

## 3. Plan B (obligatorio)

- Screenshots de cada paso del flujo en `demo/screenshots/`.
- Video corto del flujo completo grabado la noche anterior.
- Si Gemini cae: mostrar el modo fallback (es un feature, no un bug — *"funciona aunque la IA no esté disponible"*).
- Si la red cae: demo local completa (front + back + Supabase cloud requiere Wi-Fi → hotspot del celular de respaldo).

## 4. Q&A — respuestas preparadas

| Pregunta probable | Respuesta |
|---|---|
| "¿Para quién es?" | Dos usuarios del desafío: ejecutivos de comercio exterior que atienden consultas informales, y PYMES/cooperativas agroindustriales del NOA que evalúan exportar. |
| "¿Cotiza fletes reales?" | No: estructura la consulta y redacta el RFQ. La cotización la hacen las navieras — es scope honesto. |
| "¿Por qué Gemini?" | Tier gratuito generoso, JSON mode nativo, rápido para extracción. |
| "¿Y si el texto está muy incompleto?" | Justamente el Módulo 2: detecta faltantes y redacta las preguntas. |
| "¿Escala a otras regiones?" | Sí: el dominio (corredores, jerga, reglas) es data, no código — [[Corredores-NOA]] es intercambiable. |
| "¿Datos reales de navieras?" | Próximo paso: conectar APIs de forwarders una vez validado el flujo. |

## 5. Slides (mínimo viable — opcional)

4 slides: problema (foto/dato NOA) → solución (screenshot ficha+alertas) → corredores (mapa) → stack+equipo. La demo ES la presentación; los slides son marco, no contenido.

---

## Relacionado

- Agentes: [[Pitch]] (propietario) · [[IntegradorQA]] (checklist + plan B) · [[UXUIDesigner]] (assets visuales)
- Skills: [[Testing-E2E]] · [[Stack-Tecnico]]
- [[CONTEXTO_MAESTRO]] §1 (el problema, verbatim) · [[INDEX]] · [[TASK_BACKLOG-BRUNO]]
