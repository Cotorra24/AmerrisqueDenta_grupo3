import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'
import PacientesOdontologo from "./Pacientesodontologo";
import HistorialOdontologo from "./Historialodontologo";
import MisCitasOdontologo from "./Miscitasodontologo";
import './Dashboardodontologo.css'

export default function DashboardOdontologo() {
    const [doctor, setDoctor] = useState(null)
    const [vistaActiva, setVistaActiva] = useState('inicio')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDoc = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
                setDoctor(data)
            }
        }
        fetchDoc()
    }, [])

    return (
        <div className="doc-container fade-in">
            <aside className="doc-sidebar">
                <div className="doc-profile">
                    <div className="doc-avatar">🩺</div>
                    <h3 className="logo-text" style={{fontSize: '1.2rem'}}>Dr. {doctor?.nombre}</h3>
                    <span className="doc-stat-pill">Odontólogo</span>
                </div>
                
                <nav className="doc-nav">
                    <button onClick={() => setVistaActiva('inicio')} className={vistaActiva === 'inicio' ? 'active' : ''}>
                        📅 Mis Citas
                    </button>
                    <button onClick={() => setVistaActiva('pacientes')} className={vistaActiva === 'pacientes' ? 'active' : ''}>
                        👥 Mis Pacientes
                    </button>
                    <button onClick={() => setVistaActiva('historial')} className={vistaActiva === 'historial' ? 'active' : ''}>
                        📂 Historiales
                    </button>
                </nav>

                <div className="admin-sidebar-footer" style={{marginTop: 'auto'}}>
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
                    <h1>Agenda Médica</h1>
                    <p>Gestiona tus consultas y expedientes de hoy</p>
                </header>

                <div className="dash-content-area">
                    {vistaActiva === 'inicio' && <MisCitasOdontologo />}
                    {vistaActiva === 'pacientes' && <PacientesOdontologo />}
                    {vistaActiva === 'historial' && <HistorialOdontologo />}
                </div>
            </main>
        </div>
    )
}