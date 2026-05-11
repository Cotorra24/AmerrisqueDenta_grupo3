export default function PasoSeleccionPaciente({ busqueda, setBusqueda, pacientes, seleccionId, onSelect }) {
    return (
        <div className="ac-paso">
            <h2 className="ac-paso-titulo">Seleccionar paciente</h2>
            <div className="ac-busqueda">
                <span>🔍</span>
                <input 
                    placeholder="Buscar por nombre o cédula..." 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                />
            </div>
            <div className="ac-lista-pacientes">
                {pacientes.map(p => (
                    <div 
                        key={p.id} 
                        className={`ac-paciente-item ${seleccionId === p.id ? 'seleccionado' : ''}`}
                        onClick={() => onSelect(p)}
                    >
                        <div className="ac-pac-avatar">{p.nombre[0]}</div>
                        <div className="ac-pac-info">
                            <p className="ac-pac-nombre">{p.nombre} {p.apellido}</p>
                            <p className="ac-pac-detalle">
                                {p.cedula || 'Sin cédula'} · {p.telefono || 'Sin tel.'}
                            </p>
                        </div>
                        {seleccionId === p.id && <span className="ac-check">✓</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}
