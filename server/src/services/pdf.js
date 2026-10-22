import PDFDocument from 'pdfkit';

/**
 * Genera un buffer PDF profesional para el documento RFQ.
 * Fuente: 02-SKILLS/Generacion-RFQ.md §4
 * @param {{ asunto: string, texto: string }} param0 
 * @returns {Promise<Buffer>}
 */
export function generarPdfRfq({ asunto, texto }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Encabezado
      doc.fontSize(18).fillColor('#1E3A8A').text('LOGÍSTICA NOA — COMERCIO EXTERIOR', { align: 'center' });
      doc.fontSize(10).fillColor('#6B7280').text('Solicitud Formal de Cotización (Request for Quotation)', { align: 'center' });
      doc.moveDown(1);

      // Línea divisoria
      doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.2);

      // Asunto
      doc.fontSize(12).fillColor('#111827').font('Helvetica-Bold').text(`ASUNTO: ${asunto || 'RFQ Internacional'}`);
      doc.moveDown(0.5);

      // Fecha
      const fechaHoy = new Date().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fontSize(9).fillColor('#6B7280').font('Helvetica').text(`Fecha de emisión: ${fechaHoy}`);
      doc.moveDown(1.5);

      // Contenido del RFQ
      doc.fontSize(10).fillColor('#1F2937').font('Helvetica').text(texto || '', {
        align: 'left',
        lineGap: 3
      });

      doc.moveDown(2);
      doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Pie de página
      doc.fontSize(8).fillColor('#9CA3AF').text('Documento formal generado por el Asistente Inteligente de Estructuración Logística NOA.', {
        align: 'center'
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
