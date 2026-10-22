---
tipo: skill
tags: [skill, dominio, logistica, modulo-3, datos-semilla]
---

# SKILL: Corredores-NOA

> Datos de dominio sobre los corredores logísticos de exportación/importación del NOA (Jujuy y Salta). Es la **fuente de verdad geográfica** para el comparador y el seed de la tabla `corredores`.

**Usada por:** [[RouteAnalyzer]] · [[LogisticsExpert]] · **Servida en:** `GET /api/corredores` ([[CONTRATO-API]]).

> ⚠️ Los tiempos y distancias son **estimaciones orientativas para el prototipo**, no cotizaciones reales.

---

## 1. Corredor Pacífico (Bioceánico)

```json
{
  "id": "pacifico",
  "nombre": "Corredor Bioceánico / Pacífico",
  "descripcion": "Salida internacional por el norte de Chile a través de la cordillera de los Andes.",
  "pasosFronterizos": [
    {
      "nombre": "Paso de Jama",
      "alturaMsnm": 4200,
      "tipo": "frontera integrada argentino-chilena",
      "nota": "Paso habilitado todo el año pero con cierres eventuales por clima en invierno (nevadas). Control integrado del lado chileno."
    }
  ],
  "puertos": [
    { "nombre": "Antofagasta", "pais": "CL", "lat": -23.65, "lng": -70.4, "perfil": "puerto minero, muy activo con cargas del NOA" },
    { "nombre": "Angamos (Mejillones)", "pais": "CL", "lat": -23.1, "lng": -70.45, "perfil": "complejo portuario privado (Puerto Angamos), ágil para breakbulk — así lo nombra el documento oficial del desafío" },
    { "nombre": "Iquique", "pais": "CL", "lat": -20.22, "lng": -70.15, "perfil": "puerto + ZOFRI (Zona Franca de Iquique), importante para importación" }
  ],
  "tiempoEstimadoDias": 3,
  "distanciaAproxKm": { "salta-antofagasta": 580, "jujuy-antofagasta": 520 },
  "pros": [
    "Distancia terrestre mucho menor: ~550-600 km vs. ~1.600 km al Atlántico",
    "Menor costo de transporte terrestre por tramo corto",
    "Acceso directo a mercados de Asia-Pacífico (China, India, Japón)",
    "Menos congestión portuaria que Buenos Aires",
    "Ideal para cargas mineras del NOA (litio, sal, minerales)"
  ],
  "contras": [
    "Cruce de cordillera a 4.200 msnm: riesgo de cierre por nevadas en invierno (jun-ago)",
    "Doble trámite aduanero (Argentina + Chile)",
    "Menor frecuencia de servicios regulares de navieras que Buenos Aires",
    "Tarifa marítima puede ser mayor por menor volumen de los puertos del norte chileno",
    "Requiere coordinación con normativa chilena (SAG/Servicio Nacional de Aduanas)"
  ],
  "consideraciones": [
    "Verificar estado del Paso de Jama en temporada invernal antes de prometer fechas",
    "Para exportar por puerto chileno se necesita agente de aduana en ambos países",
    "Las cargas perecederas se benefician del tramo terrestre corto",
    "Contenedores que vuelven vacíos desde Chile son oportunidad de negociación (roundtrips)",
    "Documentación: requiere doble trámite aduanero (AR + CL) — Carta de Porte Internacional y coordinación con agente chileno"
  ]
}
```

## 2.1 Depósitos fiscales extraportuarios (mitigación del roundtrip)

El problema del *viaje en vacío* (ver [[GLOSARIO]]): cotizar el retiro de contenedores vacíos desde puertos lejanos sin verificar si la armadora autoriza retirarlos en un depósito fiscal regional.

```json
{
  "depositosFiscales": [
    {
      "nombre": "COCEL Salta",
      "ciudad": "Salta",
      "provincia": "Salta",
      "tipo": "depósito fiscal / extraportuario",
      "nota": "Acopio de contenedores vacíos bajo control aduanero. Retirar el vacío acá evita el roundtrip hasta el puerto — SIEMPRE verificar autorización de la armadora antes de cotizar el retiro."
    }
  ]
}
```

Regla operativa para la app: si la ficha es exportación con contenedor, sugerir al operador preguntar por retiro de vacío en depósito fiscal regional (campo `operativa.depositoFiscalVacios`).

### Equipamiento — specs de referencia

