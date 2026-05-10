import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './AgendarCita.css'

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
            {/* Header */}
            <div className="ac-header">
                {onVolver && <button className="ac-volver" onClick={onVolver}>←</button>}
                <div>
                    <h1 className="ac-titulo">Agendar Cita</h1>
                    <p className="ac-subtitulo">
                        {rolCreador === 'paciente' 
                            ? 'Reserva tu próxima consulta' 
                            : 'Programar consulta para paciente'}
                    </p>
                </div>
            </div>

            {/* Pasos */}
            <div className="ac-pasos">
                {pasos.map((p, i) => {
                    const num = i + 1
                    const activo = num === paso
                    const completado = num < paso
                    return (
                        <div key={p} className="ac-paso-item">
                            <div className={`ac-paso-circulo ${activo ? 'activo' : completado ? 'completado' : ''}`}>
                                {completado ? '✓' : num}
                            </div>
                            <span className={`ac-paso-label ${activo ? 'activo' : ''}`}>{p}</span>
                            {i < pasos.length - 1 && <div className={`ac-paso-linea ${completado ? 'completada' : ''}`} />}
                        </div>
                    )
                })}
            </div>

            <div className="ac-contenido">
                {/* PASO 1 - Recepcionista: Seleccionar paciente */}
                {rolCreador === 'recepcionista' && paso === 1 && (
                    <div className="ac-paso">
                        <h2 className="ac-paso-titulo">Seleccionar paciente</h2>
                        <div className="ac-busqueda">
                            <span>🔍</span>
                            <input 
                                placeholder="Buscar por nombre o cédula..." 
                                value={busquedaPaciente} 
                                onChange={e => setBusquedaPaciente(e.target.value)} 
                            />
                        </div>
                        <div className="ac-lista-pacientes">
                            {pacientesFiltrados.map(p => (
                                <div 
                                    key={p.id} 
                                    className={`ac-paciente-item ${seleccion.paciente_id === p.id ? 'seleccionado' : ''}`}
                                    onClick={() => setSeleccion(s => ({ 
                                        ...s, 
                                        paciente_id: p.id, 
                                        paciente_nombre: `${p.nombre} ${p.apellido}` 
                                    }))}
                                >
                                    <div className="ac-pac-avatar">{p.nombre[0]}</div>
                                    <div className="ac-pac-info">
                                        <p className="ac-pac-nombre">{p.nombre} {p.apellido}</p>
                                        <p className="ac-pac-detalle">
                                            {p.cedula || 'Sin cédula'} · {p.telefono || 'Sin tel.'}
                                        </p>
                                    </div>
                                    {seleccion.paciente_id === p.id && <span className="ac-check">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PASO Fecha/Hora */}
                {((rolCreador === 'recepcionista' && paso === 2) || (rolCreador === 'paciente' && paso === 1)) && (
                    <div className="ac-paso">
                        <h2 className="ac-paso-titulo">Fecha y horario</h2>
                        {rolCreador === 'recepcionista' && seleccion.paciente_nombre && (
                            <div className="ac-paciente-seleccionado">
                                <div className="ac-pac-avatar">{seleccion.paciente_nombre[0]}</div>
                                <span>{seleccion.paciente_nombre}</span>
                            </div>
                        )}

                        <p className="ac-sub-label">Selecciona una fecha</p>
                        <div className="ac-fechas">
                            {proximosDias().map(d => {
                                const iso = d.toISOString().split('T')[0]
                                return (
                                    <div 
                                        key={iso} 
                                        className={`ac-fecha-item ${seleccion.fecha === iso ? 'seleccionado' : ''}`}
                                        onClick={() => setSeleccion(s => ({ ...s, fecha: iso, hora: '' }))}
                                    >
                                        <span className="ac-fecha-dia">{diasSemana[d.getDay()]}</span>
                                        <span className="ac-fecha-num">{d.getDate()}</span>
                                        <span className="ac-fecha-mes">{meses[d.getMonth()]}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {seleccion.fecha && (
                            <>
                                <p className="ac-sub-label">Horarios disponibles</p>
                                <div className="ac-horarios">
                                    {horarios.map(h => {
                                        const ocupado = horaOcupada(h)
                                        return (
                                            <div 
                                                key={h}
                                                className={`ac-hora ${seleccion.hora === h ? 'seleccionado' : ''} ${ocupado ? 'ocupado' : ''}`}
                                                onClick={() => !ocupado && setSeleccion(s => ({ ...s, hora: h }))}
                                            >
                                                {h}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="ac-leyenda">
                                    <span className="ac-ley-item">
                                        <span className="ac-ley-circulo disponible" /> Disponible
                                    </span>
                                    <span className="ac-ley-item">
                                        <span className="ac-ley-circulo ocupado" /> Ocupado
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* PASO Detalles */}
                {((rolCreador === 'recepcionista' && paso === 3) || (rolCreador === 'paciente' && paso === 2)) && (
                    <div className="ac-paso">
                        <h2 className="ac-paso-titulo">Odontólogo</h2>
                        <div className="ac-lista-od">
                            {odontologos.map(o => (
                                <div 
                                    key={o.id} 
                                    className={`ac-od-item ${seleccion.odontologo_id === o.id ? 'seleccionado' : ''}`}
                                    onClick={() => setSeleccion(s => ({ 
                                        ...s, 
                                        odontologo_id: o.id, 
                                        odontologo_nombre: `Dr. ${o.usuarios?.nombre} ${o.usuarios?.apellido}` 
                                    }))}
                                >
                                    <div className="ac-od-avatar">👤</div>
                                    <div>
                                        <p className="ac-od-nombre">Dr. {o.usuarios?.nombre} {o.usuarios?.apellido}</p>
                                        <p className="ac-od-esp">{o.especialidad}</p>
                                    </div>
                                    {seleccion.odontologo_id === o.id && <span className="ac-check">✓</span>}
                                </div>
                            ))}
                        </div>

                        <h2 className="ac-paso-titulo" style={{ marginTop: '1rem' }}>Tipo de tratamiento</h2>
                        <div className="ac-servicios">
                            {servicios.map(s => (
                                <div 
                                    key={s.id} 
                                    className={`ac-servicio-tag ${seleccion.servicio_id === s.id ? 'seleccionado' : ''}`}
                                    onClick={() => setSeleccion(sel => ({ 
                                        ...sel, 
                                        servicio_id: s.id, 
                                        servicio_nombre: s.nombre 
                                    }))}
                                >
                                    {s.nombre}
                                </div>
                            ))}
                        </div>

                        <h2 className="ac-paso-titulo" style={{ marginTop: '1rem' }}>Notas adicionales (opcional)</h2>
                        <textarea 
                            className="ac-notas" 
                            placeholder="Describe brevemente el motivo de tu consulta..." 
                            value={seleccion.notas} 
                            onChange={e => setSeleccion(s => ({ ...s, notas: e.target.value }))} 
                            rows={3} 
                        />
                    </div>
                )}

                {/* PASO Confirmar */}
                {((rolCreador === 'recepcionista' && paso === 4) || (rolCreador === 'paciente' && paso === 3)) && (
                    <div className="ac-paso">
                        <h2 className="ac-paso-titulo">
                            {rolCreador === 'paciente' ? 'Resumen de tu cita' : 'Confirmar cita'}
                        </h2>
                        <div className="ac-resumen">
                            {rolCreador === 'recepcionista' && (
                                <div className="ac-resumen-item">
                                    <span className="ac-res-icon">👤</span>
                                    <div>
                                        <p className="ac-res-label">Paciente</p>
                                        <p className="ac-res-valor">{seleccion.paciente_nombre}</p>
                                    </div>
                                </div>
                            )}
                            <div className="ac-resumen-item">
                                <span className="ac-res-icon">📅</span>
                                <div>
                                    <p className="ac-res-label">Fecha</p>
                                    <p className="ac-res-valor">{seleccion.fecha}</p>
                                </div>
                            </div>
                            <div className="ac-resumen-item">
                                <span className="ac-res-icon">⏰</span>
                                <div>
                                    <p className="ac-res-label">Hora</p>
                                    <p className="ac-res-valor">{seleccion.hora}</p>
                                </div>
                            </div>
                            <div className="ac-resumen-item">
                                <span className="ac-res-icon">🦷</span>
                                <div>
                                    <p className="ac-res-label">Odontólogo</p>
                                    <p className="ac-res-valor">{seleccion.odontologo_nombre || 'No seleccionado'}</p>
                                </div>
                            </div>
                            {seleccion.servicio_nombre && (
                                <div className="ac-resumen-item">
                                    <span className="ac-res-icon">💊</span>
                                    <div>
                                        <p className="ac-res-label">Tratamiento</p>
                                        <p className="ac-res-valor">{seleccion.servicio_nombre}</p>
                                    </div>
                                </div>
                            )}
                            {seleccion.notas && (
                                <div className="ac-resumen-item">
                                    <span className="ac-res-icon">📝</span>
                                    <div>
                                        <p className="ac-res-label">Notas</p>
                                        <p className="ac-res-valor">{seleccion.notas}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {rolCreador === 'paciente' && (
                            <div className="ac-aviso">
                                <span>ℹ️</span>
                                <p>Recibirás una confirmación. Si necesitas cancelar, hazlo con al menos 24 horas de anticipación.</p>
                            </div>
                        )}

                        {error && <p className="ac-error">{error}</p>}
                    </div>
                )}
            </div>

            {/* Botones de navegación */}
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