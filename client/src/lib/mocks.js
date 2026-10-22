/**
 * Mocks con el shape EXACTO del contrato (CONTRATO-API §2/§3) — N-07.
 * Permiten correr el flujo completo sin backend levantado: `VITE_USE_MOCK=true`.
 *
 * El catálogo de alertas y el texto RFQ ESPEJAN las specs
 * (02-SKILLS/Validacion-Expediente.md y 02-SKILLS/Generacion-RFQ.md) solo
 * para que la UI se desarrolle con outputs realistas — la lógica de
 * negocio real vive en la API (BackendDev).
 */

/// <reference path="./types.js" />

/** @typedef {import('./types.js').FichaTecnica} FichaTecnica */
/** @typedef {import('./types.js').Alerta} Alerta */

const LATENCIA_MS = 250

const fichaVacia = () => ({
  contacto: { nombre: null, empresa: null },
  operacion: null,
  origen: { ciudad: null, provincia: null },
  destino: { ciudad: null, pais: null },
  carga: { tipo: null, pesoKg: null, volumenM3: null, contenedor: null, cantidad: null },
  incoterm: null,
  fechaEstimada: null,
  operativa: { ritmoCargaDiario: null, plazoSobreestadiaDias: null, depositoFiscalVacios: null },
  observaciones: null,
})

/* ---------- Fixtures (Testing-E2E §2 + Parsing-NLP §5) ---------- */

export const EJEMPLOS = {
  'T-01': 'necesito mandar 2 containers de 40 de sal a china desde salta',
  'T-04': 'hola, tengo una exportacion',
  'T-09':
    'exportamos porotos a india, 2x40hc, 50tn, de perico jujuy — el vacio lo podemos retirar en COCEL salta y necesitamos 14 dias de free time',
}

/** @returns {FichaTecnica} */
const fichaT01 = () => ({
  ...fichaVacia(),
  operacion: 'exportacion',
  origen: { ciudad: 'Salta', provincia: 'Salta' },
  destino: { ciudad: null, pais: 'China' },
  carga: { tipo: 'sal', pesoKg: null, volumenM3: null, contenedor: '40ST', cantidad: 2 },
})

/** @returns {FichaTecnica} */
const fichaT04 = () => ({
  ...fichaVacia(),
  operacion: 'exportacion',
})

/** @returns {FichaTecnica} */
const fichaT09 = () => ({
  ...fichaVacia(),
  operacion: 'exportacion',
  origen: { ciudad: 'Perico', provincia: 'Jujuy' },
  destino: { ciudad: null, pais: 'India' },
  carga: { tipo: 'porotos', pesoKg: 50000, volumenM3: null, contenedor: '40HC', cantidad: 2 },
  operativa: {
    ritmoCargaDiario: null,
    plazoSobreestadiaDias: 14,
    depositoFiscalVacios: 'COCEL Salta',
  },
})

/* ---------- Catálogo de alertas (espejo de Validacion-Expediente §2) ---------- */

