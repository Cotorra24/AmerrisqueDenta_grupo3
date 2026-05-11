export default function PasoDetalles({ 
    odontologos, 
    servicios, 
    odontologoId, 
    servicioId, 
    notas, 
    onSelectOdontologo, 
    onSelectServicio, 
    onNotasChange 
}) {
    return (
        <div className="ac-paso">
            <h2 className="ac-paso-titulo">Odontólogo</h2>
            <div className="ac-lista-od">
                {odontologos.map(o => (
                    <div 
                        key={o.id} 
                        className={`ac-od-item ${odontologoId === o.id ? 'seleccionado' : ''}`}
                        onClick={() => onSelectOdontologo(o)}
                    >
                        <div className="ac-od-avatar">👤</div>
                        <div>
                            <p className="ac-od-nombre">Dr. {o.usuarios?.nombre} {o.usuarios?.apellido}</p>
                            <p className="ac-od-esp">{o.especialidad}</p>
                        </div>
                        {odontologoId === o.id && <span className="ac-check">✓</span>}
                    </div>
                ))}
            </div>

            <h2 className="ac-paso-titulo" style={{ marginTop: '1rem' }}>Tipo de tratamiento</h2>
            <div className="ac-servicios">
                {servicios.map(s => (
                    <div 
                        key={s.id} 
                        className={`ac-servicio-tag ${servicioId === s.id ? 'seleccionado' : ''}`}
                        onClick={() => onSelectServicio(s)}
                    >
                        {s.nombre}
                    </div>
                ))}
            </div>

            <h2 className="ac-paso-titulo" style={{ marginTop: '1rem' }}>Notas adicionales (opcional)</h2>
            <textarea 
                className="ac-notas" 
                placeholder="Describe brevemente el motivo de tu consulta..." 
                value={notas} 
                onChange={e => onNotasChange(e.target.value)} 
                rows={3} 
            />
        </div>
    )
}
