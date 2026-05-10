import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './MisCitasOdontologo.css'

export default function MisCitasOdontologo({ onVolver }) {
    const [citas, setCitas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [filtroFecha, setFiltroFecha] = useState('hoy')
    const [odontologoId, setOdontologoId] = useState(null)

    const getFecha = (offset = 0) => {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        return d.toISOString().split('T')[0]
    }

    // ✅ Memoizamos 'filtros' para evitar que se recree en cada render
    const filtros = useMemo(() => [
        { key: 'hoy', label: 'Hoy', fecha: getFecha(0) },
        { key: 'manana', label: 'Mañana', fecha: getFecha(1) },
        { key: 'lun27', label: `Lun ${new Date(getFecha(2)).getDate()}`, fecha: getFecha(2) },
        { key: 'mar28', label: `Mar ${new Date(getFecha(3)).getDate()}`, fecha: getFecha(3) },
    ], [])

    // Cargar ID del odontólogo
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: od } = await supabase
                .from('odontologos')
                .select('id')
                .eq('usuario_id', user.id)
                .single()

            if (od) setOdontologoId(od.id)
        }
        init()
    }, [])

    // Cargar citas
    useEffect(() => {
        if (!odontologoId) return

        const f = filtros.find(f => f.key === filtroFecha)
        if (!f) return

        const cargar = async () => {
            setCargando(true)
            try {
                const { data, error } = await supabase
                    .from('citas')
                    .select('*, pacientes(nombre, apellido), servicios(nombre)')
                    .eq('odontologo_id', odontologoId)
                    .gte('fecha_hora', f.fecha + 'T00:00:00')
                    .lte('fecha_hora', f.fecha + 'T23:59:59')
                    .order('fecha_hora', { ascending: true })

                if (error) throw error

                setCitas(data || [])
            } catch (err) {
                console.error('Error cargando citas:', err)
            } finally {
                setCargando(false)
            }
        }

        cargar()
    }, [odontologoId, filtroFecha, filtros]) // ← Ahora incluimos 'filtros' de forma segura

    const stats = useMemo(() => ({
        total: citas.length,
        completadas: citas.filter(c => c.estado === 'completada').length,
        pendientes: citas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length,
    }), [citas])

    return (
        <div className="mco-wrapper">
            <div className="mco-header">
                {onVolver && <button className="mco-volver" onClick={onVolver}>←</button>}
                <div>
                    <h1 className="mco-titulo">Mis Citas</h1>
                    <p className="mco-subtitulo">Agenda del día</p>
                </div>
            </div>

            {/* Filtro fechas */}
            <div className="mco-fechas">
                {filtros.map(f => (
                    <button
                        key={f.key}
                        className={`mco-fecha-btn ${filtroFecha === f.key ? 'activo' : ''}`}
                        onClick={() => setFiltroFecha(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="mco-stats">
                <div className="mco-stat azul"><span>{stats.total}</span><p>Total</p></div>
                <div className="mco-stat verde"><span>{stats.completadas}</span><p>Completadas</p></div>
                <div className="mco-stat amarillo"><span>{stats.pendientes}</span><p>Pendientes</p></div>
            </div>

            {/* Barra progreso */}
            <div className="mco-progreso-wrap">
                <div className="mco-progreso-label">
                    <span>Progreso del día</span>
                    <span className="mco-progreso-num">
                        {stats.completadas}/{stats.total} completadas
                    </span>
                </div>
                <div className="mco-progreso-bar">
                    <div
                        className="mco-progreso-fill"
                        style={{
                            width: stats.total > 0 ? `${(stats.completadas / stats.total) * 100}%` : '0%'
                        }}
                    />
                </div>
            </div>

            {/* Lista citas */}
            <div className="mco-lista">
                {cargando ? (
                    <div className="mco-cargando"><div className="mco-spinner" /></div>
                ) : citas.length === 0 ? (
                    <p className="mco-vacio">No tienes citas para este día</p>
                ) : (
                    citas.map(c => (
                        <div key={c.id} className="mco-cita">
                            <div className="mco-cita-linea" />
                            <div className="mco-cita-body">
                                <div className="mco-cita-top">
                                    <p className="mco-cita-paciente">
                                        {c.pacientes?.nombre} {c.pacientes?.apellido}
                                    </p>
                                    <div className="mco-cita-right">
                                        <span className="mco-hora">
                                            ⏰ {new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className={`mco-badge ${c.estado}`}>
                                            {c.estado === 'pendiente' ? 'Programada' :
                                                c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <p className="mco-servicio">{c.servicios?.nombre || 'Consulta general'}</p>
                                {c.notas && <p className="mco-notas">📝 {c.notas}</p>}
                                <div className="mco-cita-acciones">
                                    <button className="mco-btn-historial">📋 Historial</button>
                                    <button className="mco-btn-consulta">✅ Registrar consulta</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}