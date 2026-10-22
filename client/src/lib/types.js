/**
 * Typedefs del contrato front↔back — copia fiel de CONTRATO-API §2.
 * Fuente única de verdad: ../CONTRATO-API.md (cambios ahí ⇒ actualizar acá).
 *
 * Regla de dominio: campos ausentes llegan como `null`, NUNCA se inventan
 * y en UI se renderizan como "—".
 */

/**
 * @typedef {Object} Contacto
 * @property {string|null} nombre
 * @property {string|null} empresa
 */

/**
 * @typedef {"exportacion"|"importacion"|null} Operacion
 */

/**
 * @typedef {Object} Origen
 * @property {string|null} ciudad
 * @property {string|null} provincia
 */

/**
 * @typedef {Object} Destino
 * @property {string|null} ciudad
 * @property {string|null} pais
 */

/**
 * @typedef {"20ST"|"40ST"|"40HC"|"LCL"|"reefer"|null} TipoContenedor
 */

/**
 * @typedef {Object} Carga
 * @property {string|null} tipo        mercadería normalizada (sal, litio, azúcar…)
 * @property {number|null} pesoKg      siempre normalizado a kilogramos (tn → ×1000)
 * @property {number|null} volumenM3   siempre normalizado a metros cúbicos
 * @property {TipoContenedor} contenedor
 * @property {number|null} cantidad
 */

/**
 * Parámetros que el PDF del desafío marca como faltantes frecuentes (ver GLOSARIO).
 * @typedef {Object} Operativa
 * @property {string|null} ritmoCargaDiario      texto libre: "2 contenedores/día", "500 kg/día"
 * @property {number|null} plazoSobreestadiaDias días de free time necesarios en destino (demurrage)
 * @property {string|null} depositoFiscalVacios  depósito fiscal para vacíos (ej. "COCEL Salta")
 */

/**
 * Objeto central de toda la app.
 * @typedef {Object} FichaTecnica
 * @property {Contacto} contacto
 * @property {Operacion} operacion
 * @property {Origen} origen
 * @property {Destino} destino
 * @property {Carga} carga
 * @property {string|null} incoterm     código de 3 letras (FOB, CIF, EXW…) o null
 * @property {string|null} fechaEstimada ISO string o null
 * @property {Operativa} operativa
 * @property {string|null} observaciones
 */

/**
 * @typedef {"alta"|"media"} Severidad   alta = indispensable para cotizar
 */

/**
 * @typedef {Object} Alerta
 * @property {string} campo        path dot-notation sobre FichaTecnica (ej. "carga.pesoKg")
 * @property {string} mensaje      qué falta
 * @property {string} pregunta     pregunta sugerida para hacerle al cliente
 * @property {Severidad} severidad
 */

/**
 * @typedef {Object} Puerto
 * @property {string} nombre
 * @property {string} pais
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {"pacifico"|"atlantico"|null} CorredorId
 */

/**
 * Paso fronterizo servido por el back como objeto rico (CONTRATO-API §2.3).
 * Se toleran strings planos (mocks/datos viejos) — normalizar con nombre.
 * @typedef {Object} PasoFronterizo
 * @property {string} nombre
 * @property {number} [alturaMsnm]
 * @property {string} [tipo]
 * @property {string} [nota]
 */

/**
 * @typedef {Object} Corredor
 * @property {string} id
 * @property {string} nombre
 * @property {(PasoFronterizo|string)[]} pasosFronterizos
 * @property {Puerto[]} puertos
 * @property {number} tiempoEstimadoDias
 * @property {string[]} pros
 * @property {string[]} contras
 * @property {string[]} consideraciones
 */

/**
 * @typedef {Object} DepositoFiscal
 * @property {string} nombre
 * @property {string} ciudad
 * @property {string} provincia
 * @property {string} nota
 */

/**
 * @typedef {Object} Rfq
 * @property {string} asunto
 * @property {string} texto           editable — nulls ya resueltos como "[A COMPLETAR]"
 * @property {Alerta[]} advertencias  alertas restantes si la ficha está incompleta
 */

/* ---------- Shapes de response por endpoint (CONTRATO-API §3) ---------- */

/**
 * POST /api/parse
 * @typedef {Object} ParseResponse
 * @property {FichaTecnica} ficha
 * @property {Alerta[]} alertas
 * @property {string} textoOriginal
 * @property {"gemini"|"fallback"} [modo]  motor que parseó (el back siempre lo envía)
 */

/**
 * POST /api/validate
 * @typedef {Object} ValidateResponse
 * @property {Alerta[]} alertas
 * @property {boolean} completo
 */

/**
 * GET /api/corredores
 * @typedef {Object} CorredoresResponse
 * @property {Corredor[]} corredores
 * @property {DepositoFiscal[]} depositosFiscales
 */

/**
 * POST /api/rfq
 * @typedef {Object} RfqResponse
 * @property {Rfq} rfq
 */

/**
 * Consulta persistida (GET /api/consultas)
 * @typedef {Object} Consulta
 * @property {string} id
 * @property {string} texto_original
 * @property {FichaTecnica} ficha
 * @property {Alerta[]} alertas
 * @property {string} created_at
 */

/**
 * Formato de error estándar del contrato §1.
 * @typedef {Object} ApiErrorBody
 * @property {{code: string, message: string}} error
 */

export {}
