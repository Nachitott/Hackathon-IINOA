/**
 * N-13 — Mapa de corredores (Leaflet + OSM, gratis sin API key).
 * Marcadores de puertos (lat/lng del contrato §2.3) + líneas desde el
 * ORIGEN DE LA FICHA hacia cada puerto, coloreadas por corredor — se
 * redibuja con cada consulta. Tooltip con distanciaAproxKm cuando el
 * seed la conoce. Fallback: si el mapa no inicializa → null + cards.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../lib/appContext.js'
import { resolveOrigen, ORIGENES_DEFAULT, distanciaKm } from '../lib/origen.js'

// Color por corredor — alineado con los tokens NOA de index.css.
const COLORES = { pacifico: '#3e5c76', atlantico: '#b87333' }

export default function MapaCorredores() {
  const { corredores, corredorSel, ficha } = useApp()
  const refDiv = useRef(null)
  const refMapa = useRef(null)
  const refCapas = useRef(null)
  const [fallo, setFallo] = useState(false)

  // Origen del tramo terrestre: el de la ficha si es una ciudad NOA conocida,
  // si no, Salta + S.S. de Jujuy como contexto regional. Memoizado — cambia
  // solo cuando cambia la ficha (nueva consulta o edición).
  const origenes = useMemo(() => {
    const o = resolveOrigen(ficha)
    return o ? [o] : ORIGENES_DEFAULT
  }, [ficha])

  // Inicializar el mapa una sola vez.
  useEffect(() => {
    if (refMapa.current || !refDiv.current) return
    try {
      const mapa = L.map(refDiv.current, { scrollWheelZoom: false }).setView([-27, -65], 5)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 12,
      }).addTo(mapa)
      refCapas.current = L.layerGroup().addTo(mapa)
      refMapa.current = mapa
    } catch {
      // setState diferido: el lint prohíbe setState síncrono en effects.
      queueMicrotask(() => setFallo(true))
    }
    return () => {
      refMapa.current?.remove()
      refMapa.current = null
    }
  }, [])

  // Redibujar cuando llegan corredores, cambia el seleccionado O cambia el
  // origen de la consulta — el mapa se actualiza con cada nueva consulta.
  useEffect(() => {
    const mapa = refMapa.current
    const capas = refCapas.current
    if (!mapa || !capas || corredores.length === 0) return
    capas.clearLayers()
    const bounds = []

    for (const o of origenes) {
      L.circleMarker([o.lat, o.lng], {
        radius: 6,
        color: '#8b5e3c',
        weight: 2,
        fillColor: '#8b5e3c',
        fillOpacity: 0.9,
      })
        .addTo(capas)
        .bindTooltip(`Origen: ${o.nombre}`, { direction: 'top' })
      bounds.push([o.lat, o.lng])
    }

    for (const c of corredores) {
      const color = COLORES[c.id] ?? '#64748b'
      const atenuar = corredorSel && corredorSel !== c.id
      for (const p of c.puertos) {
        for (const o of origenes) {
          L.polyline(
            [
              [o.lat, o.lng],
              [p.lat, p.lng],
            ],
            { color, weight: atenuar ? 1.5 : 3, opacity: atenuar ? 0.25 : 0.75, dashArray: '6 6' },
          ).addTo(capas)
        }
        const km = distanciaKm(c, origenes[0]?.slug, p.nombre)
        L.circleMarker([p.lat, p.lng], {
          radius: atenuar ? 4 : 7,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: atenuar ? 0.3 : 0.85,
        })
          .addTo(capas)
          .bindTooltip(
            `${p.nombre} (${c.nombre})${km ? ` · ~${km} km desde ${origenes[0].nombre}` : ''}`,
            { direction: 'top' },
          )
        bounds.push([p.lat, p.lng])
      }
    }

    if (bounds.length) mapa.fitBounds(bounds, { padding: [24, 24] })
  }, [corredores, corredorSel, origenes])

  if (fallo || corredores.length === 0) return null

  return (
    <div className="relative z-0 mb-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div ref={refDiv} className="h-64 w-full" role="img" aria-label="Mapa de corredores logísticos" />
      <div className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
        <span className="mr-3"><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: COLORES.pacifico }} />Pacífico</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: COLORES.atlantico }} />Atlántico</span>
      </div>
    </div>
  )
}
