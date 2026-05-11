export default function PacienteModal({ isOpen, isEditing, form, setForm, onClose, onSave, guardando }) {
    if (!isOpen) return null

    return (
        <div className="gp-overlay" onClick={onClose}>
            <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <div className="gp-modal-header">
                    <h2>{isEditing ? 'Editar Paciente' : 'Registrar Paciente'}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="gp-modal-body">
                    <div className="gp-form">
                        <div className="gp-form-row">
                            <Campo 
                                label="Nombre *" 
                                value={form.nombre} 
                                onChange={v => setForm(f => ({ ...f, nombre: v }))} 
                                placeholder="Nombre" 
                            />
                            <Campo 
                                label="Apellido *" 
                                value={form.apellido} 
                                onChange={v => setForm(f => ({ ...f, apellido: v }))} 
                                placeholder="Apellido" 
                            />
                        </div>
                        <div className="gp-form-row">
                            <Campo 
                                label="Cédula" 
                                value={form.cedula} 
                                onChange={v => setForm(f => ({ ...f, cedula: v }))} 
                                placeholder="001-000000-0000X" 
                            />
                            <Campo 
                                label="Teléfono" 
                                value={form.telefono} 
                                onChange={v => setForm(f => ({ ...f, telefono: v }))} 
                                placeholder="8888-1234" 
                            />
                        </div>
                        <Campo 
                            label="Correo electrónico" 
                            value={form.email} 
                            onChange={v => setForm(f => ({ ...f, email: v }))} 
                            placeholder="correo@ejemplo.com" 
                            type="email" 
                        />
                        <div className="gp-form-row">
                            <Campo 
                                label="Fecha de nacimiento" 
                                value={form.fecha_nacimiento} 
                                onChange={v => setForm(f => ({ ...f, fecha_nacimiento: v }))} 
                                type="date" 
                            />
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
                            <textarea 
                                value={form.direccion || ''} 
                                onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} 
                                placeholder="Dirección del paciente" 
                                rows={2} 
                            />
                        </div>
                    </div>
                </div>
                <div className="gp-modal-footer">
                    <button className="gp-btn-cancelar" onClick={onClose}>Cancelar</button>
                    <button
                        className="gp-btn-guardar"
                        onClick={onSave}
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar paciente'}
                    </button>
                </div>
            </div>
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
