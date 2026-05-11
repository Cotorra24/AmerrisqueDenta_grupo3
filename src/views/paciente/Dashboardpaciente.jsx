import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import AgendarCita from '../recepcionista/Agendarcita'
import { CatalogoServicios, HistorialClinico, EstadoCuenta } from './PacienteViews'
import './Dashboard.css'

export default function DashboardPaciente() {
    const [usuario, setUsuario] = useState(null)
    const [citas, setCitas] = useState([])
    const [stats, setStats] = useState({ total: 0, completadas: 0, pendientes: 0 })
    const [vista, setVista] = useState('inicio') // inicio | agendar | catalogo | historial | cuenta

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

    useEffect(() => {
        cargar()
    }, [])

    const cerrarSesion = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const proximaCita = citas.find(c => c.estado === 'pendiente' || c.estado === 'confirmada')
    const hoy = new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })

    if (vista === 'agendar') return <AgendarCita rolCreador="paciente" onVolver={() => setVista('inicio')} onExito={() => { setVista('inicio'); cargar(); }} />
    if (vista === 'catalogo') return <CatalogoServicios onVolver={() => setVista('inicio')} />
    if (vista === 'historial') return <HistorialClinico onVolver={() => setVista('inicio')} />
    if (vista === 'cuenta') return <EstadoCuenta onVolver={() => setVista('inicio')} />

    return (
        <div className="dash-layout">
            {/* Sidebar desktop */}
            <aside className="dash-sidebar paciente-sidebar">
                <div className="dash-brand">
                    <div className="dash-brand-icon">🦷</div>
                    <div><p className="dash-brand-name">Amerrisque</p><p className="dash-brand-sub">Dental</p></div>
                </div>
                <nav className="dash-nav">
                    <button onClick={() => setVista('inicio')} className={`dash-nav-item ${vista === 'inicio' ? 'active' : ''}`}>🏠 Inicio</button>
                    <button onClick={() => setVista('agendar')} className={`dash-nav-item ${vista === 'agendar' ? 'active' : ''}`}>📅 Mis Citas</button>
                    <button onClick={() => setVista('historial')} className={`dash-nav-item ${vista === 'historial' ? 'active' : ''}`}>📋 Historia</button>
                    <button onClick={() => setVista('cuenta')} className={`dash-nav-item ${vista === 'cuenta' ? 'active' : ''}`}>💳 Mi Cuenta</button>
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
                            <p className="dash-cita-link" onClick={() => setVista('agendar')}>Toca para ver detalles &rsaquo;</p>
                        </div>
                    </div>
                )}

                {/* Acciones rápidas */}
                <div className="dash-section">
                    <h2 className="dash-section-titulo">ACCIONES RÁPIDAS</h2>
                    <div className="dash-acciones paciente-acciones">
                        <div className="dash-accion azul" onClick={() => setVista('agendar')}>📅<p>Agendar Cita</p></div>
                        <div className="dash-accion verde" onClick={() => setVista('catalogo')}>🦷<p>Catálogo</p></div>
                        <div className="dash-accion morado" onClick={() => setVista('historial')}>📋<p>Mi Historial</p></div>
                        <div className="dash-accion amarillo" onClick={() => setVista('cuenta')}>💳<p>Mi Cuenta</p></div>
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
                        <button onClick={() => setVista('historial')} className="dash-ver-todas">Ver todas</button>
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
                <button onClick={() => setVista('inicio')} className={`dash-mobile-item ${vista === 'inicio' ? 'active' : ''}`}>🏠<span>Inicio</span></button>
                <button onClick={() => setVista('agendar')} className={`dash-mobile-item ${vista === 'agendar' ? 'active' : ''}`}>📅<span>Mis Citas</span></button>
                <button onClick={() => setVista('historial')} className={`dash-mobile-item ${vista === 'historial' ? 'active' : ''}`}>📋<span>Historia</span></button>
                <button onClick={() => setVista('cuenta')} className={`dash-mobile-item ${vista === 'cuenta' ? 'active' : ''}`}>💳<span>Mi Cuenta</span></button>
                <button className="dash-mobile-item" onClick={cerrarSesion}>↩<span>Salir</span></button>
            </nav>
        </div>
    )
}