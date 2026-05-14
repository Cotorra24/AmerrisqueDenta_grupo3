import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'
import GestionUsuarios from './GestionUsuarios'
import GestionServicios from './GestionServicios'
import './Dashboardadmin.css'

export default function DashboardAdmin() {
    const [stats, setStats] = useState({ usuarios: 0, servicios: 0, citas: 0, ingresos: 0 })
    const [vistaActiva, setVistaActiva] = useState('inicio')
    const [cargando, setCargando] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchStats = async () => {
            const { count: userCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
            const { count: servCount } = await supabase.from('servicios').select('*', { count: 'exact', head: true })
            const { data: pagos } = await supabase.from('pagos').select('monto')
            
            const totalIngresos = pagos?.reduce((acc, p) => acc + p.monto, 0) || 0

            setStats({
                usuarios: userCount || 0,
                servicios: servCount || 0,
                ingresos: totalIngresos
            })
            setCargando(false)
        }
        fetchStats()
    }, [])

    return (
        <div className="admin-container fade-in">
            <aside className="admin-sidebar">
                <div className="dash-logo">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text">AdminPanel</span>
                </div>
                
                <nav className="admin-nav">
                    <button onClick={() => setVistaActiva('inicio')} className={vistaActiva === 'inicio' ? 'active' : ''}>
                        📊 Estadísticas
                    </button>
                    <button onClick={() => setVistaActiva('usuarios')} className={vistaActiva === 'usuarios' ? 'active' : ''}>
                        👥 Personal
                    </button>
                    <button onClick={() => setVistaActiva('servicios')} className={vistaActiva === 'servicios' ? 'active' : ''}>
                        🦷 Servicios
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
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
                    <h1>Panel de Control Maestro</h1>
                    <p>Bienvenido al centro de gestión de Amerrisque Dental</p>
                </header>

                <div className="dash-content-area">
                    {vistaActiva === 'inicio' && (
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="stat-icon" style={{background: '#eff6ff', color: '#2563eb'}}>👥</div>
                                <div className="stat-data">
                                    <span className="stat-val">{stats.usuarios}</span>
                                    <p>Usuarios Registrados</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon" style={{background: '#f0fdf4', color: '#16a34a'}}>💰</div>
                                <div className="stat-data">
                                    <span className="stat-val">C$ {stats.ingresos.toLocaleString()}</span>
                                    <p>Ingresos Totales</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon" style={{background: '#fff7ed', color: '#ea580c'}}>🦷</div>
                                <div className="stat-data">
                                    <span className="stat-val">{stats.servicios}</span>
                                    <p>Servicios Activos</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {vistaActiva === 'usuarios' && <GestionUsuarios />}
                    {vistaActiva === 'servicios' && <GestionServicios />}
                </div>
            </main>
        </div>
    )
}