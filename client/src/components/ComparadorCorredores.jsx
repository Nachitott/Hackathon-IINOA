/**
 * N-11 — Comparador visual Pacífico vs Atlántico.
 * Cards con puertos/pasos/pros/contras + selector que guarda corredorSel
 * en el estado global (habilita el RFQ con contexto). Banner de advertencia
 * invernal sobre el Paso de Jama (dato vivo: verificar estado del paso).
 */

import { useEffect } from 'react'
import { useApp } from '../lib/appContext.js'

const esInvierno = () => {
  const mes = new Date().getMonth() // 0=ene — jun(5), jul(6), ago(7) en hemisferio sur
  return mes >= 5 && mes <= 7
}

function CardCorredor({ corredor, seleccionado, onSeleccionar }) {
  return (
    <article
      className={`flex flex-col rounded-xl border-2 bg-white p-4 shadow-sm transition ${
        seleccionado ? 'border-noa-cobre ring-2 ring-noa-cobre/30' : 'border-slate-200'
      }`}
    >
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-noa-tierra">{corredor.nombre}</h3>
          <p className="text-xs text-slate-500">~{corredor.tiempoEstimadoDias} días terrestres</p>
        </div>
        <button
          type="button"
          onClick={onSeleccionar}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${
            seleccionado
              ? 'bg-noa-cobre text-white'
              : 'border border-noa-cobre text-noa-cobre hover:bg-noa-cobre hover:text-white'
          }`}
        >
          {seleccionado ? 'Seleccionado' : 'Elegir'}
        </button>
      </header>

      <div className="mb-2 flex flex-wrap gap-1">
        {corredor.pasosFronterizos.map((p) => (
          <span key={p} className="rounded-full bg-noa-andes/10 px-2 py-0.5 text-xs font-medium text-noa-andes">
            {p}
          </span>
        ))}
        {corredor.puertos.map((p) => (
          <span key={p.nombre} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            ⚓ {p.nombre}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div>
          <p className="mb-1 font-bold uppercase tracking-wide text-sev-ok">Pros</p>
          <ul className="space-y-1">
            {corredor.pros.slice(0, 4).map((p) => (
              <li key={p} className="text-slate-600">+ {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-bold uppercase tracking-wide text-sev-alta">Contras</p>
          <ul className="space-y-1">
            {corredor.contras.slice(0, 4).map((c) => (
              <li key={c} className="text-slate-600">− {c}</li>
            ))}
          </ul>
        </div>
      </div>

      <details className="mt-3 text-xs text-slate-600">
        <summary className="cursor-pointer font-semibold text-noa-andes">Consideraciones operativas</summary>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {corredor.consideraciones.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
    </article>
  )
}

export default function ComparadorCorredores() {
  const { corredores, corredorSel, setCorredorSel, cargarCorredores, loading } = useApp()

  useEffect(() => {
    if (corredores.length === 0) cargarCorredores()
  }, [corredores.length, cargarCorredores])

  const pacificoSel = corredorSel === 'pacifico'

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-noa-tierra">Comparador de corredores</h2>

      {pacificoSel && (
        <div className="mb-3 rounded-lg border border-sev-media/50 bg-sev-media/10 px-3 py-2 text-sm text-amber-900">
          <span className="font-semibold">Paso de Jama:</span> habilitado todo el año pero con cierres
          eventuales por nevadas en invierno (jun–ago).{' '}
          {esInvierno() ? (
            <span className="font-bold">Estamos en temporada invernal — verificar estado antes de prometer fechas.</span>
          ) : (
            'Verificar estado antes de prometer fechas.'
          )}
        </div>
      )}

      {loading.corredores && corredores.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Cargando corredores…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
          {corredores.map((c) => (
            <CardCorredor
              key={c.id}
              corredor={c}
              seleccionado={corredorSel === c.id}
              onSeleccionar={() => setCorredorSel(corredorSel === c.id ? null : c.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