| Contenedor | Largo | Altura | Volumen aprox. | Uso típico NOA |
|---|---|---|---|---|
| `20ST` | 20' | estándar | ~33 m³ | cargas pesadas (minerales, sal) |
| `40ST` | 40' | estándar | ~67 m³ | general |
| `40HC` | 40' | 2,89 m | ~76,3 m³ | agrícolas procesadas, voluminosas |
| `LCL` | — | — | por m³ | cargas sueltas/pallets |
| `reefer` | 20'/40' | — | variable | perecederos (cítricos, arándanos) |

## 2. Corredor Atlántico

```json
{
  "id": "atlantico",
  "nombre": "Corredor Atlántico",
  "descripcion": "Salida por puertos argentinos del litoral, sin cruce internacional terrestre.",
  "pasosFronterizos": [],
  "puertos": [
    { "nombre": "Buenos Aires", "pais": "AR", "lat": -34.6, "lng": -58.37, "perfil": "principal puerto contenedores del país, mayor conectividad" },
    { "nombre": "Rosario", "pais": "AR", "lat": -32.95, "lng": -60.66, "perfil": "hub granero sobre el Paraná, fuerte en agro" },
    { "nombre": "Zárate", "pais": "AR", "lat": -34.09, "lng": -59.02, "perfil": "terminal automotriz y breakbulk" }
  ],
  "tiempoEstimadoDias": 7,
  "distanciaAproxKm": { "salta-buenos aires": 1600, "jujuy-buenos aires": 1550 },
  "pros": [
    "Sin cruce fronterizo terrestre: un solo despacho aduanero (Argentina)",
    "Mayor frecuencia y variedad de servicios de navieras (Europa, EEUU, África)",
    "Mejor conectividad para destinos atlánticos",
    "Infraestructura portuaria consolidada para contenedores",
    "Sin restricciones de altura ni clima cordillerano"
  ],
  "contras": [
    "Distancia terrestre ~3 veces mayor (1.500-1.700 km): mayor costo y huella",
    "Congestión portuaria frecuente en Buenos Aires (demoras de giro/turnos)",
    "Viajes en vacío (roundtrips) más caros por la distancia",
    "Para Asia-Pacífico suele requerir transbordos (vía Cabo de Buena Esperanza o hub regional)",
    "Costos de drayage y permanencia elevados"
  ],
  "consideraciones": [
    "Evaluar Rosario para cargas agroindustriales: puede evitar congestión de BA",
    "Reservar turnos de terminal con anticipación en temporada alta",
    "Para importaciones desde Europa/Atlántico norte suele ser la opción natural",
    "El mayor tramo terrestre encarece cargas de bajo valor por tonelada (ej. sal a granel)",
    "Documentación: un solo despacho aduanero argentino — trámite más simple pero exige permiso de embarque antes de la carga"
  ]
}
```

## 3. Matriz comparativa (para el comparador visual)

| Criterio | Pacífico (Jama → Chile) | Atlántico (BA/Rosario) |
|---|---|---|
| Distancia terrestre desde Salta | ~580 km | ~1.600 km |
| Tiempo terrestre estimado | 1-2 días | 3-4 días |
| Cruces fronterizos | 1 (Jama) | 0 |
| Riesgo climático | Alto en invierno (nevadas) | Bajo |
| Frecuencia navieras | Media | Alta |
| Mejor para destinos | Asia-Pacífico | Europa, Atlántico, regional |
| Costo terrestre relativo | Bajo | Alto |
| Costo marítimo relativo | Medio-Alto | Medio |

## 4. Lógica de recomendación (del agente, no cotización)

El comparador **no cotiza fletes**: orienta la decisión según:

1. **Destino Asia-Pacífico** → Pacífico casi siempre gana por tramo terrestre.
2. **Destino Europa/Atlántico** → Atlántico (evita transbordo desde Chile).
3. **Carga perecedera o justa de tiempo** → Pacífico por menor tiempo terrestre, si Jama está operativo.
4. **Importación desde Brasil/Santos** → evaluar Atlántico vs. tramo terrestre directo.
5. **Época jun-agosto** → flag de advertencia sobre Jama (dato vivo: "verificar estado del paso").

---

## Relacionado

- Agentes: [[RouteAnalyzer]] (propietario) · [[LogisticsExpert]] (curador de los datos) · [[BackendDev]] (carga el seed) · [[FrontendDev]] (renderiza el comparador)
- Skills: [[Parsing-NLP]] · [[Validacion-Expediente]] · [[Stack-Tecnico]]
- [[GLOSARIO]] — términos usados acá (Angamos, COCEL, roundtrip, free time) · [[CONTRATO-API]] §2.3 · [[CONTEXTO_MAESTRO]] Módulo 3 · [[TASK_BACKLOG-LUCAS]] · [[TASK_BACKLOG-NACHO]]
