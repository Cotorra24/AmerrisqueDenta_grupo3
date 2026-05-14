import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import '../recepcionista/Gestionpacientes.css'

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [roles, setRoles] = useState([])
    const [mostrarModal, setMostrarModal] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', password: '', nombre: '', rol_id: '1' })

    useEffect(() => {
        fetchUsuarios()
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        const { data } = await supabase.from('roles').select('*')
        setRoles(data || [])
    }

    const fetchUsuarios = async () => {
        const { data } = await supabase.from('usuarios').select(`
            id, nombre, email, rol_id,
            roles ( nombre )
        `).order('nombre')
        setUsuarios(data || [])
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        setCargando(true)

        // 1. Crear el usuario en Supabase Auth (Sistema de Autenticación)
        // Usamos signUp. Nota: En producción esto enviará un email de confirmación
        // a menos que lo desactives en el dashboard de Supabase.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: nuevoUsuario.email,
            password: nuevoUsuario.password || 'password123', // Contraseña por defecto si no se provee
            options: {
                data: {
                    nombre: nuevoUsuario.nombre,
                    rol_id: parseInt(nuevoUsuario.rol_id)
                }
            }
        })

        if (authError) {
            alert('Error en Auth: ' + authError.message)
            setCargando(false)
            return
        }

        // 2. Insertar en nuestra tabla de base de datos 'usuarios'
        const { error: dbError } = await supabase.from('usuarios').insert([{
            id: authData.user.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol_id: parseInt(nuevoUsuario.rol_id)
        }])
        
        if (dbError) {
            alert('Error en DB: ' + dbError.message)
        } else {
            alert('¡Usuario creado con éxito! Ya puede iniciar sesión.')
            setMostrarModal(false)
            fetchUsuarios()
        }
        setCargando(false)
    }

    return (
        <div className="gp-container fade-in">
            <header className="gp-header">
                <div>
                    <h2 className="logo-text" style={{fontSize: '2rem'}}>Gestión de Personal</h2>
                    <p style={{color: 'var(--text-muted)'}}>Control de acceso para Odontólogos y Recepcionistas</p>
                </div>
                <button className="gp-btn-nuevo" onClick={() => setMostrarModal(true)}>
                    + Nuevo Miembro
                </button>
            </header>

            <table className="tabla-admin">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td style={{fontWeight: '800'}}>{u.nombre}</td>
                            <td>{u.email}</td>
                            <td>
                                <span className="doc-stat-pill" style={{
                                    background: u.rol_id === 1 ? '#fee2e2' : u.rol_id === 2 ? '#dcfce7' : '#f0f9ff',
                                    color: u.rol_id === 1 ? '#991b1b' : u.rol_id === 2 ? '#166534' : '#0369a1'
                                }}>
                                    {u.roles?.nombre.toUpperCase()}
                                </span>
                            </td>
                            <td><span style={{color: '#10b981'}}>● Activo</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {mostrarModal && (
                <div className="gp-modal-overlay">
                    <div className="gp-modal fade-in" style={{maxWidth: '500px', padding: '2.5rem'}}>
                        <h2 style={{marginBottom: '1.5rem'}}>Añadir Miembro al Equipo</h2>
                        <form onSubmit={handleCrear}>
                            <div className="login-campo">
                                <label className="login-label">Nombre Completo</label>
                                <input className="login-input" style={{paddingLeft: '1rem'}} required 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} />
                            </div>
                            <div className="login-campo">
                                <label className="login-label">Email</label>
                                <input type="email" className="login-input" style={{paddingLeft: '1rem'}} required 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} />
                            </div>
                            <div className="login-campo">
                                <label className="login-label">Contraseña inicial</label>
                                <input type="password" placeholder="Mínimo 6 caracteres" className="login-input" style={{paddingLeft: '1rem'}} required 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} />
                            </div>
                            <div className="login-campo">
                                <label className="login-label">Rol del Sistema</label>
                                <select className="login-input" style={{paddingLeft: '1rem'}} 
                                    onChange={e => setNuevoUsuario({...nuevoUsuario, rol_id: e.target.value})}>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.nombre.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                                <button type="submit" className="gp-btn-nuevo" style={{flex: 1}}>Crear Cuenta</button>
                                <button type="button" onClick={() => setMostrarModal(false)} style={{flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '16px', fontWeight: '800'}}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
