import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import PacienteSelector from '../../components/recepcionista/PacienteSelector'
import PacienteCard from '../../components/recepcionista/PacienteCard'
import FormularioPago from '../../components/recepcionista/FormularioPago'

export default function RegistrarPago({ onVolver, onExito }) {
    const [pacientes, setPacientes] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
    const [servicios, setServicios] = useState([])
    const [tratamientos, setTratamientos] = useState([])
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null)
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
    const [monto, setMonto] = useState('')
    const [metodoPago, setMetodoPago] = useState('efectivo')
    const [notas, setNotas] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const cargarDatos = async () => {
            const { data: pacs } = await supabase.from('pacientes').select('id, nombre, apellido, cedula').eq('activo', true).order('nombre')
            setPacientes(pacs || [])

            const { data: servs } = await supabase.from('servicios').select('*').eq('activo', true).order('nombre')
            setServicios(servs || [])
        }
        cargarDatos()
    }, [])

    useEffect(() => {
        if (!pacienteSeleccionado) {
            setTratamientos([])
            return
        }

        const cargarTratamientos = async () => {
            const { data, error } = await supabase
                .from('tratamientos')
                .select(`
                    id, 
                    descripcion, 
                    costo, 
                    estado,
                    servicio:servicio_id(nombre),
                    historial:historial_id(paciente_id)
                `)
                .eq('historial.paciente_id', pacienteSeleccionado.id)
                .neq('estado', 'completado')

            // Supabase filtering on joined tables can be tricky in some versions/policies, 
            // but let's assume standard join or filter manually if needed.
            // Actually, the above filter might fail if not using postgrest 9+. 
            // Better approach: fetch historiales first or use a join that works.
            
            const { data: treatments } = await supabase
                .from('tratamientos')
                .select('*, servicio:servicio_id(nombre)')
                .innerJoin('historiales_clinicos', 'historial_id', 'id')
                .eq('historiales_clinicos.paciente_id', pacienteSeleccionado.id)
                .neq('estado', 'completado')
            
            setTratamientos(treatments || [])
        }
        // Simplified query for reliability
        const cargarTratamientosSimple = async () => {
             const { data: historiales } = await supabase
                .from('historiales_clinicos')
                .select('id')
                .eq('paciente_id', pacienteSeleccionado.id)
            
            if (historiales?.length > 0) {
                const ids = historiales.map(h => h.id)
                const { data: treats } = await supabase
                    .from('tratamientos')
                    .select('*, servicio:servicio_id(nombre)')
                    .in('historial_id', ids)
                    .neq('estado', 'pagado') // Assuming there is a state or just filter by pending
                setTratamientos(treats || [])
            }
        }
        cargarTratamientosSimple()
    }, [pacienteSeleccionado])

    const pacientesFiltrados = pacientes.filter(p => 
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cedula?.toLowerCase().includes(busqueda.toLowerCase())
    )

    const handleSelectServicio = (s) => {
        setServicioSeleccionado(s)
        setMonto(s.costo)
    }

    const guardarPago = async () => {
        if (!pacienteSeleccionado || !monto || !metodoPago) {
            setError('Faltan campos obligatorios')
            return
        }

        setGuardando(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { error: err } = await supabase.from('pagos').insert([{
                paciente_id: pacienteSeleccionado.id,
                tratamiento_id: tratamientoSeleccionado?.id || null,
                monto: Number(monto),
                metodo_pago: metodoPago,
                notas: notas || `Pago por ${tratamientoSeleccionado?.servicio?.nombre || servicioSeleccionado?.nombre || 'consulta'}`,
                registrado_por: user.id,
                fecha_pago: new Date().toISOString().split('T')[0]
            }])

            if (err) throw err
            onExito && onExito()
        } catch (err) {
            console.error(err)
            setError('Error al registrar el pago')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="rp-wrapper">
            <div className="rp-header">
                <button className="rp-volver" onClick={onVolver}>←</button>
                <h1 className="rp-titulo">Registrar Pago</h1>
            </div>

            <div className="rp-form">
                {!pacienteSeleccionado ? (
                    <PacienteSelector 
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        pacientesFiltrados={pacientesFiltrados}
                        onSelectPaciente={setPacienteSeleccionado}
                    />
                ) : (
                    <PacienteCard 
                        paciente={pacienteSeleccionado}
                        onCambiar={() => setPacienteSeleccionado(null)}
                    />
                )}

                {pacienteSeleccionado && (
                    <FormularioPago 
                        servicios={servicios}
                        tratamientos={tratamientos}
                        onSelectServicio={handleSelectServicio}
                        onSelectTratamiento={t => {
                            setTratamientoSeleccionado(t)
                            setMonto(t.costo)
                        }}
                        monto={monto}
                        setMonto={setMonto}
                        metodoPago={metodoPago}
                        setMetodoPago={setMetodoPago}
                        notas={notas}
                        setNotas={setNotas}
                        error={error}
                        guardando={guardando}
                        onGuardar={guardarPago}
                    />
                )}
            </div>
        </div>
    )
}
