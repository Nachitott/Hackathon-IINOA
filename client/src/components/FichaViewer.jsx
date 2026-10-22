/**
 * N-09 — Render agrupado de la FichaTecnica.
 * Reglas del contrato: null → "—" atenuado · campos con alerta alta borde rojo
 * (media ámbar) · toda edición re-valida con POST /api/validate (§5.2).
 * Cada campo lleva data-campo="carga.pesoKg" para que AlertasPanel lo linkee.
 */

import { useState } from 'react'
import { useApp } from '../lib/appContext.js'

const GRUPOS = [
  {
    titulo: 'Contacto',
    campos: [
      ['contacto.nombre', 'Nombre'],
      ['contacto.empresa', 'Empresa'],
    ],
  },
  {
    titulo: 'Operación',
    campos: [
      ['operacion', 'Tipo de operación'],
      ['incoterm', 'Incoterm'],
      ['fechaEstimada', 'Fecha estimada'],
    ],
  },
  {
    titulo: 'Origen → Destino',
    campos: [
      ['origen.ciudad', 'Origen (ciudad)'],
      ['origen.provincia', 'Origen (provincia)'],
      ['destino.ciudad', 'Destino (ciudad)'],
      ['destino.pais', 'Destino (país)'],
    ],
  },
  {
    titulo: 'Carga',
    campos: [
      ['carga.tipo', 'Mercadería'],
      ['carga.pesoKg', 'Peso (kg)'],
      ['carga.volumenM3', 'Volumen (m³)'],
      ['carga.contenedor', 'Contenedor'],
      ['carga.cantidad', 'Cantidad'],
    ],
  },
  {
    titulo: 'Operativa',
    campos: [
      ['operativa.ritmoCargaDiario', 'Ritmo de carga diario'],
      ['operativa.plazoSobreestadiaDias', 'Free time (días)'],
      ['operativa.depositoFiscalVacios', 'Depósito fiscal vacíos'],
    ],
  },
  {
    titulo: 'Extras',
    campos: [['observaciones', 'Observaciones']],
  },
]

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

const setPath = (obj, path, valor) => {
  const claves = path.split('.')
  const copia = structuredClone(obj)
  let nodo = copia
  for (let i = 0; i < claves.length - 1; i++) nodo = nodo[claves[i]]
  nodo[claves.at(-1)] = valor
  return copia
}

const esNumerico = (path) => ['carga.pesoKg', 'carga.volumenM3', 'carga.cantidad', 'operativa.plazoSobreestadiaDias'].includes(path)

function Campo({ path, label, valor, severidad }) {
  const { ficha, actualizarFicha } = useApp()
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState('')

  const borde =
    severidad === 'alta'
      ? 'border-l-4 border-sev-alta bg-sev-alta/5'
      : severidad === 'media'
        ? 'border-l-4 border-sev-media bg-sev-media/5'
        : 'border-l-4 border-transparent'

  const guardar = () => {
    setEditando(false)
    const limpio = borrador.trim()
    const nuevo = esNumerico(path) && limpio !== '' ? Number(limpio) : limpio === '' ? null : limpio
    if (nuevo === valor) return
    actualizarFicha(setPath(ficha, path, nuevo))
  }

  return (
    <div
      data-campo={path}
      title={severidad ? `Alerta ${severidad}` : 'Click para editar'}
      onClick={() => {
        setBorrador(valor ?? '')
        setEditando(true)
      }}
      className={`cursor-pointer rounded-r-lg py-1.5 pl-3 pr-2 transition ${borde}`}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm">
        {editando ? (
          <input
            autoFocus
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            onBlur={guardar}
            onKeyDown={(e) => {
              if (e.key === 'Enter') guardar()
              if (e.key === 'Escape') setEditando(false)
            }}
            className="mt-0.5 w-full rounded border border-noa-cobre px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-noa-cobre/30"
          />
        ) : valor === null || valor === undefined || valor === '' ? (
          <span className="text-slate-400">—</span>
        ) : (
          <span className="font-medium text-slate-800">{String(valor)}</span>
        )}
      </dd>
    </div>
  )
}

export default function FichaViewer() {
  const { ficha, alertas } = useApp()

  if (!ficha) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-noa-tierra">Ficha técnica</h2>
        <p className="mt-2 text-sm text-slate-500">
          Estructurá una consulta para ver la ficha poblada acá.
        </p>
      </section>
    )
  }

  const severidadPorCampo = new Map(alertas.map((a) => [a.campo, a.severidad]))

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-noa-tierra">Ficha técnica</h2>
      <div className="space-y-4">
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            <h3 className="mb-1 border-b border-slate-100 pb-1 text-xs font-bold uppercase tracking-wider text-noa-andes">
              {g.titulo}
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              {g.campos.map(([path, label]) => (
                <Campo
                  key={path}
                  path={path}
                  label={label}
                  valor={get(ficha, path)}
                  severidad={severidadPorCampo.get(path)}
                />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
