import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './PacienteViews.css'

export function CatalogoServicios({ onVolver }) {
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data } = await supabase.from('servicios').select('*').eq('activo', true).order('nombre')
            setServicios(data || [])
            setCargando(false)
        }
        cargar()
    }, [])

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Catálogo de Servicios</h1>
            </div>
            <div className="pv-grid">
                {servicios.map(s => (
                    <div key={s.id} className="pv-card">
                        <div className="pv-card-icon">🦷</div>
                        <h3 className="pv-card-title">{s.nombre}</h3>
                        <p className="pv-card-desc">{s.descripcion}</p>
                        <p className="pv-card-price">C$ {s.costo.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function HistorialClinico({ onVolver }) {
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: pac } = await supabase.from('pacientes').select('id').eq('usuario_id', user.id).single()
            if (pac) {
                const { data } = await supabase
                    .from('historiales_clinicos')
                    .select('*, odontologos(usuarios(nombre, apellido))')
                    .eq('paciente_id', pac.id)
                    .order('fecha', { ascending: false })
                setHistorial(data || [])
            }
            setCargando(false)
        }
        cargar()
    }, [])

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Mi Historial Clínico</h1>
            </div>
            <div className="pv-lista">
                {historial.length === 0 ? <p>No hay registros en tu historial.</p> : 
                historial.map(h => (
                    <div key={h.id} className="pv-item">
                        <div className="pv-item-fecha">{new Date(h.fecha).toLocaleDateString()}</div>
                        <div className="pv-item-info">
                            <p className="pv-item-doctor">Dr. {h.odontologos?.usuarios?.nombre} {h.odontologos?.usuarios?.apellido}</p>
                            <p className="pv-item-diag"><b>Diagnóstico:</b> {h.diagnostico}</p>
                            {h.observaciones && <p className="pv-item-obs"><b>Obs:</b> {h.observaciones}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function EstadoCuenta({ onVolver }) {
    const [pagos, setPagos] = useState([])
    const [tratamientos, setTratamientos] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: pac } = await supabase.from('pacientes').select('id').eq('usuario_id', user.id).single()
            if (pac) {
                const { data: p } = await supabase.from('pagos').select('*').eq('paciente_id', pac.id).order('fecha_pago', { ascending: false })
                setPagos(p || [])

                const { data: t } = await supabase
                    .from('tratamientos')
                    .select('*, historiales_clinicos(paciente_id)')
                    .filter('historiales_clinicos.paciente_id', 'eq', pac.id)
                setTratamientos(t || [])
            }
            setCargando(false)
        }
        cargar()
    }, [])

    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0)

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Estado de Cuenta</h1>
            </div>
            
            <div className="pv-stats-pago">
                <div className="pv-stat-pago">
                    <p>Total Pagado</p>
                    <h2>C$ {totalPagado.toLocaleString()}</h2>
                </div>
            </div>

            <h2 className="pv-subtitulo">Historial de Pagos</h2>
            <div className="pv-lista">
                {pagos.map(p => (
                    <div key={p.id} className="pv-pago-item">
                        <div>
                            <p className="pv-pago-fecha">{new Date(p.fecha_pago).toLocaleDateString()}</p>
                            <p className="pv-pago-metodo">{p.metodo_pago}</p>
                        </div>
                        <div className="pv-pago-monto">C$ {Number(p.monto).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
