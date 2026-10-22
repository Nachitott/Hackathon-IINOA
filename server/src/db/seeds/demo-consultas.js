/**
 * Consultas de ejemplo precargadas para la demo del hackathon.
 * Basadas en los casos reales de la región NOA (02-SKILLS/Testing-E2E.md).
 */

export const DEMO_CONSULTAS = [
  {
    id: "d1000000-0000-0000-0000-000000000001",
    user_id: null,
    texto_original: "exportamos porotos a india, 2x40hc, 50tn, de perico jujuy — el vacio lo podemos retirar en COCEL salta y necesitamos 14 dias de free time",
    ficha: {
      contacto: {
        nombre: "Carlos Gómez",
        empresa: "Legumbres del Norte S.A."
      },
      operacion: "exportacion",
      origen: {
        ciudad: "Perico",
        provincia: "Jujuy"
      },
      destino: {
        ciudad: "Nhava Sheva",
        pais: "India"
      },
      carga: {
        tipo: "porotos",
        pesoKg: 50000,
        volumenM3: 75,
        contenedor: "40HC",
        cantidad: 2
      },
      incoterm: "FOB",
      fechaEstimada: "2026-11-15",
      operativa: {
        ritmoCargaDiario: "1 contenedor/día",
        plazoSobreestadiaDias: 14,
        depositoFiscalVacios: "COCEL Salta"
      },
      observaciones: "Retiro de vacío coordinado en COCEL Salta para evitar roundtrip al puerto."
    },
    alertas: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "d2000000-0000-0000-0000-000000000002",
    user_id: null,
    texto_original: "necesito mandar 2 containers de 40 de sal a china desde salta capital",
    ficha: {
      contacto: {
        nombre: "Mariana Torres",
        empresa: "Minerales Andinos SRL"
      },
      operacion: "exportacion",
      origen: {
        ciudad: "Salta",
        provincia: "Salta"
      },
      destino: {
        ciudad: "Shanghai",
        pais: "China"
      },
      carga: {
        tipo: "sal",
        pesoKg: 45000,
        volumenM3: null,
        contenedor: "40ST",
        cantidad: 2
      },
      incoterm: null,
      fechaEstimada: null,
      operativa: {
        ritmoCargaDiario: "2 contenedores/día",
        plazoSobreestadiaDias: null,
        depositoFiscalVacios: "COCEL Salta"
      },
      observaciones: "Prioridad corredor bioceánico Pacífico vía Paso de Jama."
    },
    alertas: [
      {
        campo: "incoterm",
        mensaje: "Falta el Incoterm comercial",
        pregunta: "¿Bajo qué incoterm cotizamos? (FOB, CIF, EXW…)",
        severidad: "media"
      },
      {
        campo: "fechaEstimada",
        mensaje: "Falta la fecha estimada de embarque",
        pregunta: "¿Para qué fecha necesitás embarcar?",
        severidad: "media"
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "d3000000-0000-0000-0000-000000000003",
    user_id: null,
    texto_original: "quiero exportar 18 tn de arandanos a miami, un reefer, sale de guemes jujuy, fob",
    ficha: {
      contacto: {
        nombre: "Esteban Morales",
        empresa: "Frutos del Valle"
      },
      operacion: "exportacion",
      origen: {
        ciudad: "General Güemes",
        provincia: "Salta"
      },
      destino: {
        ciudad: "Miami",
        pais: "Estados Unidos"
      },
      carga: {
        tipo: "arándanos",
        pesoKg: 18000,
        volumenM3: 40,
        contenedor: "reefer",
        cantidad: 1
      },
      incoterm: "FOB",
      fechaEstimada: "2026-10-30",
      operativa: {
        ritmoCargaDiario: "1 contenedor/día",
        plazoSobreestadiaDias: 7,
        depositoFiscalVacios: null
      },
      observaciones: "Carga perecedera refrigerada, verificar conexión a red de frío."
    },
    alertas: [],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];
