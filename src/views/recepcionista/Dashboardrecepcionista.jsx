import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import '../paciente/Dashboard.css'

export default function DashboardRecepcionista() {
    const [usuario, setUsuario] = useState(null)
    const [citas, setCitas] = useState([])
    const [stats, setStats] = useState({ citasHoy: 0, pendientes: 0, cobradoHoy: 0 })

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: u } = await supabase.from('usuarios').select('nombre').eq('id', user.id).single()
            setUsuario(u)

            const hoy = new Date().toISOString().split('T')[0]
            const { data: citasData } = await supabase
                .from('citas')
                .select('*, pacientes(nombre, apellido), servicios(nombre, costo), odontologos(usuarios(nombre,apellido))')
                .gte('fecha_hora', hoy + 'T00:00:00')
                .lte('fecha_hora', hoy + 'T23:59:59')
                .order('fecha_hora', { ascending: true })

            setCitas(citasData || [])

            const { data: pagosHoy } = await supabase
                .from('pagos').select('monto').gte('fecha_pago', hoy).lte('fecha_pago', hoy)

            setStats({
                citasHoy: citasData?.length || 0,
                pendientes: citasData?.filter(c => c.estado === 'pendiente').length || 0,
                cobradoHoy: pagosHoy?.reduce((s, p) => s + Number(p.monto), 0) || 0,
            })
        }
        cargar()
    }, [])

    const cerrarSesion = async () => { await supabase.auth.signOut(); window.location.href = '/' }
    const hoy = new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="dash-layout">
            <aside className="dash-sidebar recep-sidebar">
                <div className="dash-brand">
                    <div className="dash-brand-icon">🦷</div>
                    <div><p className="dash-brand-name">Amerrisque</p><p className="dash-brand-sub">Dental</p></div>
                </div>
                <nav className="dash-nav">
                    <a href="#" className="dash-nav-item active">🏠 Inicio</a>
                    <a href="#" className="dash-nav-item">👥 Pacientes</a>
                    <a href="#" className="dash-nav-item">📅 Agenda</a>
                    <a href="#" className="dash-nav-item">💳 Pagos</a>
                </nav>
                <button onClick={cerrarSesion} className="dash-salir">↩ Cerrar Sesión</button>
            </aside>

            <main className="dash-main">
                <div className="dash-header recep-header">
                    <div>
                        <p className="dash-fecha">{hoy}</p>
                        <h1 className="dash-saludo">¡Buenos días, {usuario?.nombre}!</h1>
                    </div>
                    <div className="dash-bell">🔔<span className="dash-bell-badge">3</span></div>
                </div>

                {/* Stats rápidos */}
                <div className="dash-stats-top">
                    <div className="dash-stat-top azul">
                        <span>📅</span><p className="dash-stat-top-num">{stats.citasHoy}</p><p>Citas hoy</p>
                    </div>
                    <div className="dash-stat-top gris">
                        <span>⏰</span><p className="dash-stat-top-num">{stats.pendientes}</p><p>Pendientes</p>
                    </div>
                    <div className="dash-stat-top gris">
                        <span>📈</span><p className="dash-stat-top-num">C${(stats.cobradoHoy / 1000).toFixed(1)}k</p><p>Cobrado hoy</p>
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div className="dash-section">
                    <h2 className="dash-section-titulo">ACCIONES RÁPIDAS</h2>
                    <div className="dash-acciones-recep">
                        <div className="dash-accion-recep azul-claro">👤+ Registrar Paciente</div>
                        <div className="dash-accion-recep verde-claro">📅 Agendar Cita</div>
                        <div className="dash-accion-recep amarillo-claro">💳 Registrar Pago</div>
                        <div className="dash-accion-recep morado-claro">👥 Ver Pacientes</div>
                    </div>
                </div>

                {/* Agenda de hoy */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-titulo">AGENDA DE HOY</h2>
                        <a href="#" className="dash-ver-todas">Ver agenda completa</a>
                    </div>
                    {citas.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No hay citas programadas para hoy</p>
                    ) : citas.map(c => (
                        <div key={c.id} className="dash-historial-item">
                            <div className="dash-hist-avatar">{c.pacientes?.nombre?.[0]}{c.pacientes?.apellido?.[0]}</div>
                            <div className="dash-hist-info">
                                <p className="dash-hist-nombre">{c.pacientes?.nombre} {c.pacientes?.apellido}</p>
                                <p className="dash-hist-fecha">{c.servicios?.nombre}</p>
                                <p className="dash-hist-doctor">{new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Dr. {c.odontologos?.usuarios?.nombre} {c.odontologos?.usuarios?.apellido}</p>
                            </div>
                            <span className={`dash-badge ${c.estado}`}>{c.estado}</span>
                        </div>
                    ))}
                </div>

                {/* Pagos del día */}
                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-titulo">PAGOS DE HOY</h2>
                        <a href="#" className="dash-ver-todas">Ver todos</a>
                    </div>
                    <div className="dash-pagos-card">
                        <p className="dash-pagos-label">💵 Ingresos del día</p>
                        <p className="dash-pagos-monto">C$ {stats.cobradoHoy.toLocaleString()}</p>
                    </div>
                </div>
            </main>

            <nav className="dash-mobile-nav">
                <a href="#" className="dash-mobile-item active">🏠<span>Inicio</span></a>
                <a href="#" className="dash-mobile-item">👥<span>Pacientes</span></a>
                <a href="#" className="dash-mobile-item">📅<span>Agenda</span></a>
                <a href="#" className="dash-mobile-item">💳<span>Pagos</span></a>
                <a href="#" className="dash-mobile-item" onClick={cerrarSesion}>↩<span>Salir</span></a>
            </nav>
        </div>
    )
}