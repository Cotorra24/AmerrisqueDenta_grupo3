import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './PacienteViews.css'

// 1. CATÁLOGO DE SERVICIOS (REDISEÑADO)
export function CatalogoServicios() {
    const [servicios, setServicios] = useState([])
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        const fetchServicios = async () => {
            const { data } = await supabase
                .from('servicios')
                .select('*')
                .eq('activo', true)
                .order('nombre')
            setServicios(data || [])
        }
        fetchServicios()
    }, [])

    const filtrados = servicios.filter(s => 
        s.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    // Iconos según el tipo de servicio (mejoras visuales)
    const getIcon = (nombre) => {
        const n = nombre.toLowerCase()
        if (n.includes('limpieza')) return '✨'
        if (n.includes('cirugía') || n.includes('extracción')) return '🦷'
        if (n.includes('blanqueamiento')) return '💎'
        if (n.includes('ortodoncia') || n.includes('brackets')) return '⛓️'
        if (n.includes('consulta')) return '🩺'
        return '💙'
    }

    return (
        <div className="cat-premium">
            <div className="cat-header">
                <div className="cat-text">
                    <h2>Catálogo de Servicios</h2>
                    <p>Descubre nuestros tratamientos de vanguardia para tu salud dental.</p>
                </div>
                <div className="cat-search-bar">
                    <input 
                        type="text" 
                        placeholder="Buscar un tratamiento..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            <div className="cat-grid">
                {filtrados.map(s => (
                    <div key={s.id} className="cat-card">
                        <div className="cat-card-icon">{getIcon(s.nombre)}</div>
                        <div className="cat-card-content">
                            <h3>{s.nombre}</h3>
                            <p>{s.descripcion || 'Tratamiento especializado con tecnología de punta.'}</p>
                            <div className="cat-card-footer">
                                <span className="cat-price">C$ {s.costo.toLocaleString()}</span>
                                <button className="cat-btn-info">Ver detalles</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 2. HISTORIAL CLÍNICO
export function HistorialClinico({ pacienteId }) {
    const [historial, setHistorial] = useState([])

    useEffect(() => {
        if (!pacienteId) return
        const fetchHistorial = async () => {
            const { data } = await supabase
                .from('historiales_clinicos')
                .select('*, odontologos(usuarios(nombre, apellido))')
                .eq('paciente_id', pacienteId)
                .order('fecha', { ascending: false })
            setHistorial(data || [])
        }
        fetchHistorial()
    }, [pacienteId])

    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Mi Historial Clínico</h2>
            </div>
            <div className="historial-lista">
                {historial.length > 0 ? historial.map(h => (
                    <div key={h.id} className="hist-item">
                        <div className="hist-fecha">
                            <span className="f-dia">{new Date(h.fecha).getDate() + 1}</span>
                            <span className="f-mes">{new Date(h.fecha).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}</span>
                        </div>
                        <div className="hist-cuerpo">
                            <div className="hist-meta">
                                <strong>Doctor/a:</strong> {h.odontologos.usuarios.nombre} {h.odontologos.usuarios.apellido}
                            </div>
                            <div className="hist-diag">
                                <p>{h.diagnostico}</p>
                            </div>
                        </div>
                    </div>
                )) : <p className="no-data">Aún no hay registros en tu historial.</p>}
            </div>
        </div>
    )
}

// 3. ESTADO DE CUENTA
export function EstadoCuenta({ pacienteId }) {
    const [datosCuenta, setDatosCuenta] = useState(null)
    const [pagos, setPagos] = useState([])

    useEffect(() => {
        if (!pacienteId) return
        const fetchPagos = async () => {
            const { data: cuenta } = await supabase.from('estado_cuenta').select('*').eq('paciente_id', pacienteId).single()
            setDatosCuenta(cuenta)
            const { data: listaPagos } = await supabase.from('pagos').select('*').eq('paciente_id', pacienteId).order('fecha_pago', { ascending: false })
            setPagos(listaPagos || [])
        }
        fetchPagos()
    }, [pacienteId])

    return (
        <div className="view-container">
            <div className="view-header">
                <h2>Mis Pagos y Saldo</h2>
            </div>
            
            <div className="stats-pago-grid">
                <div className="stat-pago-card">
                    <span>Total Servicios</span>
                    <h3>C$ {datosCuenta?.total_tratamientos.toLocaleString() || '0'}</h3>
                </div>
                <div className="stat-pago-card success">
                    <span>Monto Pagado</span>
                    <h3>C$ {datosCuenta?.total_pagado.toLocaleString() || '0'}</h3>
                </div>
                <div className="stat-pago-card warning">
                    <span>Saldo Pendiente</span>
                    <h3>C$ {datosCuenta?.saldo_pendiente.toLocaleString() || '0'}</h3>
                </div>
            </div>

            <div className="pagos-recientes">
                <h4>Recibos Generados</h4>
                <div className="tabla-pagos-wrapper">
                    <table className="tabla-pagos">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Método</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                                    <td>{p.metodo_pago}</td>
                                    <td className="p-monto">C$ {p.monto.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
