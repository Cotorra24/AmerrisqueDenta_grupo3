import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'

export default function RegistrarConsulta({ cita, dentistaId, onVolver, onExito }) {
    const [diagnostico, setDiagnostico] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [servicios, setServicios] = useState([])
    const [servicioRealizado, setServicioRealizado] = useState(cita.servicio_id || '')
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        const fetchServicios = async () => {
            const { data } = await supabase.from('servicios').select('*').eq('activo', true)
            setServicios(data || [])
        }
        fetchServicios()
    }, [])

    const handleGuardar = async (e) => {
        e.preventDefault()
        setCargando(true)

        // 1. Crear el historial clínico
        const { data: historial, error: errHist } = await supabase
            .from('historiales_clinicos')
            .insert([{
                paciente_id: cita.paciente_id,
                odontologo_id: dentistaId,
                cita_id: cita.id,
                fecha: new Date().toISOString().split('T')[0],
                diagnostico: diagnostico,
                observaciones: observaciones
            }])
            .select()
            .single()

        if (errHist) {
            alert('Error al guardar historial: ' + errHist.message)
            setCargando(false)
            return
        }

        // 2. Registrar el tratamiento realizado (vínculo para pagos)
        const serv = servicios.find(s => s.id === parseInt(servicioRealizado))
        if (serv) {
            await supabase.from('tratamientos').insert([{
                historial_id: historial.id,
                servicio_id: serv.id,
                descripcion: serv.nombre,
                costo: serv.costo,
                estado: 'completado'
            }])
        }

        // 3. Marcar la cita como completada
        await supabase
            .from('citas')
            .update({ estado: 'completada' })
            .eq('id', cita.id)

        alert('Consulta y tratamiento registrados con éxito')
        onExito()
    }

    return (
        <div className="rc-container">
            <button className="rc-volver" onClick={onVolver}>← Volver a la agenda</button>
            <div className="rc-card">
                <h2>Registrar Consulta y Tratamiento</h2>
                <div className="rc-paciente-mini">
                    <strong>Paciente:</strong> {cita.pacientes.nombre} {cita.pacientes.apellido}
                </div>

                <form onSubmit={handleGuardar} className="rc-form">
                    <label>Servicio Realizado:</label>
                    <select 
                        value={servicioRealizado} 
                        onChange={(e) => setServicioRealizado(e.target.value)}
                        required
                    >
                        <option value="">Seleccione el tratamiento realizado...</option>
                        {servicios.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre} - C$ {s.costo}</option>
                        ))}
                    </select>

                    <label>Diagnóstico:</label>
                    <textarea 
                        required 
                        placeholder="Escriba el diagnóstico detallado..."
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                    />

                    <label>Plan de seguimiento:</label>
                    <textarea 
                        placeholder="Observaciones adicionales..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                    />

                    <button type="submit" className="rc-btn-final" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Finalizar Consulta'}
                    </button>
                </form>
            </div>
        </div>
    )
}
