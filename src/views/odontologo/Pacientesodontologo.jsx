import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Pacientesodontologo.css'

export default function PacientesOdontologo({ dentistaId }) {
    const [pacientes, setPacientes] = useState([])
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        if (!dentistaId) return
        const fetchPacientes = async () => {
            // Obtenemos los pacientes que tienen al menos una cita con este doctor
            const { data } = await supabase
                .from('citas')
                .select('pacientes(*)')
                .eq('odontologo_id', dentistaId)
            
            // Filtrar duplicados de pacientes
            const listaUnica = []
            const idsVistos = new Set()
            
            data?.forEach(item => {
                if (item.pacientes && !idsVistos.has(item.pacientes.id)) {
                    idsVistos.add(item.pacientes.id)
                    listaUnica.push(item.pacientes)
                }
            })

            setPacientes(listaUnica)
        }
        fetchPacientes()
    }, [dentistaId])

    const filtrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.cedula?.includes(busqueda)
    )

    return (
        <div className="po-container">
            <div className="po-header">
                <input 
                    type="text" 
                    placeholder="Buscar entre mis pacientes..." 
                    className="po-search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="po-list">
                {filtrados.length > 0 ? filtrados.map(p => (
                    <div key={p.id} className="po-card">
                        <div className="po-avatar-big">{p.nombre[0]}</div>
                        <h3>{p.nombre} {p.apellido}</h3>
                        <p className="po-cedula">{p.cedula}</p>
                        <div className="po-meta">
                            <span>📞 {p.telefono || 'Sin tel'}</span>
                            <span>📧 {p.email || 'Sin email'}</span>
                        </div>
                    </div>
                )) : <p className="no-data">No se encontraron pacientes vinculados.</p>}
            </div>
        </div>
    )
}