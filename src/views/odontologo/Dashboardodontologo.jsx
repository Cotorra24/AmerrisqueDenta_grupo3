import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import '../paciente/Dashboard.css'

export default function DashboardOdontologo() {
    const [usuario, setUsuario] = useState(null)
    const [odontologo, setOdontologo] = useState(null)
    const [citas, setCitas] = useState([])
    const [stats, setStats] = useState({ citasHoy: 0, completadas: 0, pendientes: 0 })

    useEffect(() => {
        const cargar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: u } = await supabase.from('usuarios').select('nombre, apellido').eq('id', user.id).single()
            setUsuario(u)

            const { data: od } = await supabase.from('odontologos').select('id, especialidad').eq('usuario_id', user.id).single()
            setOdontologo(od)
            if (!od) return

            const hoy = new Date().toISOString().split('T')[0]
            const { data: citasData } = await supabase
                .from('citas')
                .select('*, pacientes(nombre, apellido), servicios(nombre)')
                .eq('odontologo_id', od.id)
                .gte('fecha_hora', hoy + 'T00:00:00')
                .lte('fecha_hora', hoy + 'T23:59:59')
                .order('fecha_hora', { ascending: true })

            setCitas(citasData || [])
            setStats({
                citasHoy: citasData?.length || 0,
                completadas: citasData?.filter(c => c.estado === 'completada').length || 0,
                pendientes: citasData?.filter(c => c.estado === 'pendiente').length || 0,
            })
        }
        cargar()
    }, [])

    const cerrarSesion = async () => { await supabase.auth.signOut(); window.location.href = '/' }
    const hoy = new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const proximoPaciente = citas[0]

    return (
        <div className="dash-layout">
            <aside className="dash-sidebar doctor-sidebar">
                <div className="dash-brand">
                    <div className="dash-brand-icon">🦷</div>
                    <div><p className="dash-brand-name">Amerrisque</p><p className="dash-brand-sub">Dental</p></div>
                </div>
                <nav className="dash-nav">
                    <a href="#" className="dash-nav-item active">🏠 Inicio</a>
                    <a href="#" className="dash-nav-item">👥 Pacientes</a>
                    <a href="#" className="dash-nav-item">📅 Mis Citas</a>
                    <a href="#" className="dash-nav-item">📋 Historial</a>
                </nav>
                <button onClick={cerrarSesion} className="dash-salir">↩ Cerrar Sesión</button>
            </aside>

            <main className="dash-main">
                <div className="dash-header doctor-header">
                    <div>
                        <p className="dash-fecha">{hoy}</p>
                        <h1 className="dash-saludo">Bienvenido, Dr. {usuario?.nombre} {usuario?.apellido}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>{odontologo?.especialidad}</p>
                    </div>
                    <div className="dash-bell">🔔<span className="dash-bell-badge">2</span></div>
                </div>

                <div className="dash-stats-top">
                    <div className="dash-stat-top azul">
                        <span>📅</span><p className="dash-stat-top-num">{stats.citasHoy}</p><p>Citas hoy</p>
                    </div>
                    <div className="dash-stat-top gris">
                        <span>✅</span><p className="dash-stat-top-num">{stats.completadas}</p><p>Completadas</p>
                    </div>
                    <div className="dash-stat-top gris">
                        <span>⏰</span><p className="dash-stat-top-num">{stats.pendientes}</p><p>Pendientes</p>
                    </div>
                </div>

                {proximoPaciente && (
                    <div className="dash-section">
                        <h2 className="dash-section-titulo">PRÓXIMO PACIENTE</h2>
                        <div className="dash-proxima-cita doctor-proxima">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="dash-hist-avatar grande">{proximoPaciente.pacientes?.nombre?.[0]}</div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>{proximoPaciente.pacientes?.nombre} {proximoPaciente.pacientes?.apellido}</h3>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{proximoPaciente.servicios?.nombre}</p>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                                        ⏰ {new Date(proximoPaciente.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {proximoPaciente.notas && ` · ${proximoPaciente.notas.substring(0, 30)}...`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="dash-section">
                    <h2 className="dash-section-titulo">ACCIONES RÁPIDAS</h2>
                    <div className="dash-acciones-recep">
                        <div className="dash-accion-recep azul-claro">👥 Ver Pacientes</div>
                        <div className="dash-accion-recep verde-claro">📋 Registrar Consulta</div>
                        <div className="dash-accion-recep amarillo-claro">📅 Mis Citas</div>
                        <div className="dash-accion-recep morado-claro">📈 Ver Historiales</div>
                    </div>
                </div>

                <div className="dash-section">
                    <div className="dash-section-header">
                        <h2 className="dash-section-titulo">MIS CITAS DE HOY</h2>
                        <a href="#" className="dash-ver-todas">Ver todas</a>
                    </div>
                    {citas.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No tienes citas para hoy</p>
                    ) : citas.map(c => (
                        <div key={c.id} className="dash-historial-item">
                            <div className="dash-hist-avatar">{c.pacientes?.nombre?.[0]}{c.pacientes?.apellido?.[0]}</div>
                            <div className="dash-hist-info">
                                <p className="dash-hist-nombre">{c.pacientes?.nombre} {c.pacientes?.apellido}</p>
                                <p className="dash-hist-fecha">{c.servicios?.nombre}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                                    {new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <span className={`dash-badge ${c.estado}`}>{c.estado}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <nav className="dash-mobile-nav">
                <a href="#" className="dash-mobile-item active">🏠<span>Inicio</span></a>
                <a href="#" className="dash-mobile-item">👥<span>Pacientes</span></a>
                <a href="#" className="dash-mobile-item">📅<span>Mis Citas</span></a>
                <a href="#" className="dash-mobile-item">📋<span>Historial</span></a>
                <a href="#" className="dash-mobile-item" onClick={cerrarSesion}>↩<span>Salir</span></a>
            </nav>
        </div>
    )
}