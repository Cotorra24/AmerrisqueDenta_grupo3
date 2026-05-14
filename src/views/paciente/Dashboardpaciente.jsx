import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'
import { CatalogoServicios, HistorialClinico, EstadoCuenta } from './PacienteViews'
import './Dashboard.css'

export default function DashboardPaciente() {
    const [paciente, setPaciente] = useState(null)
    const [proximaCita, setProximaCita] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [vistaActiva, setVistaActiva] = useState('inicio')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDatos = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: pac } = await supabase.from('pacientes').select('*').eq('usuario_id', user.id).single()
            
            if (pac) {
                setPaciente(pac)
                const { data: citas } = await supabase
                    .from('citas')
                    .select('*, odontologos(usuarios(nombre, apellido)), servicios(nombre)')
                    .eq('paciente_id', pac.id)
                    .eq('estado', 'pendiente')
                    .gte('fecha_hora', new Date().toISOString())
                    .order('fecha_hora', { ascending: true })
                    .limit(1)
                
                if (citas && citas.length > 0) setProximaCita(citas[0])
            }
            setCargando(false)
        }
        fetchDatos()
    }, [])

    if (cargando) return (
        <div className="dash-loading-screen">
            <div className="spinner-dental"></div>
            <p>Cargando tu sonrisa...</p>
        </div>
    )

    return (
        <div className="dash-container">
            <aside className="dash-sidebar">
                <div className="dash-logo">
                    <span className="logo-icon">🦷</span>
                    <span className="logo-text">Amerrisque</span>
                </div>
                <nav className="dash-nav">
                    <button onClick={() => setVistaActiva('inicio')} className={vistaActiva === 'inicio' ? 'active' : ''}>
                        <span className="icon">🏠</span> Inicio
                    </button>
                    <button onClick={() => setVistaActiva('catalogo')} className={vistaActiva === 'catalogo' ? 'active' : ''}>
                        <span className="icon">📖</span> Catálogo
                    </button>
                    <button onClick={() => setVistaActiva('historial')} className={vistaActiva === 'historial' ? 'active' : ''}>
                        <span className="icon">📂</span> Mi Historial
                    </button>
                    <button onClick={() => setVistaActiva('pagos')} className={vistaActiva === 'pagos' ? 'active' : ''}>
                        <span className="icon">💰</span> Mis Pagos
                    </button>
                </nav>
                <div className="dash-sidebar-footer">
                    <button className="btn-logout-sidebar" onClick={async () => {
                        await supabase.auth.signOut()
                        navigate('/', { replace: true })
                    }}>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="dash-main">
                <header className="dash-header">
                    <div className="header-user">
                        <h1>Hola, {paciente?.nombre || 'Paciente'}</h1>
                        <p>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                </header>

                <div className="dash-content-area">
                    {vistaActiva === 'inicio' && (
                        <div className="dash-welcome-grid">
                            <div className="welcome-hero">
                                <h2>¡Qué bueno verte hoy! ✨</h2>
                                <p>Recuerda que una sonrisa sana es tu mejor carta de presentación.</p>
                                <button className="btn-hero-action" onClick={() => setVistaActiva('catalogo')}>Ver nuevos tratamientos</button>
                            </div>

                            <div className="next-appointment-card">
                                <h3>Próxima Cita</h3>
                                {proximaCita ? (
                                    <div className="cita-details-glass">
                                        <div className="cita-date">
                                            <span className="day">{new Date(proximaCita.fecha_hora).getDate()}</span>
                                            <span className="month">{new Date(proximaCita.fecha_hora).toLocaleString('es-ES', { month: 'short' }).toUpperCase()}</span>
                                        </div>
                                        <div className="cita-info">
                                            <p className="doctor">Dr/a. {proximaCita.odontologos?.usuarios?.nombre || 'Por asignar'}</p>
                                            <p className="service">{proximaCita.servicios?.nombre || 'General'}</p>
                                            <p className="time">⏰ {new Date(proximaCita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-cita-placeholder">
                                        <p>No tienes citas pendientes.</p>
                                        <button className="btn-agendar-now">Agendar ahora</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {vistaActiva === 'catalogo' && <CatalogoServicios />}
                    {vistaActiva === 'historial' && <HistorialClinico pacienteId={paciente?.id} />}
                    {vistaActiva === 'pagos' && <EstadoCuenta pacienteId={paciente?.id} />}
                </div>
            </main>
        </div>
    )
}