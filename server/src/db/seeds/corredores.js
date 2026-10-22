/**
 * Seed de Corredores Logísticos del NOA y Depósitos Fiscales Extraportuarios
 * Fuente de verdad: 02-SKILLS/Corredores-NOA.md y CONTRATO-API.md §2.3
 */

export const corredores = [
  {
    id: "pacifico",
    nombre: "Corredor Bioceánico / Pacífico",
    descripcion: "Salida internacional por el norte de Chile a través de la cordillera de los Andes.",
    pasosFronterizos: [
      {
        nombre: "Paso de Jama",
        alturaMsnm: 4200,
        tipo: "frontera integrada argentino-chilena",
        nota: "Paso habilitado todo el año pero con cierres eventuales por clima en invierno (nevadas). Control integrado del lado chileno."
      }
    ],
    puertos: [
      {
        nombre: "Antofagasta",
        pais: "CL",
        lat: -23.65,
        lng: -70.4,
        perfil: "puerto minero, muy activo con cargas del NOA"
      },
      {
        nombre: "Angamos (Mejillones)",
        pais: "CL",
        lat: -23.1,
        lng: -70.45,
        perfil: "complejo portuario privado (Puerto Angamos), ágil para breakbulk"
      },
      {
        nombre: "Iquique",
        pais: "CL",
        lat: -20.22,
        lng: -70.15,
        perfil: "puerto + ZOFRI (Zona Franca de Iquique), importante para importación"
      }
    ],
    tiempoEstimadoDias: 3,
    distanciaAproxKm: {
      "salta-antofagasta": 580,
      "jujuy-antofagasta": 520
    },
    pros: [
      "Distancia terrestre mucho menor: ~550-600 km vs. ~1.600 km al Atlántico",
      "Menor costo de transporte terrestre por tramo corto",
      "Acceso directo a mercados de Asia-Pacífico (China, India, Japón)",
      "Menos congestión portuaria que Buenos Aires",
      "Ideal para cargas mineras del NOA (litio, sal, minerales)"
    ],
    contras: [
      "Cruce de cordillera a 4.200 msnm: riesgo de cierre por nevadas en invierno (jun-ago)",
      "Doble trámite aduanero (Argentina + Chile)",
      "Menor frecuencia de servicios regulares de navieras que Buenos Aires",
      "Tarifa marítima puede ser mayor por menor volumen de los puertos del norte chileno",
      "Requiere coordinación con normativa chilena (SAG/Servicio Nacional de Aduanas)"
    ],
    consideraciones: [
      "Verificar estado del Paso de Jama en temporada invernal antes de prometer fechas",
      "Para exportar por puerto chileno se necesita agente de aduana en ambos países",
      "Las cargas perecederas se benefician del tramo terrestre corto",
      "Contenedores que vuelven vacíos desde Chile son oportunidad de negociación (roundtrips)",
      "Documentación: requiere doble trámite aduanero (AR + CL) — Carta de Porte Internacional y coordinación con agente chileno"
    ]
  },
  {
    id: "atlantico",
    nombre: "Corredor Atlántico",
    descripcion: "Salida por puertos argentinos del litoral, sin cruce internacional terrestre.",
    pasosFronterizos: [],
    puertos: [
      {
        nombre: "Buenos Aires",
        pais: "AR",
        lat: -34.6,
        lng: -58.37,
        perfil: "principal puerto contenedores del país, mayor conectividad"
      },
      {
        nombre: "Rosario",
        pais: "AR",
        lat: -32.95,
        lng: -60.66,
        perfil: "hub granero sobre el Paraná, fuerte en agro"
      },
      {
        nombre: "Zárate",
        pais: "AR",
        lat: -34.09,
        lng: -59.02,
        perfil: "terminal automotriz y breakbulk"
      }
    ],
    tiempoEstimadoDias: 7,
    distanciaAproxKm: {
      "salta-buenos aires": 1600,
      "jujuy-buenos aires": 1550
    },
    pros: [
      "Sin cruce fronterizo terrestre: un solo despacho aduanero (Argentina)",
      "Mayor frecuencia y variedad de servicios de navieras (Europa, EEUU, África)",
      "Mejor conectividad para destinos atlánticos",
      "Infraestructura portuaria consolidada para contenedores",
      "Sin restricciones de altura ni clima cordillerano"
    ],
    contras: [
      "Distancia terrestre ~3 veces mayor (1.500-1.700 km): mayor costo y huella",
      "Congestión portuaria frecuente en Buenos Aires (demoras de giro/turnos)",
      "Viajes en vacío (roundtrips) más caros por la distancia",
      "Para Asia-Pacífico suele requerir transbordos (vía Cabo de Buena Esperanza o hub regional)",
      "Costos de drayage y permanencia elevados"
    ],
    consideraciones: [
      "Evaluar Rosario para cargas agroindustriales: puede evitar congestión de BA",
      "Reservar turnos de terminal con anticipación en temporada alta",
      "Para importaciones desde Europa/Atlántico norte suele ser la opción natural",
      "El mayor tramo terrestre encarece cargas de bajo valor por tonelada (ej. sal a granel)",
      "Documentación: un solo despacho aduanero argentino — trámite más simple pero exige permiso de embarque antes de la carga"
    ]
  }
];

export const depositosFiscales = [
  {
    nombre: "COCEL Salta",
    ciudad: "Salta",
    provincia: "Salta",
    tipo: "depósito fiscal / extraportuario",
    nota: "Depósito fiscal extraportuario — retiro/devolución de vacíos sin enviar el camión al puerto"
  }
];

export default {
  corredores,
  depositosFiscales
};
