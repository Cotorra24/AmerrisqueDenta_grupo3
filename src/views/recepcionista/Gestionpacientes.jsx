import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Gestionpacientes.css'

export default function GestionPacientes() {
    const [pacientes, setPacientes] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [mostrarModal, setMostrarModal] = useState(false)
    const [cargando, setCargando] = useState(false)
    
    // Formulario para nuevo paciente
    const [nuevo, setNuevo] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        sexo: 'femenino',
        telefono: '',
        email: '',
        direccion: ''
    })

    const cargarPacientes = async () => {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('nombre', { ascending: true })
        
        if (error) {
            console.error('Error cargando pacientes:', error)
        } else {
            setPacientes(data || [])
        }
    }

    useEffect(() => {
        cargarPacientes()
    }, [])

    const handleGuardar = async (e) => {
        e.preventDefault()
        setCargando(true)

        const { error } = await supabase
            .from('pacientes')
            .insert([nuevo])

        if (error) {
            alert('Error al guardar: ' + error.message)
        } else {
            alert('Paciente guardado con éxito')
            setMostrarModal(false)
            setNuevo({ cedula: '', nombre: '', apellido: '', fecha_nacimiento: '', sexo: 'femenino', telefono: '', email: '', direccion: '' })
            cargarPacientes()
        }
        setCargando(false)
    }

    const filtrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.cedula?.includes(busqueda)
    )

    const getIniciales = (nombre) => {
        const parts = (nombre || '?').split(' ')
        return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
    }

    return (
        <div className="gp-container">
            <div className="gp-header">
                <div className="gp-info">
                    <h2>Gestión de Pacientes</h2>
                    <p>{pacientes.length} pacientes registrados</p>
                </div>
                <button className="gp-btn-nuevo" onClick={() => setMostrarModal(true)}>
                    <span>+</span> Nuevo Paciente
                </button>
            </div>

            <div className="gp-toolbar">
                <div className="gp-search">
                    <span>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o cédula..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            <div className="gp-grid">
                {filtrados.map(p => (
                    <div key={p.id} className="gp-card">
                        <div className="gp-card-main">
                            <div className="gp-avatar">{getIniciales(p.nombre)}</div>
                            <div className="gp-detalles">
                                <h3>{p.nombre} {p.apellido}</h3>
                                <p className="gp-cedula">{p.cedula || 'Sin cédula'}</p>
                            </div>
                        </div>
                        <div className="gp-card-info">
                            <div className="gp-info-item">
                                <span>📞</span> {p.telefono || 'No registrado'}
                            </div>
                            <div className="gp-info-item">
                                <span>📧</span> {p.email || 'Sin correo'}
                            </div>
                        </div>
                        <div className="gp-card-actions">
                            <button className="btn-historial">Historial</button>
                            <button className="btn-editar">Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="gp-modal-overlay">
                    <div className="gp-modal">
                        <div className="gp-modal-header">
                            <h3>Registrar Nuevo Paciente</h3>
                            <button onClick={() => setMostrarModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGuardar} className="gp-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Cédula:</label>
                                    <input type="text" value={nuevo.cedula} onChange={e => setNuevo({...nuevo, cedula: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Nombre:</label>
                                    <input type="text" required value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Apellido:</label>
                                    <input type="text" required value={nuevo.apellido} onChange={e => setNuevo({...nuevo, apellido: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Nacimiento:</label>
                                    <input type="date" value={nuevo.fecha_nacimiento} onChange={e => setNuevo({...nuevo, fecha_nacimiento: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Sexo:</label>
                                    <select value={nuevo.sexo} onChange={e => setNuevo({...nuevo, sexo: e.target.value})}>
                                        <option value="femenino">Femenino</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Teléfono:</label>
                                    <input type="text" value={nuevo.telefono} onChange={e => setNuevo({...nuevo, telefono: e.target.value})} />
                                </div>
                                <div className="form-group full">
                                    <label>Email:</label>
                                    <input type="email" value={nuevo.email} onChange={e => setNuevo({...nuevo, email: e.target.value})} />
                                </div>
                                <div className="form-group full">
                                    <label>Dirección:</label>
                                    <textarea value={nuevo.direccion} onChange={e => setNuevo({...nuevo, direccion: e.target.value})} />
                                </div>
                            </div>
                            <div className="gp-form-actions">
                                <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-save" disabled={cargando}>
                                    {cargando ? 'Guardando...' : 'Guardar Paciente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
