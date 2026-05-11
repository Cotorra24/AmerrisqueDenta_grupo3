import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import PacienteFiltros from '../../components/recepcionista/PacienteFiltros'
import PacienteItem from '../../components/recepcionista/PacienteItem'
import PacienteModal from '../../components/recepcionista/PacienteModal'

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

            <PacienteFiltros 
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                filtro={filtro}
                setFiltro={setFiltro}
                total={pacientes.length}
                activos={pacientes.filter(p => p.activo).length}
                inactivos={pacientes.filter(p => !p.activo).length}
            />

            <div className="gp-lista">
                {cargando ? (
                    <div className="gp-cargando"><div className="gp-spinner" /></div>
                ) : pacientesFiltrados.length === 0 ? (
                    <p className="gp-vacio">No se encontraron pacientes</p>
                ) : (
                    pacientesFiltrados.map(p => (
                        <PacienteItem 
                            key={p.id} 
                            paciente={p} 
                            onEdit={abrirEditar} 
                            onToggleActivo={toggleActivo} 
                        />
                    ))
                )}
            </div>

            <PacienteModal 
                isOpen={!!modalEditar || modalRegistrar}
                isEditing={!!modalEditar}
                form={form}
                setForm={setForm}
                onClose={() => { setModalEditar(null); setModalRegistrar(false) }}
                onSave={modalEditar ? guardarEdicion : registrarPaciente}
                guardando={guardando}
            />
        </div>
    )
}
