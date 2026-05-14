import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Agendarcita.css'

export default function AgendarCita({ onExito }) {
    const [paso, setPaso] = useState(1)
    const [pacientes, setPacientes] = useState([])
    const [odontologos, setOdontologos] = useState([])
    const [servicios, setServicios] = useState([])
    const [busquedaPac, setBusquedaPac] = useState('')
    
    // Formulario
    const [seleccion, setSeleccion] = useState({
        paciente_id: null,
        odontologo_id: null,
        servicio_id: null,
        fecha: '',
        hora: '',
        motivo: ''
    })

    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        const fetchDatos = async () => {
            const { data: pacs } = await supabase.from('pacientes').select('*').eq('activo', true)
            const { data: ods } = await supabase.from('odontologos').select('*, usuarios(nombre, apellido)')
            const { data: servs } = await supabase.from('servicios').select('*').eq('activo', true)
            setPacientes(pacs || [])
            setOdontologos(ods || [])
            setServicios(servs || [])
        }
        fetchDatos()
    }, [])

    const handleAgendar = async () => {
        setCargando(true)
        const fechaHora = `${seleccion.fecha}T${seleccion.hora}:00`
        
        const { error } = await supabase.from('citas').insert([{
            paciente_id: seleccion.paciente_id,
            odontologo_id: seleccion.odontologo_id,
            servicio_id: seleccion.servicio_id,
            fecha_hora: fechaHora,
            motivo: seleccion.motivo,
            estado: 'pendiente'
        }])

        if (error) {
            alert('Error al agendar: ' + error.message)
        } else {
            alert('Cita agendada con éxito')
            onExito()
        }
        setCargando(false)
    }

    const pacFiltrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(busquedaPac.toLowerCase()) || 
        p.cedula?.includes(busquedaPac)
    )

    return (
        <div className="agendar-container">
            <div className="agendar-steps">
                <div className={`step ${paso >= 1 ? 'active' : ''}`}>1. Paciente</div>
                <div className={`step ${paso >= 2 ? 'active' : ''}`}>2. Doctor</div>
                <div className={`step ${paso >= 3 ? 'active' : ''}`}>3. Fecha</div>
                <div className={`step ${paso >= 4 ? 'active' : ''}`}>4. Confirmar</div>
            </div>

            <div className="agendar-form">
                {paso === 1 && (
                    <div className="step-content">
                        <h3>Seleccionar Paciente</h3>
                        <input 
                            type="text" 
                            className="step-search" 
                            placeholder="Buscar por nombre o cédula..." 
                            value={busquedaPac}
                            onChange={(e) => setBusquedaPac(e.target.value)}
                        />
                        <div className="step-list">
                            {pacFiltrados.map(p => (
                                <div 
                                    key={p.id} 
                                    className={`step-item ${seleccion.paciente_id === p.id ? 'selected' : ''}`}
                                    onClick={() => setSeleccion({...seleccion, paciente_id: p.id})}
                                >
                                    <strong>{p.nombre} {p.apellido}</strong>
                                    <span>{p.cedula || 'Sin cédula'}</span>
                                </div>
                            ))}
                        </div>
                        <button disabled={!seleccion.paciente_id} onClick={() => setPaso(2)} className="step-next">Siguiente</button>
                    </div>
                )}

                {paso === 2 && (
                    <div className="step-content">
                        <h3>Seleccionar Odontólogo y Servicio</h3>
                        <label>Odontólogo:</label>
                        <select 
                            value={seleccion.odontologo_id || ''} 
                            onChange={(e) => setSeleccion({...seleccion, odontologo_id: parseInt(e.target.value)})}
                        >
                            <option value="">Seleccione un doctor...</option>
                            {odontologos.map(o => (
                                <option key={o.id} value={o.id}>{o.usuarios.nombre} {o.usuarios.apellido} - {o.especialidad}</option>
                            ))}
                        </select>

                        <label>Servicio:</label>
                        <select 
                            value={seleccion.servicio_id || ''} 
                            onChange={(e) => setSeleccion({...seleccion, servicio_id: parseInt(e.target.value)})}
                        >
                            <option value="">Seleccione un servicio...</option>
                            {servicios.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} (C$ {s.costo})</option>
                            ))}
                        </select>
                        <div className="step-btns">
                            <button onClick={() => setPaso(1)}>Atrás</button>
                            <button disabled={!seleccion.odontologo_id || !seleccion.servicio_id} onClick={() => setPaso(3)}>Siguiente</button>
                        </div>
                    </div>
                )}

                {paso === 3 && (
                    <div className="step-content">
                        <h3>Fecha y Hora</h3>
                        <label>Fecha:</label>
                        <input type="date" value={seleccion.fecha} onChange={(e) => setSeleccion({...seleccion, fecha: e.target.value})} />
                        <label>Hora:</label>
                        <input type="time" value={seleccion.hora} onChange={(e) => setSeleccion({...seleccion, hora: e.target.value})} />
                        <label>Motivo de consulta:</label>
                        <textarea value={seleccion.motivo} onChange={(e) => setSeleccion({...seleccion, motivo: e.target.value})} />
                        <div className="step-btns">
                            <button onClick={() => setPaso(2)}>Atrás</button>
                            <button disabled={!seleccion.fecha || !seleccion.hora} onClick={() => setPaso(4)}>Siguiente</button>
                        </div>
                    </div>
                )}

                {paso === 4 && (
                    <div className="step-content confirm">
                        <h3>Confirmar Cita</h3>
                        <div className="confirm-details">
                            <p><strong>Paciente:</strong> {pacientes.find(p => p.id === seleccion.paciente_id)?.nombre}</p>
                            <p><strong>Doctor:</strong> {odontologos.find(o => o.id === seleccion.odontologo_id)?.usuarios.nombre}</p>
                            <p><strong>Servicio:</strong> {servicios.find(s => s.id === seleccion.servicio_id)?.nombre}</p>
                            <p><strong>Fecha:</strong> {seleccion.fecha} a las {seleccion.hora}</p>
                        </div>
                        <div className="step-btns">
                            <button onClick={() => setPaso(3)}>Atrás</button>
                            <button onClick={handleAgendar} disabled={cargando} className="btn-final">
                                {cargando ? 'Agendando...' : 'Confirmar y Agendar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}