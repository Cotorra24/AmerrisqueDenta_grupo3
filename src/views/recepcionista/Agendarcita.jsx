import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import CitaHeader from '../../components/citas/CitaHeader'
import CitaPasosNav from '../../components/citas/CitaPasosNav'
import PasoSeleccionPaciente from '../../components/citas/PasoSeleccionPaciente'
import PasoFechaHora from '../../components/citas/PasoFechaHora'
import PasoDetalles from '../../components/citas/PasoDetalles'
import PasoResumen from '../../components/citas/PasoResumen'

// rolCreador: 'recepcionista' | 'paciente'
export default function AgendarCita({ onVolver, onExito, rolCreador = 'recepcionista' }) {
    const [paso, setPaso] = useState(1)
    const [pacientes, setPacientes] = useState([])
    const [odontologos, setOdontologos] = useState([])
    const [servicios, setServicios] = useState([])
    const [citasOcupadas, setCitasOcupadas] = useState([])
    const [busquedaPaciente, setBusquedaPaciente] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const [seleccion, setSeleccion] = useState({
        paciente_id: null,
        paciente_nombre: '',
        fecha: '',
        hora: '',
        odontologo_id: null,
        odontologo_nombre: '',
        servicio_id: null,
        servicio_nombre: '',
        notas: '',
    })

    const pasosTotales = rolCreador === 'paciente' ? 3 : 4
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const horarios = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

    // Generar próximos 6 días hábiles
    const proximosDias = () => {
        const dias = []
        let d = new Date()
        let i = 0
        while (dias.length < 6) {
            if (d.getDay() !== 0) dias.push(new Date(d))
            d = new Date(d)
            d.setDate(d.getDate() + 1)
            i++
            if (i > 30) break
        }
        return dias
    }

    useEffect(() => {
        const cargar = async () => {
            try {
                // Odontólogos
                const { data: ods } = await supabase
                    .from('odontologos')
                    .select('id, especialidad, usuarios(nombre, apellido)')
                    .eq('activo', true)
                setOdontologos(ods || [])

                // Servicios
                const { data: svs } = await supabase
                    .from('servicios')
                    .select('id, nombre, costo')
                    .eq('activo', true)
                setServicios(svs || [])

                // Pacientes (solo recepcionista)
                if (rolCreador === 'recepcionista') {
                    const { data: pacs } = await supabase
                        .from('pacientes')
                        .select('id, nombre, apellido, cedula, telefono')
                        .eq('activo', true)
                        .order('nombre')
                    setPacientes(pacs || [])
                }

                // Paciente logueado
                if (rolCreador === 'paciente') {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        const { data: pac } = await supabase
                            .from('pacientes')
                            .select('id, nombre, apellido')
                            .eq('usuario_id', user.id)
                            .single()

                        if (pac) {
                            setSeleccion(s => ({
                                ...s,
                                paciente_id: pac.id,
                                paciente_nombre: `${pac.nombre} ${pac.apellido}`
                            }))
                        }
                    }
                }
            } catch (err) {
                console.error('Error cargando datos iniciales:', err)
                setError('Error al cargar los datos')
            }
        }
        cargar()
    }, [rolCreador])

    // Cargar citas ocupadas cuando cambia la fecha
    useEffect(() => {
        if (!seleccion.fecha) return

        const cargarOcupadas = async () => {
            try {
                const { data } = await supabase
                    .from('citas')
                    .select('fecha_hora, odontologo_id')
                    .gte('fecha_hora', seleccion.fecha + 'T00:00:00')
                    .lte('fecha_hora', seleccion.fecha + 'T23:59:59')
                    .neq('estado', 'cancelada')
                setCitasOcupadas(data || [])
            } catch (err) {
                console.error('Error cargando citas ocupadas:', err)
            }
        }
        cargarOcupadas()
    }, [seleccion.fecha])

    const horaOcupada = (hora) => {
        if (!seleccion.odontologo_id) return false
        return citasOcupadas.some(c =>
            c.odontologo_id === seleccion.odontologo_id &&
            c.fecha_hora?.includes(`T${hora}`)
        )
    }

    const pacientesFiltrados = pacientes.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
        p.cedula?.toLowerCase().includes(busquedaPaciente.toLowerCase())
    )

    const confirmarCita = async () => {
        setGuardando(true)
        setError('')

        if (!seleccion.paciente_id || !seleccion.fecha || !seleccion.hora || !seleccion.odontologo_id) {
            setError('Faltan campos obligatorios')
            setGuardando(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const fechaHora = `${seleccion.fecha}T${seleccion.hora}:00`

            const { error: err } = await supabase.from('citas').insert([{
                paciente_id: seleccion.paciente_id,
                odontologo_id: seleccion.odontologo_id,
                servicio_id: seleccion.servicio_id || null,
                fecha_hora: fechaHora,
                motivo: seleccion.servicio_nombre || null,
                notas: seleccion.notas || null,
                estado: 'pendiente',
                creado_por: user?.id,
            }])

            if (!err) {
                onExito && onExito()
            } else {
                setError('Error al guardar la cita. Intenta de nuevo.')
            }
        } catch (err) {
            console.error(err)
            setError('Error inesperado al guardar la cita')
        } finally {
            setGuardando(false)
        }
    }

    const pasos = rolCreador === 'recepcionista'
        ? ['Paciente', 'Fecha/Hora', 'Detalles', 'Confirmar']
        : ['Fecha', 'Detalles', 'Confirmar']

    return (
        <div className="ac-wrapper">
            <CitaHeader onVolver={onVolver} rolCreador={rolCreador} />
            <CitaPasosNav pasos={pasos} pasoActual={paso} />

            <div className="ac-contenido">
                {rolCreador === 'recepcionista' && paso === 1 && (
                    <PasoSeleccionPaciente 
                        busqueda={busquedaPaciente}
                        setBusqueda={setBusquedaPaciente}
                        pacientes={pacientesFiltrados}
                        seleccionId={seleccion.paciente_id}
                        onSelect={p => setSeleccion(s => ({ 
                            ...s, 
                            paciente_id: p.id, 
                            paciente_nombre: `${p.nombre} ${p.apellido}` 
                        }))}
                    />
                )}

                {((rolCreador === 'recepcionista' && paso === 2) || (rolCreador === 'paciente' && paso === 1)) && (
                    <PasoFechaHora 
                        rolCreador={rolCreador}
                        pacienteNombre={seleccion.paciente_nombre}
                        fechaSeleccionada={seleccion.fecha}
                        horaSeleccionada={seleccion.hora}
                        proximosDias={proximosDias()}
                        diasSemana={diasSemana}
                        meses={meses}
                        horarios={horarios}
                        onSelectFecha={iso => setSeleccion(s => ({ ...s, fecha: iso, hora: '' }))}
                        onSelectHora={h => setSeleccion(s => ({ ...s, hora: h }))}
                        horaOcupada={horaOcupada}
                    />
                )}

                {((rolCreador === 'recepcionista' && paso === 3) || (rolCreador === 'paciente' && paso === 2)) && (
                    <PasoDetalles 
                        odontologos={odontologos}
                        servicios={servicios}
                        odontologoId={seleccion.odontologo_id}
                        servicioId={seleccion.servicio_id}
                        notas={seleccion.notas}
                        onSelectOdontologo={o => setSeleccion(s => ({ 
                            ...s, 
                            odontologo_id: o.id, 
                            odontologo_nombre: `Dr. ${o.usuarios?.nombre} ${o.usuarios?.apellido}` 
                        }))}
                        onSelectServicio={s => setSeleccion(sel => ({ 
                            ...sel, 
                            servicio_id: s.id, 
                            servicio_nombre: s.nombre 
                        }))}
                        onNotasChange={v => setSeleccion(s => ({ ...s, notas: v }))}
                    />
                )}

                {((rolCreador === 'recepcionista' && paso === 4) || (rolCreador === 'paciente' && paso === 3)) && (
                    <PasoResumen 
                        rolCreador={rolCreador}
                        seleccion={seleccion}
                        error={error}
                    />
                )}
            </div>

            <div className="ac-botones">
                {paso > 1 && (
                    <button className="ac-btn-anterior" onClick={() => setPaso(p => p - 1)}>
                        Anterior
                    </button>
                )}

                {paso < pasosTotales ? (
                    <button 
                        className="ac-btn-siguiente"
                        onClick={() => {
                            if (rolCreador === 'recepcionista' && paso === 1 && !seleccion.paciente_id) {
                                setError('Selecciona un paciente')
                                return
                            }
                            if (((rolCreador === 'recepcionista' && paso === 2) || (rolCreador === 'paciente' && paso === 1)) &&
                                (!seleccion.fecha || !seleccion.hora)) {
                                setError('Selecciona fecha y hora')
                                return
                            }
                            setError('')
                            setPaso(p => p + 1)
                        }}
                    >
                        Siguiente ›
                    </button>
                ) : (
                    <button 
                        className="ac-btn-confirmar" 
                        onClick={confirmarCita} 
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Confirmar cita ›'}
                    </button>
                )}
            </div>

            {error && paso < pasosTotales && <p className="ac-error-nav">{error}</p>}
        </div>
    )
}