const CATALOGO_ALERTAS = [
  { campo: 'carga.tipo', severidad: 'alta', mensaje: 'Falta el tipo de mercadería', pregunta: '¿Qué mercadería querés transportar?' },
  { campo: 'carga.pesoKg', severidad: 'alta', mensaje: 'Falta el peso de la carga', pregunta: '¿Cuántos kilogramos pesa la carga en total?' },
  { campo: 'carga.contenedor', severidad: 'alta', mensaje: 'Falta el tipo de contenedor', pregunta: "¿Necesitás contenedor completo (20', 40' o 40HC) o carga suelta (LCL)?" },
  { campo: 'carga.cantidad', severidad: 'alta', mensaje: 'Falta la cantidad de unidades', pregunta: '¿Cuántos contenedores o pallets son?' },
  { campo: 'origen.ciudad', severidad: 'alta', mensaje: 'Falta el punto de origen', pregunta: '¿Desde qué ciudad/punto sale la carga?' },
  { campo: 'destino.pais', severidad: 'alta', mensaje: 'Falta el país de destino', pregunta: '¿A qué país (y ciudad/puerto) va destinada?' },
  { campo: 'operacion', severidad: 'alta', mensaje: 'Falta el tipo de operación', pregunta: '¿Es una exportación o una importación?' },
  { campo: 'carga.volumenM3', severidad: 'media', mensaje: 'Falta el volumen de la carga', pregunta: '¿Sabés el volumen total en m³ o las dimensiones de los pallets?' },
  { campo: 'incoterm', severidad: 'media', mensaje: 'Falta el incoterm', pregunta: '¿Bajo qué incoterm cotizamos? (FOB, CIF, EXW…)' },
  { campo: 'fechaEstimada', severidad: 'media', mensaje: 'Falta la fecha estimada', pregunta: '¿Para qué fecha necesitás embarcar?' },
  { campo: 'contacto.empresa', severidad: 'media', mensaje: 'Falta la empresa', pregunta: '¿A nombre de qué empresa emitimos la solicitud?' },
  { campo: 'destino.ciudad', severidad: 'media', mensaje: 'Falta la ciudad/puerto de destino', pregunta: '¿A qué ciudad o puerto específico llega?' },
  { campo: 'operativa.ritmoCargaDiario', severidad: 'media', mensaje: 'Falta el ritmo de carga diario', pregunta: '¿A qué ritmo podés cargar por día? (ej. 2 contenedores/día)' },
  { campo: 'operativa.plazoSobreestadiaDias', severidad: 'media', mensaje: 'Falta el free time necesario', pregunta: '¿Cuántos días de free time necesitás en el puerto de destino?' },
  { campo: 'operativa.depositoFiscalVacios', severidad: 'media', mensaje: 'Falta el depósito fiscal para vacíos', pregunta: '¿Podés retirar o devolver el contenedor vacío en un depósito fiscal regional (ej. COCEL Salta)?' },
]

const getCampo = (ficha, path) => path.split('.').reduce((o, k) => o?.[k], ficha)

/**
 * Alertas por presencia de campos (espejo del contrato, para dev).
 * Casos borde de Validacion-Expediente §4: pesoKg 0 → faltante;
 * LCL sin volumen → volumen sube a severidad alta.
 * @param {FichaTecnica} ficha
 * @returns {{alertas: Alerta[], completo: boolean}}
 */
export const alertasParaFicha = (ficha) => {
  const alertas = []
  for (const a of CATALOGO_ALERTAS) {
    const v = getCampo(ficha, a.campo)
    if (v === null || v === undefined || v === '') {
      alertas.push({ ...a })
    }
  }
  if (ficha?.carga?.pesoKg === 0 && !alertas.some((a) => a.campo === 'carga.pesoKg')) {
    alertas.push({ ...CATALOGO_ALERTAS[1] })
  }
  const lcl = alertas.find((a) => a.campo === 'carga.volumenM3')
  if (lcl && ficha?.carga?.contenedor === 'LCL') lcl.severidad = 'alta'
  return { alertas, completo: !alertas.some((a) => a.severidad === 'alta') }
}

/* ---------- Corredores (Corredores-NOA reducido al shape §2.3 del contrato) ---------- */

