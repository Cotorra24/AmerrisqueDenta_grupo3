import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import '../paciente/Dashboard.css'
import './DashboardAdmin.css'

export default function DashboardAdmin() {
    const [usuario, setUsuario] = useState(null)
    const [stats, setStats] = useState({ pacientes: 0, citasHoy: 0, nuevosMes: 0 })
    const [kpis, setKpis] = useState({ atendidos: 0, citasDia: 0, ingresosMes: 0, saldoPendiente: 0 })
    const [citas, setCitas] = useState([])

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: u } = await supabase.from('usuarios').select('nombre').eq('id', user.id).single()
            setUsuario(u)

            const { count: totalPacientes } = await supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('activo', true)

            const hoy = new Date().toISOString().split('T')[0]
            const { data: citasHoyData } = await supabase
                .from('citas')
                .select('*, pacientes(nombre,apellido), odontologos(usuarios(nombre,apellido))')
                .gte('fecha_hora', hoy + 'T00:00:00')
                .lte('fecha_hora', hoy + 'T23:59:59')
                .order('fecha_hora', { ascending: true })

            const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            const { data: pagos } = await supabase.from('pagos').select('monto').gte('fecha_pago', inicioMes.split('T')[0])
            const { data: estadoCuenta } = await supabase.from('estado_cuenta').select('saldo_pendiente')

            const ingresosMes = pagos?.reduce((s, p) => s + Number(p.monto), 0) || 0
            const saldoPendiente = estadoCuenta?.reduce((s, e) => s + Number(e.saldo_pendiente), 0) || 0

            setCitas(citasHoyData || [])
            setStats({ pacientes: totalPacientes || 0, citasHoy: citasHoyData?.length || 0, nuevosMes: 8 })
            setKpis({ atendidos: 12, citasDia: citasHoyData?.length || 0, ingresosMes, saldoPendiente })
        }
        cargar()
    }, [])

    const cerrarSesion = async () => { await supabase.auth.signOut(); window.location.href = '/' }
    const hoy = new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="dash-layout">
            <aside className="dash-sidebar admin-sidebar">
                <div className="dash-brand">
                    <div className="dash-brand-icon">🦷</div>
                    <div><p className="dash-brand-name">Amerrisque</p><p className="dash-brand-sub">Dental</p></div>
                </div>
                <nav className="dash-nav">
                    <a href="#" className="dash-nav-item active">🏠 Inicio</a>
                    <a href="#" className="dash-nav-item">👥 Pacientes</a>
                    <a href="#" className="dash-nav-item">📊 Reportes</a>
                </nav>
                <button onClick={cerrarSesion} className="dash-salir">↩ Cerrar Sesión</button>
            </aside>

            <main className="dash-main">
                <div className="dash-header admin-header">
                    <div>
                        <p className="dash-fecha">Panel de Administración</p>
                        <h1 className="dash-saludo">Bienvenida, {usuario?.nombre}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>{hoy}</p>
                    </div>
                    <div className="dash-bell">🔔<span className="dash-bell-badge">1</span></div>
                </div>

                <div className="dash-stats-top">
                    <div className="dash-stat-top morado">
                        <p className="dash-stat-top-num">{stats.pacientes}</p><p>Pacientes activos</p>
                    </div>
                    <div className="dash-stat-top morado">
                        <p className="dash-stat-top-num">{stats.citasHoy}</p><p>Citas hoy</p>
                    </div>
                    <div className="dash-stat-top morado">
                        <p className="dash-stat-top-num">{stats.nuevosMes}</p><p>Nuevos/mes</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="dash-section">
                    <h2 className="dash-section-titulo">INDICADORES CLAVE</h2>
                    <div className="admin-kpis">
                        <div className="admin-kpi azul-claro">
                            <span>👤</span>
                            <p className="admin-kpi-num azul">{kpis.atendidos}</p>
                            <p className="admin-kpi-label">hoy</p>
                            <p className="admin-kpi-desc">Pacientes Atendidos</p>
                        </div>
                        <div className="admin-kpi verde-claro">
                            <span>📅</span>
                            <p className="admin-kpi-num verde">{kpis.citasDia}</p>
                            <p className="admin-kpi-label">programadas</p>
                            <p className="admin-kpi-desc">Citas del Día</p>
                        </div>
                        <div className="admin-kpi amarillo-claro">
                            <span>💰</span>
                            <p className="admin-kpi-num amarillo">C${(kpis.ingresosMes / 1000).toFixed(1)}k</p>
                            <p className="admin-kpi-label">este mes</p>
                            <p className="admin-kpi-desc">Ingresos del Mes</p>
                        </div>
                        <div className="admin-kpi rojo-claro">
                            <span>⏰</span>
                            <p className="admin-kpi-num rojo">C${(kpis.saldoPendiente / 1000).toFixed(1)}k</p>
                            <p className="admin-kpi-label">pendiente</p>
                            <p className="admin-kpi-desc">Saldo Pendiente</p>
                        </div>
                    </div>
                </div>

                {/* Acceso rápido */}
                <div className="dash-section">
                    <h2 className="dash-section-titulo">ACCESO RÁPIDO</h2>
                    <div className="admin-accesos">
                        <div className="admin-acceso">
                            <span>👥</span>
                            <div>
                                <p className="admin-acceso-titulo">Gestionar Pacientes</p>
                                <p className="admin-acceso-desc">{stats.pacientes} pacientes registrados</p>
                            </div>
                            <span>›</span>
                        </div>
                        <div className="admin-acceso">
                            <span>📈</span>
                            <div>
                                <p className="admin-acceso-titulo">Reportes y Estadísticas</p>
                                <p className="admin-acceso-desc">Análisis financiero y clínico</p>
                            </div>
                            <span>›</span>
                        </div>
                    </div>
                </div>

                {/* Citas de hoy */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-titulo">CITAS DE HOY</h2>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{stats.citasHoy} programadas</span>
                    </div>
                    {citas.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No hay citas para hoy</p>
                    ) : citas.map(c => (
                        <div key={c.id} className="dash-historial-item">
                            <div className="dash-hist-avatar">{c.pacientes?.nombre?.[0]}</div>
                            <div className="dash-hist-info">
                                <p className="dash-hist-nombre">{c.pacientes?.nombre} {c.pacientes?.apellido}</p>
                                <p className="dash-hist-doctor">Dr. {c.odontologos?.usuarios?.nombre} {c.odontologos?.usuarios?.apellido}</p>
                            </div>
                            <p style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                                {new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            <nav className="dash-mobile-nav">
                <a href="#" className="dash-mobile-item active">🏠<span>Inicio</span></a>
                <a href="#" className="dash-mobile-item">👥<span>Pacientes</span></a>
                <a href="#" className="dash-mobile-item">📊<span>Reportes</span></a>
                <a href="#" className="dash-mobile-item" onClick={cerrarSesion}>↩<span>Salir</span></a>
            </nav>
        </div>
    )
}