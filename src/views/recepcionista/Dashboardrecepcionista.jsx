import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'
import GestionPacientes from "./Gestionpacientes";
import RegistrarPago from "./RegistrarPago";
import AgendarCita from "./Agendarcita";
import './Dashboardrecepcionista.css'

export default function DashboardRecepcionista() {
    const [stats, setStats] = useState({ totalPacientes: 0, citasHoy: 0, pagosHoy: 0 })
    const [vistaActiva, setVistaActiva] = useState('inicio')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchStats = async () => {
            const { count } = await supabase.from('pacientes').select('*', { count: 'exact', head: true })
            const hoy = new Date().toISOString().split('T')[0]
            const { count: citasHoy } = await supabase.from('citas').select('*', { count: 'exact', head: true }).filter('fecha_hora', 'gte', hoy)
            
            setStats({
                totalPacientes: count || 0,
                citasHoy: citasHoy || 0,
                pagosHoy: 0
            })
        }
        fetchStats()
    }, [])

    return (
        <div className="recep-container fade-in">
            <aside className="recep-sidebar">
                <div className="dash-logo">
                    <span className="logo-icon">👩‍💼</span>
                    <span className="logo-text">Recepcion</span>
                </div>
                
                <nav className="recep-nav">
                    <button onClick={() => setVistaActiva('inicio')} className={vistaActiva === 'inicio' ? 'active' : ''}>
                        🏠 Inicio
                    </button>
                    <button onClick={() => setVistaActiva('pacientes')} className={vistaActiva === 'pacientes' ? 'active' : ''}>
                        👥 Pacientes
                    </button>
                    <button onClick={() => setVistaActiva('citas')} className={vistaActiva === 'citas' ? 'active' : ''}>
                        📅 Agenda
                    </button>
                    <button onClick={() => setVistaActiva('pagos')} className={vistaActiva === 'pagos' ? 'active' : ''}>
                        💰 Pagos
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
                    <h1>Módulo de Recepción</h1>
                    <p>Gestiona la agenda y atención de Amerrisque Dental</p>
                </header>

                <div className="dash-content-area">
                    {vistaActiva === 'inicio' && (
                        <div className="admin-stats-grid">
                            <div className="recep-stat-card">
                                <h3>{stats.totalPacientes}</h3>
                                <p>Pacientes Totales</p>
                            </div>
                            <div className="recep-stat-card">
                                <h3 style={{color: '#0ea5e9'}}>{stats.citasHoy}</h3>
                                <p>Citas para Hoy</p>
                            </div>
                            <div className="recep-stat-card">
                                <h3 style={{color: '#10b981'}}>Activo</h3>
                                <p>Estado del Sistema</p>
                            </div>
                        </div>
                    )}

                    {vistaActiva === 'pacientes' && <GestionPacientes />}
                    {vistaActiva === 'citas' && <AgendarCita />}
                    {vistaActiva === 'pagos' && <RegistrarPago />}
                </div>
            </main>
        </div>
    )
}