const CORREDORES = [
  {
    id: 'pacifico',
    nombre: 'Corredor Bioceánico / Pacífico',
    pasosFronterizos: ['Paso de Jama'],
    puertos: [
      { nombre: 'Antofagasta', pais: 'CL', lat: -23.65, lng: -70.4 },
      { nombre: 'Angamos (Mejillones)', pais: 'CL', lat: -23.1, lng: -70.45 },
      { nombre: 'Iquique', pais: 'CL', lat: -20.22, lng: -70.15 },
    ],
    tiempoEstimadoDias: 3,
    pros: [
      'Distancia terrestre mucho menor: ~550-600 km vs. ~1.600 km al Atlántico',
      'Menor costo de transporte terrestre por tramo corto',
      'Acceso directo a mercados de Asia-Pacífico (China, India, Japón)',
      'Menos congestión portuaria que Buenos Aires',
      'Ideal para cargas mineras del NOA (litio, sal, minerales)',
    ],
    contras: [
      'Cruce de cordillera a 4.200 msnm: riesgo de cierre por nevadas en invierno (jun-ago)',
      'Doble trámite aduanero (Argentina + Chile)',
      'Menor frecuencia de servicios regulares de navieras que Buenos Aires',
      'Tarifa marítima puede ser mayor por menor volumen de los puertos del norte chileno',
      'Requiere coordinación con normativa chilena (SAG/Servicio Nacional de Aduanas)',
    ],
    consideraciones: [
      'Verificar estado del Paso de Jama en temporada invernal antes de prometer fechas',
      'Para exportar por puerto chileno se necesita agente de aduana en ambos países',
      'Las cargas perecederas se benefician del tramo terrestre corto',
      'Contenedores que vuelven vacíos desde Chile son oportunidad de negociación (roundtrips)',
      'Documentación: requiere doble trámite aduanero (AR + CL) — Carta de Porte Internacional y coordinación con agente chileno',
    ],
  },
  {
    id: 'atlantico',
    nombre: 'Corredor Atlántico',
    pasosFronterizos: [],
    puertos: [
      { nombre: 'Buenos Aires', pais: 'AR', lat: -34.6, lng: -58.37 },
      { nombre: 'Rosario', pais: 'AR', lat: -32.95, lng: -60.66 },
      { nombre: 'Zárate', pais: 'AR', lat: -34.09, lng: -59.02 },
    ],
    tiempoEstimadoDias: 7,
    pros: [
      'Sin cruce fronterizo terrestre: un solo despacho aduanero (Argentina)',
      'Mayor frecuencia y variedad de servicios de navieras (Europa, EEUU, África)',
      'Mejor conectividad para destinos atlánticos',
      'Infraestructura portuaria consolidada para contenedores',
      'Sin restricciones de altura ni clima cordillerano',
    ],
    contras: [
      'Distancia terrestre ~3 veces mayor (1.500-1.700 km): mayor costo y huella',
      'Congestión portuaria frecuente en Buenos Aires (demoras de giro/turnos)',
      'Viajes en vacío (roundtrips) más caros por la distancia',
      'Para Asia-Pacífico suele requerir transbordos (vía Cabo de Buena Esperanza o hub regional)',
      'Costos de drayage y permanencia elevados',
    ],
    consideraciones: [
      'Evaluar Rosario para cargas agroindustriales: puede evitar congestión de BA',
      'Reservar turnos de terminal con anticipación en temporada alta',
      'Para importaciones desde Europa/Atlántico norte suele ser la opción natural',
      'El mayor tramo terrestre encarece cargas de bajo valor por tonelada (ej. sal a granel)',
      'Documentación: un solo despacho aduanero argentino — trámite más simple pero exige permiso de embarque antes de la carga',
    ],
  },
]

const DEPOSITOS_FISCALES = [
  {
    nombre: 'COCEL Salta',
    ciudad: 'Salta',
    provincia: 'Salta',
    nota: 'Depósito fiscal extraportuario — retiro/devolución de vacíos sin enviar el camión al puerto',
  },
]

/* ---------- RFQ (espejo del template Generacion-RFQ §2, para dev) ---------- */

const vacio = (v) => (v === null || v === undefined || v === '' ? '[A COMPLETAR]' : v)

