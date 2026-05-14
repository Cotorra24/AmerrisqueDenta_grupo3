import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Pacientesodontologo.css' // Reutilizamos estilos

export default function HistorialOdontologo({ dentistaId }) {
    const [historiales, setHistoriales] = useState([])
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        if (!dentistaId) return
        const fetchHistoriales = async () => {
            const { data } = await supabase
                .from('historiales_clinicos')
                .select('*, pacientes(nombre, apellido, cedula)')
                .eq('odontologo_id', dentistaId)
                .order('fecha', { ascending: false })
            setHistoriales(data || [])
        }
        fetchHistoriales()
    }, [dentistaId])

    const filtrados = historiales.filter(h => 
        h.pacientes.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        h.pacientes.cedula?.includes(busqueda)
    )

    return (
        <div className="po-container">
            <div className="po-header">
                <input 
                    type="text" 
                    placeholder="Buscar historial por paciente..." 
                    className="po-search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="po-list">
                {filtrados.map(h => (
                    <div key={h.id} className="po-card">
                        <div className="po-card-header">
                            <span className="po-date">{new Date(h.fecha).toLocaleDateString()}</span>
                            <h3>{h.pacientes.nombre} {h.pacientes.apellido}</h3>
                        </div>
                        <div className="po-card-body">
                            <div className="po-diag">
                                <strong>Diagnóstico:</strong>
                                <p>{h.diagnostico}</p>
                            </div>
                            {h.observaciones && (
                                <div className="po-obs">
                                    <strong>Notas:</strong>
                                    <p>{h.observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
