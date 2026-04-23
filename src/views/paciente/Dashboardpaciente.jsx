import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Dashboard.css'

export default function DashboardPaciente() {
    const [usuario, setUsuario] = useState(null)
    const [citas, setCitas] = useState([])
    const [stats, setStats] = useState({ total: 0, completadas: 0, pendientes: 0 })

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: u } = await supabase
                .from('usuarios').select('nombre, apellido').eq('id', user.id).single()
            setUsuario(u)

            const { data: paciente } = await supabase
                .from('pacientes').select('id').eq('usuario_id', user.id).single()
            if (!paciente) return

            const { data: citasData } = await supabase
                .from('citas')
                .select('*, servicios(nombre), odontologos(especialidad, usuarios(nombre,apellido))')
                .eq('paciente_id', paciente.id)
                .order('fecha_hora', { ascending: true })

            setCitas(citasData || [])
            setStats({
                total: citasData?.length || 0,
                completadas: citasData?.filter(c => c.estado === 'completada').length || 0,
                pendientes: citasData?.filter(c => c.estado === 'pendiente').length || 0,
            })
        }
        cargar()
    }, [])

    const cerrarSesion = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const proximaCita = citas.find(c => c.estado === 'pendiente' || c.estado === 'confirmada')
    const hoy = new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
        <div className="dash-layout">
            {/* Sidebar desktop */}
            <aside className="dash-sidebar paciente-sidebar">
                <div className="dash-brand">
                    <div className="dash-brand-icon">🦷</div>
                    <div><p className="dash-brand-name">Amerrisque</p><p className="dash-brand-sub">Dental</p></div>
                </div>
                <nav className="dash-nav">
                    <a href="#" className="dash-nav-item active">🏠 Inicio</a>
                    <a href="#" className="dash-nav-item">📅 Mis Citas</a>
                    <a href="#" className="dash-nav-item">📋 Historia</a>
                    <a href="#" className="dash-nav-item">💳 Mi Cuenta</a>
                </nav>
                <button onClick={cerrarSesion} className="dash-salir">↩ Cerrar Sesión</button>
            </aside>

            {/* Contenido */}
            <main className="dash-main">
                {/* Header */}
                <div className="dash-header paciente-header">
                    <div>
                        <p className="dash-fecha">{hoy}</p>
                        <h1 className="dash-saludo">¡Hola, {usuario?.nombre}! 👋</h1>
                    </div>
                    <div className="dash-bell">🔔<span className="dash-bell-badge">2</span></div>
                </div>

                {/* Card paciente activo */}
                <div className="dash-paciente-card">
                    <div className="dash-paciente-icon">🦷</div>
                    <div>
                        <p className="dash-paciente-label">Paciente activo</p>
                        <p className="dash-paciente-nombre">{usuario?.nombre} {usuario?.apellido}</p>
                    </div>
                    <div className="dash-paciente-rating">⭐ 4.9</div>
                </div>

                {/* Próxima cita */}
                {proximaCita && (
                    <div className="dash-section">
                        <h2 className="dash-section-titulo">PRÓXIMA CITA</h2>
                        <div className="dash-proxima-cita">
                            <span className="dash-cita-badge">{proximaCita.servicios?.nombre || 'Consulta'}</span>
                            <div className="dash-cita-top">
                                <h3>Dr. {proximaCita.odontologos?.usuarios?.nombre} {proximaCita.odontologos?.usuarios?.apellido}</h3>
                                <span className="dash-cita-cal">📅</span>
                            </div>
                            <div className="dash-cita-info">
                                <span>📅 {new Date(proximaCita.fecha_hora).toLocaleDateString()}</span>
                                <span>⏰ {new Date(proximaCita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="dash-cita-link">Toca para ver detalles &rsaquo;</p>
                        </div>
                    </div>
                )}

                {/* Acciones rápidas */}
                <div className="dash-section">
                    <h2 className="dash-section-titulo">ACCIONES RÁPIDAS</h2>
                    <div className="dash-acciones paciente-acciones">
                        <div className="dash-accion azul">📅<p>Agendar Cita</p></div>
                        <div className="dash-accion verde">📅<p>Mis Citas</p></div>
                        <div className="dash-accion morado">📋<p>Mi Historial</p></div>
                        <div className="dash-accion amarillo">💳<p>Mi Cuenta</p></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="dash-stats">
                    <div className="dash-stat"><span className="dash-stat-num">{stats.total}</span><p>Mis citas</p></div>
                    <div className="dash-stat"><span className="dash-stat-num">{stats.completadas}</span><p>Completadas</p></div>
                    <div className="dash-stat"><span className="dash-stat-num">{stats.pendientes}</span><p>Pendientes</p></div>
                </div>

                {/* Historial reciente */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-titulo">HISTORIAL RECIENTE</h2>
                        <a href="#" className="dash-ver-todas">Ver todas</a>
                    </div>
                    {citas.slice(0, 3).map(c => (
                        <div key={c.id} className="dash-historial-item">
                            <span className="dash-hist-icon">🕐</span>
                            <div className="dash-hist-info">
                                <p className="dash-hist-nombre">{c.servicios?.nombre || 'Consulta'}</p>
                                <p className="dash-hist-fecha">{new Date(c.fecha_hora).toLocaleDateString()}</p>
                            </div>
                            <span className={`dash-badge ${c.estado}`}>{c.estado}</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* Nav móvil */}
            <nav className="dash-mobile-nav">
                <a href="#" className="dash-mobile-item active">🏠<span>Inicio</span></a>
                <a href="#" className="dash-mobile-item">📅<span>Mis Citas</span></a>
                <a href="#" className="dash-mobile-item">📋<span>Historia</span></a>
                <a href="#" className="dash-mobile-item">💳<span>Mi Cuenta</span></a>
                <a href="#" className="dash-mobile-item" onClick={cerrarSesion}>↩<span>Salir</span></a>
            </nav>
        </div>
    )
}