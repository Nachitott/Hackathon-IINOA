/**
 * N-12 — Editor de RFQ: botón "Generar RFQ" → POST /api/rfq → asunto +
 * textarea editable + "Copiar" (navigator.clipboard — copia el texto
 * EDITADO, no el original) + banner ámbar si quedan advertencias.
 */

import { useState } from 'react'
import { descargarRfqPdf } from '../lib/api.js'
import { useApp } from '../lib/appContext.js'
import { useAuth } from '../lib/authContext.js'

/** Fallback N-16: ventana limpia con el RFQ → imprimir/guardar como PDF. */
const imprimirRfq = (asunto, texto) => {
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return false
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  w.document.write(
    `<html><head><title>${esc(asunto)}</title></head>` +
      `<body style="font-family:system-ui;padding:32px">` +
      `<h2 style="margin:0 0 16px">${esc(asunto)}</h2>` +
      `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap">${esc(texto)}</pre>` +
      `</body></html>`,
  )
  w.document.close()
  w.focus()
  w.print()
  return true
}

export default function EditorRFQ() {
  const { ficha, rfq, generarRfq, loading, corredorSel } = useApp()
  const { token } = useAuth()
  const [textoEditado, setTextoEditado] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [errorPdf, setErrorPdf] = useState(null)
  const [rfqAnterior, setRfqAnterior] = useState(null)

  // Cuando se genera un RFQ nuevo, el editor arranca con ese texto
  // (ajuste de estado durante render — evita effect + re-render en cascada).
  if (rfq !== rfqAnterior) {
    setRfqAnterior(rfq)
    setTextoEditado(rfq?.texto ?? '')
    setCopiado(false)
    setErrorPdf(null)
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoEditado)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Fallback para navegadores sin clipboard API
      const ta = document.createElement('textarea')
      ta.value = textoEditado
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  /** N-16 — Intenta el PDF del back; si falla, abre vista de impresión (fallback siempre disponible). */
  const descargarPdf = async () => {
    setDescargando(true)
    setErrorPdf(null)
    try {
      const t = await token()
      const blob = await descargarRfqPdf(textoEditado, rfq.asunto, { token: t })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${rfq.asunto.replace(/[^\wáéíóúñü -]/gi, '').trim() || 'rfq'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      const ok = imprimirRfq(rfq.asunto, textoEditado)
      setErrorPdf(ok ? `${e.code}: ${e.message}` : 'PDF no disponible y el navegador bloqueó la ventana de impresión — usá Copiar texto.')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-noa-tierra">RFQ</h2>
        <button
          type="button"
          onClick={generarRfq}
          disabled={!ficha || Boolean(loading.rfq)}
          className="rounded-lg bg-noa-tierra px-4 py-2 text-sm font-semibold text-white transition hover:bg-noa-tierra/90 disabled:cursor-not-allowed disabled:opacity-50"
          title={ficha ? 'Generar solicitud de cotización' : 'Primero estructurá una consulta'}
        >
          {loading.rfq ? 'Generando…' : 'Generar RFQ'}
        </button>
      </div>

      {!rfq ? (
        <p className="text-sm text-slate-500">
          {ficha
            ? `Lista para generar${corredorSel ? ` — corredor ${corredorSel} seleccionado` : ''}.`
            : 'Necesitás una ficha estructurada para generar el RFQ.'}
        </p>
      ) : (
        <div className="space-y-3">
          {rfq.advertencias?.length > 0 && (
            <div className="rounded-lg border border-sev-media/50 bg-sev-media/10 px-3 py-2 text-sm text-amber-900">
              <span className="font-semibold">Ficha incompleta:</span> {rfq.advertencias.length} dato
              {rfq.advertencias.length === 1 ? '' : 's'} faltante{rfq.advertencias.length === 1 ? '' : 's'} —
              el RFQ marca <code className="font-mono">[A COMPLETAR]</code> donde falte info.
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Asunto
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
              {rfq.asunto}
            </p>
          </div>

          <div>
            <label htmlFor="rfq-texto" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Cuerpo (editable)
            </label>
            <textarea
              id="rfq-texto"
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              rows={16}
              className="w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-xs leading-relaxed focus:border-noa-cobre focus:outline-none focus:ring-2 focus:ring-noa-cobre/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={copiar}
              className={`rounded-lg px-4 py-2.5 font-semibold text-white transition ${
                copiado ? 'bg-sev-ok' : 'bg-noa-andes hover:bg-noa-andes/90'
              }`}
            >
              {copiado ? '✔ Copiado al portapapeles' : 'Copiar texto'}
            </button>
            <button
              type="button"
              onClick={descargarPdf}
              disabled={descargando}
              className="rounded-lg border border-noa-tierra px-4 py-2.5 font-semibold text-noa-tierra transition hover:bg-noa-tierra hover:text-white disabled:opacity-50"
            >
              {descargando ? 'Descargando…' : 'Descargar PDF'}
            </button>
          </div>

          {errorPdf && (
            <p role="alert" className="rounded-lg border border-sev-media/50 bg-sev-media/10 px-3 py-2 text-xs text-amber-900">
              {errorPdf} — se abrió la vista de impresión como alternativa (elegí "Guardar como PDF").
            </p>
          )}
        </div>
      )}
    </section>
  )
}
