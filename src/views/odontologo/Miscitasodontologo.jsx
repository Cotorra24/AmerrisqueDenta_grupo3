import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import RegistrarConsulta from './Registrarconsulta'
import './Miscitasodontologo.css'

export default function MisCitasOdontologo({ dentistaId }) {
    const [citas, setCitas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [citaSeleccionada, setCitaSeleccionada] = useState(null)

    const fetchCitas = async () => {
        if (!dentistaId) return
        const hoy = new Date().toISOString().split('T')[0]
        const { data } = await supabase
            .from('citas')
            .select('*, pacientes(nombre, apellido, cedula, telefono), servicios(nombre)')
            .eq('odontologo_id', dentistaId)
            .gte('fecha_hora', hoy)
            .order('fecha_hora', { ascending: true })
        
        setCitas(data || [])
        setCargando(false)
    }

    useEffect(() => {
        fetchCitas()
    }, [dentistaId])

    const actualizarEstado = async (id, nuevoEstado) => {
        const { error } = await supabase.from('citas').update({ estado: nuevoEstado }).eq('id', id)
        if (!error) fetchCitas()
    }

    if (citaSeleccionada) {
        return (
            <RegistrarConsulta 
                cita={citaSeleccionada} 
                dentistaId={dentistaId}
                onVolver={() => setCitaSeleccionada(null)} 
                onExito={() => { setCitaSeleccionada(null); fetchCitas() }}
            />
        )
    }

    return (
        <div className="mco-container">
            <div className="mco-agenda">
                {citas.length > 0 ? citas.map(c => (
                    <div key={c.id} className={`mco-cita-card ${c.estado}`}>
                        <div className="mco-cita-hora">
                            {new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="mco-cita-linea"></div>
                        <div className="mco-cita-detalles">
                            <h4>{c.pacientes.nombre} {c.pacientes.apellido}</h4>
                            <p className="mco-servicio">{c.servicios?.nombre}</p>
                            <p className="mco-motivo">"{c.motivo}"</p>
                            
                            <div className="mco-acciones">
                                {c.estado === 'pendiente' && (
                                    <>
                                        <button className="btn-atender" onClick={() => setCitaSeleccionada(c)}>Atender</button>
                                        <button className="btn-no-asistio" onClick={() => actualizarEstado(c.id, 'cancelada')}>No asistió</button>
                                    </>
                                )}
                                {c.estado === 'completada' && <span className="mco-badge completada">Completada</span>}
                                {c.estado === 'cancelada' && <span className="mco-badge cancelada">Cancelada</span>}
                            </div>
                        </div>
                    </div>
                )) : <p className="no-data">No hay citas para hoy.</p>}
            </div>
        </div>
    )
}