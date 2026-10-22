/**
 * Resolución del origen NOA desde la ficha → coordenadas para el mapa
 * y slug para lookup de `distanciaAproxKm` del corredor (contrato §2.3).
 * Las distancias del seed están por par ciudad-puerto a nivel provincia
 * ("jujuy-antofagasta", "salta-buenos aires") — los slugs mapean ciudades
 * a su provincia.
 */

const norm = (s) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

// Orígenes por defecto cuando la ficha no tiene ciudad reconocible.
export const ORIGENES_DEFAULT = [
  { nombre: 'Salta', slug: 'salta', lat: -24.7829, lng: -65.4232 },
  { nombre: 'S.S. de Jujuy', slug: 'jujuy', lat: -24.1858, lng: -65.2995 },
]

const CIUDADES_NOA = [
  { match: /^salta/, nombre: 'Salta', slug: 'salta', lat: -24.7829, lng: -65.4232 },
  { match: /jujuy|san salvador/, nombre: 'S.S. de Jujuy', slug: 'jujuy', lat: -24.1858, lng: -65.2995 },
  { match: /perico/, nombre: 'Perico', slug: 'jujuy', lat: -24.3752, lng: -65.1179 },
  { match: /guemes/, nombre: 'Gral. Güemes', slug: 'salta', lat: -24.6721, lng: -65.0451 },
  { match: /oran/, nombre: 'Orán', slug: 'salta', lat: -23.1348, lng: -64.3243 },
]

/**
 * Origen resuelto de la ficha ({nombre, slug, lat, lng}) o null si no matchea.
 * @param {import('./types.js').FichaTecnica|null} ficha
 */
export const resolveOrigen = (ficha) => {
  const c = norm(ficha?.origen?.ciudad ?? ficha?.origen?.provincia)
  if (!c) return null
  return CIUDADES_NOA.find((o) => o.match.test(c)) ?? null
}

/**
 * Km terrestres origen→puerto según `distanciaAproxKm["slugOrigen-puerto"]`.
 * @returns {number|null}
 */
export const distanciaKm = (corredor, slugOrigen, nombrePuerto) => {
  const d = corredor?.distanciaAproxKm
  if (!d || !slugOrigen || !nombrePuerto) return null
  return d[`${slugOrigen}-${norm(nombrePuerto)}`] ?? null
}

/** Primera distancia conocida del corredor para el slug de origen. */
export const distanciaDesdeOrigen = (corredor, slugOrigen) => {
  const d = corredor?.distanciaAproxKm
  if (!d || !slugOrigen) return null
  const key = Object.keys(d).find((k) => k.startsWith(`${slugOrigen}-`))
  return key ? d[key] : null
}
