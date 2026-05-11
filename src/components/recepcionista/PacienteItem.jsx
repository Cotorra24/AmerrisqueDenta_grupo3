export default function PacienteItem({ paciente, onEdit, onToggleActivo }) {
    const calcEdad = (f) => {
        if (!f) return null
        return new Date().getFullYear() - new Date(f).getFullYear()
    }

    const iniciales = (n, a) => `${n?.[0] || ''}${a?.[0] || ''}`.toUpperCase()
    const colores = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#be185d']
    const color = (id) => colores[id % colores.length]

    return (
        <div className={`gp-item ${!paciente.activo ? 'inactivo' : ''}`}>
            <div className="gp-avatar" style={{ background: color(paciente.id) }}>
                {iniciales(paciente.nombre, paciente.apellido)}
            </div>
            <div className="gp-info">
                <div className="gp-nombre-row">
                    <span className="gp-nombre">{paciente.nombre} {paciente.apellido}</span>
                    <span className={`gp-estado-badge ${paciente.activo ? 'activo' : 'inactivo'}`}>
                        {paciente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <span className="gp-detalle">
                    {paciente.cedula || 'Sin cédula'}
                    {calcEdad(paciente.fecha_nacimiento) ? ` · ${calcEdad(paciente.fecha_nacimiento)} años` : ''}
                </span>
            </div>
            <div className="gp-acciones-item">
                <button 
                    className="gp-btn-toggle" 
                    onClick={() => onToggleActivo(paciente)} 
                    title={paciente.activo ? 'Inactivar' : 'Activar'}
                >
                    <span>{paciente.activo ? '🚫' : '✅'}</span>
                </button>
                <button className="gp-btn-editar-item" onClick={() => onEdit(paciente)}>›</button>
            </div>
        </div>
    )
}
