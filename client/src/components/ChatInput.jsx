/**
 * N-08 — Input informal tipo chat → POST /api/parse → guarda ficha+alertas
 * en el estado global. Incluye "Cargar ejemplo" (N-18): la demo no depende
 * de tipear en vivo.
 */

import { useEffect, useRef, useState } from 'react'
import { useApp } from '../lib/appContext.js'
import { EJEMPLOS } from '../lib/mocks.js'

export default function ChatInput() {
  const { estructurar, loading, error } = useApp()
  const [texto, setTexto] = useState('')
  const refArea = useRef(null)
  const cargando = Boolean(loading.parse)

  const enviar = () => estructurar(texto)

  // Auto-grow vertical: el textarea crece con el contenido (tope ~40vh).
  useEffect(() => {
    const el = refArea.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.4)}px`
  }, [texto])

  return (
    <section className="flex flex-col self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-noa-tierra">Consulta informal</h2>

      <div className="mb-2 flex flex-wrap gap-2">
        {Object.entries(EJEMPLOS).map(([id, ejemplo]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTexto(ejemplo)}
            className="rounded-full border border-noa-cobre px-3 py-1 text-xs font-medium text-noa-cobre hover:bg-noa-cobre hover:text-white"
            title={ejemplo}
          >
            Ejemplo {id}
          </button>
        ))}
      </div>

      <textarea
        ref={refArea}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={8}
        placeholder='Pegá acá el mensaje del cliente. Ej: "necesito mandar 2 containers de 40 de sal a china desde salta"'
        className="w-full resize-none overflow-y-auto rounded-lg border border-slate-300 p-3 text-sm leading-relaxed focus:border-noa-cobre focus:outline-none focus:ring-2 focus:ring-noa-cobre/30"
      />

      <button
        type="button"
        onClick={enviar}
        disabled={cargando || !texto.trim()}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-noa-andes px-4 py-2.5 font-semibold text-white transition hover:bg-noa-andes/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cargando && (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        )}
        {cargando ? 'Estructurando…' : 'Estructurar consulta'}
      </button>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-sev-alta/40 bg-sev-alta/10 px-3 py-2 text-sm text-sev-alta">
          <span className="font-semibold">{error.code}:</span> {error.message}
        </p>
      )}
    </section>
  )
}
