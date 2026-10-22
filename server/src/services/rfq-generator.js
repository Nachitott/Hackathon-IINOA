import { corredores } from '../db/seeds/corredores.js';
import { validarExpediente } from './validation.js';

/**
 * Genera el asunto y cuerpo de texto de un Request for Quotation (RFQ)
 * Fuente de verdad: 02-SKILLS/Generacion-RFQ.md
 * @param {object} ficha 
 * @param {string|null} corredorId 
 * @returns {{ asunto: string, texto: string, advertencias: Array }}
 */
export function generarRFQ(ficha, corredorId = null) {
  const { alertas } = validarExpediente(ficha);

  // 1. Asunto
  const op = ficha?.operacion ? (ficha.operacion === 'exportacion' ? 'Exportación' : 'Importación') : 'Operación';
  const tipo = ficha?.carga?.tipo || 'Carga general';
  const cant = ficha?.carga?.cantidad;
  const cont = ficha?.carga?.contenedor;
  const equipStr = (cant && cont) ? ` (${cant}x${cont})` : (cont ? ` (${cont})` : '');
  const orig = ficha?.origen?.ciudad || 'Origen';
  const dest = ficha?.destino?.pais || (ficha?.destino?.ciudad || 'Destino');
  const asunto = `RFQ – ${op} ${tipo}${equipStr} ${orig} → ${dest}`;

  // 2. Corredor evaluado
  let corredorTexto = 'A definir con el forwarder / línea marítima';
  if (corredorId) {
    const c = corredores.find(item => item.id === corredorId);
    if (c) {
      const pasos = c.pasosFronterizos && c.pasosFronterizos.length > 0 
        ? c.pasosFronterizos.map(p => p.nombre).join(', ') 
        : 'Sin cruce fronterizo terrestre';
      const puertos = c.puertos.map(p => p.nombre).join(', ');
      corredorTexto = `${c.nombre} (Paso: ${pasos} | Puertos: ${puertos})`;
    }
  }

  // 3. Origen y Destino formateados
  const origenTxt = ficha?.origen?.ciudad 
    ? `${ficha.origen.ciudad}${ficha?.origen?.provincia ? ', ' + ficha.origen.provincia : ''}, Argentina` 
    : '[A COMPLETAR]';

  const destinoTxt = ficha?.destino?.pais 
    ? `${ficha?.destino?.ciudad ? ficha.destino.ciudad + ', ' : ''}${ficha.destino.pais}` 
    : '[A COMPLETAR]';

  // 4. Carga formateada
  const mercaderiaTxt = ficha?.carga?.tipo || '[A COMPLETAR]';
  const pesoTxt = ficha?.carga?.pesoKg != null ? `${ficha.carga.pesoKg} kg` : '[A COMPLETAR]';
  const volumenTxt = ficha?.carga?.volumenM3 != null ? `${ficha.carga.volumenM3} m³` : '[A COMPLETAR]';
  const equipamientoTxt = (ficha?.carga?.cantidad != null && ficha?.carga?.contenedor) 
    ? `${ficha.carga.cantidad} x ${ficha.carga.contenedor}` 
    : (ficha?.carga?.contenedor || '[A COMPLETAR]');
  const fechaTxt = ficha?.fechaEstimada || '[A COMPLETAR]';

  // 5. Condiciones Operativas
  const ritmoTxt = ficha?.operativa?.ritmoCargaDiario || '[A COMPLETAR]';
  const freeTimeTxt = ficha?.operativa?.plazoSobreestadiaDias != null 
    ? `${ficha.operativa.plazoSobreestadiaDias} días en destino` 
    : '[A COMPLETAR]';
  const depositoTxt = ficha?.operativa?.depositoFiscalVacios 
    ? `${ficha.operativa.depositoFiscalVacios} (depósito fiscal extraportuario)` 
    : '[A COMPLETAR]';

  // 6. Sección de Advertencias / Datos a confirmar
  let seccionAdvertencias = '';
  if (alertas.length > 0) {
    const lineas = alertas.map(a => `  - [${a.severidad.toUpperCase()}] ${a.campo}: ${a.pregunta}`).join('\n');
    seccionAdvertencias = `\nDATOS PENDIENTES DE CONFIRMAR:\n${lineas}\n`;
  }

  // 7. Contacto
  const contactoNombre = ficha?.contacto?.nombre || '[Nombre del Solicitante]';
  const contactoEmpresa = ficha?.contacto?.empresa ? ` — ${ficha.contacto.empresa}` : '';

  // Cuerpo del RFQ
  const texto = `Estimados:

Por medio del presente solicito cotización para el siguiente servicio de transporte internacional:

OPERACIÓN
  Tipo:                ${ficha?.operacion || '[A COMPLETAR]'}
  Origen:              ${origenTxt}
  Destino:             ${destinoTxt}
  Corredor evaluado:   ${corredorTexto}
  Incoterm:            ${ficha?.incoterm || 'a convenir / [A COMPLETAR]'}

CARGA
  Mercadería:          ${mercaderiaTxt}
  Peso total:          ${pesoTxt}
  Volumen:             ${volumenTxt}
  Equipamiento:        ${equipamientoTxt}
  Fecha estimada:      ${fechaTxt}

CONDICIONES OPERATIVAS
  Ritmo de carga:          ${ritmoTxt}
  Free time solicitado:    ${freeTimeTxt}
  Retiro/devolución vacío: ${depositoTxt}

SE SOLICITA COTIZAR
  1. Flete marítimo / multimodal desde origen hasta destino final
  2. Cargos de terminal en origen y destino (THC)
  3. Gastos de documentación y fees (B/L, handling)
  4. Tiempo de tránsito estimado y próximas salidas
  5. Validez de la tarifa ofrecida
  6. Disponibilidad / autorización de retiro de unidad vacía en depósito fiscal regional
${seccionAdvertencias}
Quedo a disposición para ampliar información del embarque.

Saludos cordiales,
${contactoNombre}${contactoEmpresa}`;

  return {
    asunto,
    texto,
    advertencias: alertas
  };
}
