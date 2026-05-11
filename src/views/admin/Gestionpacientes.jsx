import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Gestionpacientes.css'

export default function GestionPacientes({ onVolver }) {
    const [pacientes, setPacientes] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtro, setFiltro] = useState('todos')
    const [cargando, setCargando] = useState(true)
    const [modalEditar, setModalEditar] = useState(null)
    const [modalRegistrar, setModalRegistrar] = useState(false)
    const [form, setForm] = useState({})
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    const cargarPacientes = async () => {
        setCargando(true)
        try {
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error

            setPacientes(data || [])
        } catch (err) {
            console.error('Error cargando pacientes:', err)
        } finally {
            setCargando(false)
        }
    }

    // ✅ Solución al warning de React
    useEffect(() => {
        cargarPacientes()
    }, [])

    const pacientesFiltrados = pacientes.filter(p => {
        const q = busqueda.toLowerCase()
        const coincide =
            p.nombre?.toLowerCase().includes(q) ||
            p.apellido?.toLowerCase().includes(q) ||
            p.cedula?.toLowerCase().includes(q) ||
            p.telefono?.toLowerCase().includes(q)

        const estado = filtro === 'todos' ||
            (filtro === 'activos' && p.activo) ||
            (filtro === 'inactivos' && !p.activo)

        return coincide && estado
    })

    const abrirEditar = (p) => {
        setForm({ ...p });
        setModalEditar(p.id)
    }

    const abrirRegistrar = () => {
        setForm({
            nombre: '',
            apellido: '',
            cedula: '',
            telefono: '',
            email: '',
            fecha_nacimiento: '',
            sexo: '',
            direccion: ''
        });
        setModalRegistrar(true)
    }

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 3000)
    }

    const guardarEdicion = async () => {
        setGuardando(true)
        try {
            const { error } = await supabase
                .from('pacientes')
                .update({
                    nombre: form.nombre,
                    apellido: form.apellido,
                    cedula: form.cedula || null,
                    telefono: form.telefono || null,
                    email: form.email || null,
                    fecha_nacimiento: form.fecha_nacimiento || null,
                    sexo: form.sexo || null,
                    direccion: form.direccion || null
                })
                .eq('id', modalEditar)

            if (error) throw error

            mostrarMensaje('exito', 'Paciente actualizado correctamente')
            setModalEditar(null)
            await cargarPacientes()

        } catch (err) {
            console.error('Error al actualizar paciente:', err)
            mostrarMensaje('error', 'Error al actualizar')
        } finally {
            setGuardando(false)
        }
    }

    const registrarPaciente = async () => {
        if (!form.nombre?.trim() || !form.apellido?.trim()) {
            mostrarMensaje('error', 'Nombre y apellido son obligatorios')
            return
        }

        setGuardando(true)
        try {
            const { error } = await supabase
                .from('pacientes')
                .insert([{
                    nombre: form.nombre,
                    apellido: form.apellido,
                    cedula: form.cedula || null,
                    telefono: form.telefono || null,
                    email: form.email || null,
                    fecha_nacimiento: form.fecha_nacimiento || null,
                    sexo: form.sexo || null,
                    direccion: form.direccion || null,
                    activo: true
                }])

            if (error) throw error

            mostrarMensaje('exito', 'Paciente registrado correctamente')
            setModalRegistrar(false)
            await cargarPacientes()

        } catch (err) {
            console.error('Error al registrar paciente:', err)
            mostrarMensaje('error', 'Error al registrar')
        } finally {
            setGuardando(false)
        }
    }

    const toggleActivo = async (p) => {
        try {
            const { error } = await supabase
                .from('pacientes')
                .update({ activo: !p.activo })
                .eq('id', p.id)

            if (error) throw error

            mostrarMensaje('exito', `Paciente ${!p.activo ? 'activado' : 'inactivado'}`)
            await cargarPacientes()

        } catch (err) {
            console.error('Error al cambiar estado:', err)
            mostrarMensaje('error', 'Error al cambiar estado')
        }
    }

    const calcEdad = (f) => {
        if (!f) return null
        return new Date().getFullYear() - new Date(f).getFullYear()
    }

    const iniciales = (n, a) => `${n?.[0] || ''}${a?.[0] || ''}`.toUpperCase()
    const colores = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#be185d']
    const color = (id) => colores[id % colores.length]

    return (
        <div className="gp-wrapper">
            <div className="gp-header">
                {onVolver && <button className="gp-volver" onClick={onVolver}>←</button>}
                <div>
                    <h1 className="gp-titulo">Gestionar Pacientes</h1>
                    <p className="gp-subtitulo">{pacientes.length} pacientes registrados</p>
                </div>
                <button className="gp-btn-nuevo" onClick={abrirRegistrar}>+ Nuevo</button>
            </div>

            {mensaje && <div className={`gp-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <div className="gp-busqueda-wrapper">
                <div className="gp-busqueda">
                    <span>🔍</span>
                    <input
                        placeholder="Buscar por nombre, cédula o teléfono..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="gp-busqueda-input"
                    />
                </div>
            </div>

            <div className="gp-filtros">
                {['todos', 'activos', 'inactivos'].map(f => (
                    <button
                        key={f}
                        className={`gp-filtro ${filtro === f ? 'activo' : ''}`}
                        onClick={() => setFiltro(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({
                            f === 'todos' ? pacientes.length :
                                f === 'activos' ? pacientes.filter(p => p.activo).length :
                                    pacientes.filter(p => !p.activo).length
                        })
                    </button>
                ))}
            </div>

            <div className="gp-lista">
                {cargando ? (
                    <div className="gp-cargando"><div className="gp-spinner" /></div>
                ) : pacientesFiltrados.length === 0 ? (
                    <p className="gp-vacio">No se encontraron pacientes</p>
                ) : (
                    pacientesFiltrados.map(p => (
                        <div key={p.id} className={`gp-item ${!p.activo ? 'inactivo' : ''}`}>
                            <div className="gp-avatar" style={{ background: color(p.id) }}>
                                {iniciales(p.nombre, p.apellido)}
                            </div>
                            <div className="gp-info">
                                <div className="gp-nombre-row">
                                    <span className="gp-nombre">{p.nombre} {p.apellido}</span>
                                    <span className={`gp-estado-badge ${p.activo ? 'activo' : 'inactivo'}`}>
                                        {p.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <span className="gp-detalle">
                                    {p.cedula || 'Sin cédula'}
                                    {calcEdad(p.fecha_nacimiento) ? ` · ${calcEdad(p.fecha_nacimiento)} años` : ''}
                                </span>
                            </div>
                            <div className="gp-acciones-item">
                                <button className="gp-btn-toggle" onClick={() => toggleActivo(p)} title={p.activo ? 'Inactivar' : 'Activar'}>
                                    <span>{p.activo ? '🚫' : '✅'}</span>
                                </button>
                                <button className="gp-btn-editar-item" onClick={() => abrirEditar(p)}>›</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {(modalEditar || modalRegistrar) && (
                <div className="gp-overlay" onClick={() => { setModalEditar(null); setModalRegistrar(false) }}>
                    <div className="gp-modal" onClick={e => e.stopPropagation()}>
                        <div className="gp-modal-header">
                            <h2>{modalEditar ? 'Editar Paciente' : 'Registrar Paciente'}</h2>
                            <button onClick={() => { setModalEditar(null); setModalRegistrar(false) }}>✕</button>
                        </div>
                        <div className="gp-modal-body">
                            <div className="gp-form">
                                <div className="gp-form-row">
                                    <Campo label="Nombre *" value={form.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Nombre" />
                                    <Campo label="Apellido *" value={form.apellido} onChange={v => setForm(f => ({ ...f, apellido: v }))} placeholder="Apellido" />
                                </div>
                                <div className="gp-form-row">
                                    <Campo label="Cédula" value={form.cedula} onChange={v => setForm(f => ({ ...f, cedula: v }))} placeholder="001-000000-0000X" />
                                    <Campo label="Teléfono" value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} placeholder="8888-1234" />
                                </div>
                                <Campo label="Correo electrónico" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="correo@ejemplo.com" type="email" />
                                <div className="gp-form-row">
                                    <Campo label="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={v => setForm(f => ({ ...f, fecha_nacimiento: v }))} type="date" />
                                    <div className="gp-campo">
                                        <label>Sexo</label>
                                        <select value={form.sexo || ''} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                                            <option value="">Seleccionar</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="femenino">Femenino</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="gp-campo">
                                    <label>Dirección</label>
                                    <textarea value={form.direccion || ''} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Dirección del paciente" rows={2} />
                                </div>
                            </div>
                        </div>
                        <div className="gp-modal-footer">
                            <button className="gp-btn-cancelar" onClick={() => { setModalEditar(null); setModalRegistrar(false) }}>Cancelar</button>
                            <button
                                className="gp-btn-guardar"
                                onClick={modalEditar ? guardarEdicion : registrarPaciente}
                                disabled={guardando}
                            >
                                {guardando ? 'Guardando...' : modalEditar ? 'Guardar cambios' : 'Registrar paciente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Campo({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div className="gp-campo">
            <label>{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    )
}