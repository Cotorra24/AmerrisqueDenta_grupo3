export default function PacienteSelector({ busqueda, setBusqueda, pacientesFiltrados, onSelectPaciente }) {
    return (
        <div className="rp-section">
            <label>Buscar Paciente</label>
            <input 
                className="rp-input"
                placeholder="Nombre o cédula..." 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)} 
            />
            <div className="rp-lista">
                {pacientesFiltrados.map(p => (
                    <div key={p.id} className="rp-item" onClick={() => onSelectPaciente(p)}>
                        {p.nombre} {p.apellido} <small>({p.cedula})</small>
                    </div>
                ))}
            </div>
        </div>
    )
}
