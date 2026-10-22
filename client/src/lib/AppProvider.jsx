/**
 * Provider del estado global — N-06.
 * Un solo estado compartido por todos los paneles del dashboard:
 * { ficha, alertas, corredorSel, rfq, loading, error } + acciones que
 * llaman al wrapper api.js (mocks o API real según VITE_USE_MOCK).
 */

import { useCallback, useMemo, useState } from 'react'
import * as api from './api.js'
import { AppContext } from './appContext.js'

const hayAlertaAlta = (alertas) => alertas.some((a) => a.severidad === 'alta')

export function AppProvider({ children }) {
  const [textoOriginal, setTextoOriginal] = useState('')
  const [ficha, setFicha] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [completo, setCompleto] = useState(false)
  const [modo, setModo] = useState(null) // "fallback" si el parser corrió sin IA
  const [corredores, setCorredores] = useState([])
  const [depositosFiscales, setDepositosFiscales] = useState([])
  const [corredorSel, setCorredorSel] = useState(null)
  const [rfq, setRfq] = useState(null)
  const [loading, setLoading] = useState({})
  const [error, setError] = useState(null)

  const setCargando = (clave, v) => setLoading((s) => ({ ...s, [clave]: v }))
  const limpiarError = () => setError(null)

  /** POST /api/parse — texto informal → ficha + alertas. */
  const estructurar = useCallback(async (texto) => {
    if (!texto?.trim()) return
    setCargando('parse', true)
    setError(null)
    try {
      const d = await api.parseTexto(texto)
      setTextoOriginal(d.textoOriginal)
      setFicha(d.ficha)
      setAlertas(d.alertas)
      setCompleto(!hayAlertaAlta(d.alertas))
      setModo(d.modo ?? null)
      setRfq(null)
    } catch (e) {
      setError(e)
    } finally {
      setCargando('parse', false)
    }
  }, [])

  /** POST /api/validate — el front SIEMPRE re-valida tras editar la ficha (contrato §5). */
  const actualizarFicha = useCallback(async (fichaEditada) => {
    setFicha(fichaEditada)
    setCargando('validate', true)
    try {
      const d = await api.validarFicha(fichaEditada)
      setAlertas(d.alertas)
      setCompleto(d.completo)
    } catch (e) {
      setError(e)
    } finally {
      setCargando('validate', false)
    }
  }, [])

  /** POST /api/consultas — guarda la consulta actual en el historial (auth). */
  const guardarConsulta = useCallback(async (token) => {
    if (!ficha) return
    setCargando('guardar', true)
    try {
      await api.guardarConsulta({ textoOriginal, ficha, alertas }, { token })
      return true
    } catch (e) {
      setError(e)
      return false
    } finally {
      setCargando('guardar', false)
    }
  }, [ficha, textoOriginal, alertas])

  /** Carga una consulta del historial en el estado global (N-15). */
  const cargarConsulta = useCallback((consulta) => {
    setTextoOriginal(consulta.texto_original ?? '')
    setFicha(consulta.ficha ?? null)
    const alerts = consulta.alertas ?? []
    setAlertas(alerts)
    setCompleto(!hayAlertaAlta(alerts))
    setModo(null)
    setRfq(null)
    setError(null)
  }, [])

  /** GET /api/corredores (idempotente). */
  const cargarCorredores = useCallback(async () => {
    setCargando('corredores', true)
    try {
      const d = await api.getCorredores()
      setCorredores(d.corredores)
      setDepositosFiscales(d.depositosFiscales)
    } catch (e) {
      setError(e)
    } finally {
      setCargando('corredores', false)
    }
  }, [])

  /** POST /api/rfq — usa la ficha + el corredor seleccionado del estado global. */
  const generarRfq = useCallback(async () => {
    if (!ficha) return
    setCargando('rfq', true)
    setError(null)
    try {
      const d = await api.generarRfq(ficha, corredorSel)
      setRfq(d.rfq)
    } catch (e) {
      setError(e)
    } finally {
      setCargando('rfq', false)
    }
  }, [ficha, corredorSel])

  const reset = useCallback(() => {
    setTextoOriginal('')
    setFicha(null)
    setAlertas([])
    setCompleto(false)
    setModo(null)
    setCorredorSel(null)
    setRfq(null)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      // estado
      textoOriginal, ficha, alertas, completo, modo,
      corredores, depositosFiscales, corredorSel, rfq,
      loading, error,
      // acciones
      estructurar, actualizarFicha, cargarCorredores, generarRfq,
      guardarConsulta, cargarConsulta,
      setCorredorSel, setError, limpiarError, reset,
    }),
    [
      textoOriginal, ficha, alertas, completo, modo,
      corredores, depositosFiscales, corredorSel, rfq,
      loading, error,
      estructurar, actualizarFicha, cargarCorredores, generarRfq,
      guardarConsulta, cargarConsulta, reset,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
