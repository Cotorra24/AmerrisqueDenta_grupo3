import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './PacientesOdontologo.css'

export default function PacientesOdontologo({ onVolver }) {
    const [pacientes, setPacientes] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtro, setFiltro] = useState('todos')
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data } = await supabase
                .from('pacientes')
                .select('id, nombre, apellido, cedula, telefono, fecha_nacimiento, activo, historiales_clinicos(id), tratamientos:historiales_clinicos(tratamientos(id))')
                .eq('activo', true)
                .order('nombre')
            setPacientes(data || [])
            setCargando(false)
        }
        cargar()
    }, [])

    const filtrados = pacientes.filter(p => {
        const q = busqueda.toLowerCase()
        return p.nombre?.toLowerCase().includes(q) || p.apellido?.toLowerCase().includes(q) || p.cedula?.toLowerCase().includes(q)
    })

    const calcEdad = (f) => { if (!f) return null; return new Date().getFullYear() - new Date(f).getFullYear() }
    const iniciales = (n, a) => `${n?.[0] || ''}${a?.[0] || ''}`.toUpperCase()
    const colores = ['#2563eb', '#059659', '#d97706', '#7c3aed', '#dc2626', '#0891b2']
    const color = (id) => colores[id % colores.length]

    return (
        <div className="po-wrapper">
            <div className="po-header">
                {onVolver && <button className="po-volver" onClick={onVolver}>←</button>}
                <div>
                    <h1 className="po-titulo">Mis Pacientes</h1>
                    <p className="po-subtitulo">{filtrados.length} paciente(s) encontrado(s)</p>
                </div>
            </div>

            <div className="po-busqueda-wrap">
                <div className="po-busqueda">
                    <span>🔍</span>
                    <input placeholder="Buscar paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
            </div>

            <div className="po-filtros">
                <button className={`po-filtro ${filtro === 'todos' ? 'activo' : ''}`} onClick={() => setFiltro('todos')}>Todos ({pacientes.length})</button>
                <button className={`po-filtro ${filtro === 'historial' ? 'activo' : ''}`} onClick={() => setFiltro('historial')}>Con historial</button>
            </div>

            <div className="po-lista">
                {cargando ? <div className="po-cargando"><div className="po-spinner" /></div>
                    : filtrados.length === 0 ? <p className="po-vacio">No se encontraron pacientes</p>
                        : filtrados.map(p => {
                            const numHistoriales = p.historiales_clinicos?.length || 0
                            return (
                                <div key={p.id} className="po-item">
                                    <div className="po-avatar" style={{ background: color(p.id) }}>{iniciales(p.nombre, p.apellido)}</div>
                                    <div className="po-info">
                                        <div className="po-nombre-row">
                                            <span className="po-nombre">{p.nombre} {p.apellido}</span>
                                            {numHistoriales > 0 && <span className="po-registros">{numHistoriales} registro(s)</span>}
                                        </div>
                                        <span className="po-detalle">{calcEdad(p.fecha_nacimiento) ? `${calcEdad(p.fecha_nacimiento)} años` : ''}{p.cedula ? ` · ${p.cedula}` : ''}</span>
                                        <div className="po-acciones-item">
                                            <button className="po-btn-historial">📋 Ver historial</button>
                                            <button className="po-btn-consulta">📅 Nueva consulta</button>
                                            {p.telefono && <span className="po-tel">📞 {p.telefono}</span>}
                                        </div>
                                    </div>
                                    <span className="po-arrow">›</span>
                                </div>
                            )
                        })}
            </div>
        </div>
    )
}