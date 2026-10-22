/**
 * Motor determinístico de validación de expedientes logísticos.
 * Fuente de verdad: 02-SKILLS/Validacion-Expediente.md y CONTRATO-API.md §2.2
 */

const INCOTERMS_ESTANDAR = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

/**
 * Matriz base de campos con sus severidades y preguntas para el cliente.
 */
const MATRIZ_REGLAS = [
  // Severidad Alta
  {
    campo: 'carga.tipo',
    severidad: 'alta',
    mensaje: 'Falta el tipo de mercadería',
    pregunta: '¿Qué mercadería querés transportar?',
    check: (ficha) => !ficha?.carga?.tipo || ficha.carga.tipo.trim() === ''
  },
  {
    campo: 'carga.pesoKg',
    severidad: 'alta',
    mensaje: 'Falta el peso de la carga',
    pregunta: '¿Cuántos kilogramos pesa la carga en total?',
    // Caso borde: 0 no es un peso válido
    check: (ficha) => ficha?.carga?.pesoKg == null || ficha.carga.pesoKg <= 0
  },
  {
    campo: 'carga.contenedor',
    severidad: 'alta',
    mensaje: 'Falta especificar el tipo de equipamiento / contenedor',
    pregunta: '¿Necesitás contenedor completo (20\', 40\' o 40HC) o carga suelta (LCL)?',
    check: (ficha) => !ficha?.carga?.contenedor
  },
  {
    campo: 'carga.cantidad',
    severidad: 'alta',
    mensaje: 'Falta la cantidad de unidades o contenedores',
    pregunta: '¿Cuántos contenedores o pallets son?',
    check: (ficha) => ficha?.carga?.cantidad == null || ficha.carga.cantidad <= 0
  },
  {
    campo: 'origen.ciudad',
    severidad: 'alta',
    mensaje: 'Falta la ciudad de origen de la carga',
    pregunta: '¿Desde qué ciudad/punto sale la carga?',
    check: (ficha) => !ficha?.origen?.ciudad || ficha.origen.ciudad.trim() === ''
  },
  {
    campo: 'destino.pais',
    severidad: 'alta',
    mensaje: 'Falta el país de destino',
    pregunta: '¿A qué país (y ciudad/puerto) va destinada?',
    check: (ficha) => !ficha?.destino?.pais || ficha.destino.pais.trim() === ''
  },
  {
    campo: 'operacion',
    severidad: 'alta',
    mensaje: 'Falta definir si es exportación o importación',
    pregunta: '¿Es una exportación o una importación?',
    check: (ficha) => !ficha?.operacion
  },

  // Severidad Media
  {
    campo: 'carga.volumenM3',
    severidad: 'media',
    mensaje: 'Falta el volumen en metros cúbicos',
    pregunta: '¿Sabés el volumen total en m³ o las dimensiones de los pallets?',
    check: (ficha) => ficha?.carga?.volumenM3 == null || ficha.carga.volumenM3 <= 0
  },
  {
    campo: 'incoterm',
    severidad: 'media',
    mensaje: 'Falta el Incoterm comercial',
    pregunta: '¿Bajo qué incoterm cotizamos? (FOB, CIF, EXW…)',
    check: (ficha) => !ficha?.incoterm || ficha.incoterm.trim() === ''
  },
  {
    campo: 'fechaEstimada',
    severidad: 'media',
    mensaje: 'Falta la fecha estimada de embarque',
    pregunta: '¿Para qué fecha necesitás embarcar?',
    check: (ficha) => !ficha?.fechaEstimada || ficha.fechaEstimada.trim() === ''
  },
  {
    campo: 'contacto.empresa',
    severidad: 'media',
    mensaje: 'Falta el nombre de la empresa solicitante',
    pregunta: '¿A nombre de qué empresa emitimos la solicitud?',
    check: (ficha) => !ficha?.contacto?.empresa || ficha.contacto.empresa.trim() === ''
  },
  {
    campo: 'destino.ciudad',
    severidad: 'media',
    mensaje: 'Falta la ciudad o puerto específico de descarga',
    pregunta: '¿A qué ciudad o puerto específico llega?',
    check: (ficha) => !ficha?.destino?.ciudad || ficha.destino.ciudad.trim() === ''
  },
  {
    campo: 'operativa.ritmoCargaDiario',
    severidad: 'media',
    mensaje: 'Falta el ritmo de carga diario estimado',
    pregunta: '¿A qué ritmo podés cargar por día? (ej. 2 contenedores/día)',
    check: (ficha) => !ficha?.operativa?.ritmoCargaDiario || ficha.operativa.ritmoCargaDiario.trim() === ''
  },
  {
    campo: 'operativa.plazoSobreestadiaDias',
    severidad: 'media',
    mensaje: 'Falta el plazo de días libres (free time) antes de demurrage',
    pregunta: '¿Cuántos días de free time necesitás en el puerto de destino?',
    check: (ficha) => ficha?.operativa?.plazoSobreestadiaDias == null || ficha.operativa.plazoSobreestadiaDias <= 0
  },
  {
    campo: 'operativa.depositoFiscalVacios',
    severidad: 'media',
    mensaje: 'Falta evaluar depósito fiscal regional para retiro o devolución de vacío',
    pregunta: '¿Podés retirar o devolver el contenedor vacío en un depósito fiscal regional (ej. COCEL Salta)?',
    check: (ficha) => !ficha?.operativa?.depositoFiscalVacios || ficha.operativa.depositoFiscalVacios.trim() === ''
  }
];

/**
 * Valida una FichaTecnica y genera las alertas requeridas.
 * @param {object} ficha 
 * @returns {{ alertas: Array, completo: boolean }}
 */
export function validarExpediente(ficha) {
  const alertas = [];
  let completo = true;

  const isLcl = ficha?.carga?.contenedor === 'LCL';

  for (const regla of MATRIZ_REGLAS) {
    if (regla.check(ficha)) {
      let severidad = regla.severidad;

      // Regla especial: si contenedor es LCL, volumenM3 sube a severidad alta
      if (regla.campo === 'carga.volumenM3' && isLcl) {
        severidad = 'alta';
      }

      if (severidad === 'alta') {
        completo = false;
      }

      alertas.push({
        campo: regla.campo,
        mensaje: regla.mensaje,
        pregunta: regla.pregunta,
        severidad
      });
    }
  }

  // Alerta extra: Incoterm presente pero no reconocido en estándares internacionales
  if (ficha?.incoterm && !INCOTERMS_ESTANDAR.includes(ficha.incoterm.toUpperCase().trim())) {
    alertas.push({
      campo: 'incoterm',
      mensaje: `Incoterm no estándar ("${ficha.incoterm}"), verificar validez comercial`,
      pregunta: '¿El incoterm corresponde a los términos estándar ICC (FOB, CIF, CFR, FCA, etc.)?',
      severidad: 'media'
    });
  }

  // Ordenar: altas primero, luego medias
  alertas.sort((a, b) => {
    if (a.severidad === 'alta' && b.severidad !== 'alta') return -1;
    if (a.severidad !== 'alta' && b.severidad === 'alta') return 1;
    return 0;
  });

  return {
    alertas,
    completo
  };
}
