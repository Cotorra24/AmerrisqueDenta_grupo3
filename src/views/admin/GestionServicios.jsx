import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import '../recepcionista/Gestionpacientes.css'

export default function GestionServicios() {
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', descripcion: '' })
    const [mostrarModal, setMostrarModal] = useState(false)

    useEffect(() => {
        fetchServicios()
    }, [])

    const fetchServicios = async () => {
        const { data } = await supabase.from('servicios').select('*').order('nombre')
        setServicios(data || [])
        setCargando(false)
    }

    const handleGuardar = async (e) => {
        e.preventDefault()
        const { error } = await supabase.from('servicios').insert([nuevoServicio])
        if (error) alert('Error al guardar')
        else {
            setNuevoServicio({ nombre: '', precio: '', descripcion: '' })
            setMostrarModal(false)
            fetchServicios()
        }
    }

    return (
        <div className="gp-container fade-in">
            <header className="gp-header">
                <div>
                    <h2 className="logo-text" style={{fontSize: '2rem'}}>Catálogo de Servicios</h2>
                    <p style={{color: 'var(--text-muted)'}}>Gestiona los tratamientos y precios de la clínica</p>
                </div>
                <button className="gp-btn-nuevo" onClick={() => setMostrarModal(true)}>
                    + Nuevo Servicio
                </button>
            </header>

            <div className="cat-grid">
                {servicios.map(s => (
                    <div key={s.id} className="cat-card">
                        <div className="cat-card-icon">🦷</div>
                        <h3 style={{fontSize: '1.4rem', marginBottom: '0.5rem'}}>{s.nombre}</h3>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '3rem'}}>
                            {s.descripcion || 'Sin descripción disponible.'}
                        </p>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span className="cat-price">C$ {s.precio.toLocaleString()}</span>
                            <button style={{background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 'bold'}}>Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="gp-modal-overlay">
                    <div className="gp-modal fade-in" style={{maxWidth: '500px', padding: '2.5rem'}}>
                        <h2 style={{marginBottom: '1.5rem'}}>Agregar Nuevo Servicio</h2>
                        <form onSubmit={handleGuardar}>
                            <div className="login-campo">
                                <label className="login-label">Nombre del Servicio</label>
                                <input 
                                    className="login-input" 
                                    style={{paddingLeft: '1rem'}}
                                    value={nuevoServicio.nombre}
                                    onChange={e => setNuevoServicio({...nuevoServicio, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="login-campo">
                                <label className="login-label">Precio (C$)</label>
                                <input 
                                    type="number" 
                                    className="login-input" 
                                    style={{paddingLeft: '1rem'}}
                                    value={nuevoServicio.precio}
                                    onChange={e => setNuevoServicio({...nuevoServicio, precio: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="login-campo">
                                <label className="login-label">Descripción</label>
                                <textarea 
                                    className="login-input" 
                                    style={{paddingLeft: '1rem', height: '100px', paddingTop: '0.8rem'}}
                                    value={nuevoServicio.descripcion}
                                    onChange={e => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})}
                                />
                            </div>
                            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                                <button type="submit" className="gp-btn-nuevo" style={{flex: 1}}>Guardar</button>
                                <button type="button" onClick={() => setMostrarModal(false)} style={{flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '16px', fontWeight: '800'}}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