const rfqTexto = (ficha, corredor) => {
  const f = ficha ?? fichaVacia()
  const lineas = [
    'Estimados:',
    '',
    'Por medio del presente solicito cotización para el siguiente servicio',
    'de transporte internacional:',
    '',
    'OPERACIÓN',
    `  Tipo:               ${vacio(f.operacion)}`,
    `  Origen:             ${vacio(f.origen?.ciudad)}, ${vacio(f.origen?.provincia)}, Argentina`,
    `  Destino:            ${f.destino?.ciudad ? f.destino.ciudad + ', ' : ''}${vacio(f.destino?.pais)}`,
  ]
  if (corredor) {
    const via = corredor.pasosFronterizos.length
      ? corredor.pasosFronterizos.join(' / ')
      : corredor.puertos.map((p) => p.nombre).join(' / ')
    lineas.push(`  Corredor evaluado:  ${corredor.nombre} (vía ${via})`)
  }
  lineas.push(
    `  Incoterm:           ${f.incoterm ?? 'a convenir'}`,
    '',
    'CARGA',
    `  Mercadería:         ${vacio(f.carga?.tipo)}`,
    `  Peso total:         ${f.carga?.pesoKg ? `${f.carga.pesoKg} kg` : '[A COMPLETAR]'}`,
    `  Volumen:            ${f.carga?.volumenM3 ? `${f.carga.volumenM3} m³` : '[A COMPLETAR]'}`,
    `  Equipamiento:       ${vacio(f.carga?.cantidad)} x ${vacio(f.carga?.contenedor)}`,
    `  Fecha estimada:     ${f.fechaEstimada ?? 'a definir'}`,
    '',
    'CONDICIONES OPERATIVAS',
    `  Ritmo de carga:         ${vacio(f.operativa?.ritmoCargaDiario)}`,
    `  Free time solicitado:   ${vacio(f.operativa?.plazoSobreestadiaDias)} días en destino`,
    `  Retiro/devolución vacío:${' '}${vacio(f.operativa?.depositoFiscalVacios)} (depósito fiscal extraportuario)`,
    '',
    'SE SOLICITA COTIZAR',
    `  1. Flete marítimo ${corredor ? corredor.puertos[0]?.nombre : '[A COMPLETAR]'} → ${vacio(f.destino?.ciudad ?? f.destino?.pais)}`,
    '  2. Cargos de terminal en origen (THC)',
    '  3. Documentación y fees (B/L, handling)',
    '  4. Tiempo de tránsito estimado y próximas salidas',
    '  5. Validez de la tarifa ofrecida',
    '  6. Disponibilidad/autorización de retiro de unidad vacía en depósito fiscal regional',
    '',
    'Quedo a disposición para ampliar información del embarque.',
    '',
    'Saludos cordiales,',
    `${vacio(f.contacto?.nombre)} — ${vacio(f.contacto?.empresa)}`,
  )
  return lineas.join('\n')
}

const rfqAsunto = (ficha) => {
  const f = ficha ?? fichaVacia()
  const equip =
    f.carga?.cantidad && f.carga?.contenedor ? ` (${f.carga.cantidad}x${f.carga.contenedor})` : ''
  return `RFQ – ${vacio(f.operacion)} ${vacio(f.carga?.tipo)}${equip} ${vacio(f.origen?.ciudad)} → ${vacio(f.destino?.pais)}`
}

/* ---------- Router de mocks ---------- */

const demora = () => new Promise((r) => setTimeout(r, LATENCIA_MS))
const clonar = (v) => JSON.parse(JSON.stringify(v))

const elegirFicha = (texto = '') => {
  const t = texto.toLowerCase()
  if (/cocel|free time|dep[oó]sito fiscal|poroto/.test(t)) return fichaT09()
  if (t.trim().length < 40) return fichaT04()
  return fichaT01()
}

/**
 * Emula los endpoints del contrato. Misma firma que apiFetch.
 * @param {string} path ej. "/parse"
 * @param {{method?: string, body?: any}} opts
 */
export async function mockFetch(path, { method = 'GET', body } = {}) {
  await demora()
  const ruta = `${method} ${path}`

  switch (ruta) {
    case 'GET /health':
      return { status: 'ok' }

    case 'POST /parse': {
      const textoOriginal = body?.texto ?? ''
      const ficha = elegirFicha(textoOriginal)
      const { alertas } = alertasParaFicha(ficha)
      return clonar({ ficha, alertas, textoOriginal })
    }

    case 'POST /validate':
      return clonar(alertasParaFicha(body?.ficha))

    case 'GET /corredores':
      return clonar({ corredores: CORREDORES, depositosFiscales: DEPOSITOS_FISCALES })

    case 'POST /rfq': {
      const ficha = body?.ficha ?? fichaVacia()
      const corredor = CORREDORES.find((c) => c.id === body?.corredorId) ?? null
      const { alertas } = alertasParaFicha(ficha)
      return clonar({
        rfq: { asunto: rfqAsunto(ficha), texto: rfqTexto(ficha, corredor), advertencias: alertas },
      })
    }

    case 'GET /consultas':
      return clonar({
        consultas: [
          {
            id: 'mock-consulta-1',
            texto_original: EJEMPLOS['T-01'],
            ficha: fichaT01(),
            alertas: alertasParaFicha(fichaT01()).alertas,
            created_at: new Date().toISOString(),
          },
        ],
      })

    case 'POST /consultas':
      return { id: 'mock-consulta-2' }

    default:
      throw { error: { code: 'NOT_FOUND', message: `Mock no definido para ${ruta}` } }
  }
}
