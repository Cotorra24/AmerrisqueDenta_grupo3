export default function FormularioPago({ 
    servicios, 
    tratamientos = [],
    onSelectServicio, 
    onSelectTratamiento,
    monto, 
    setMonto, 
    metodoPago, 
    setMetodoPago, 
    notas, 
    setNotas, 
    error, 
    guardando, 
    onGuardar 
}) {
    return (
        <>
            {tratamientos.length > 0 && (
                <div className="rp-section">
                    <label>Vincular a Tratamiento Pendiente</label>
                    <select className="rp-select" onChange={e => onSelectTratamiento(tratamientos.find(t => t.id === Number(e.target.value)))}>
                        <option value="">Seleccione un tratamiento</option>
                        {tratamientos.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.servicio?.nombre || t.descripcion} (C$ {t.costo})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="rp-section">
                <label>Servicio (Opcional - para autocompletar monto)</label>
                <select className="rp-select" onChange={e => onSelectServicio(servicios.find(s => s.id === Number(e.target.value)))}>
                    <option value="">Seleccione un servicio</option>
                    {servicios.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} (C$ {s.costo})</option>
                    ))}
                </select>
            </div>

            <div className="rp-section">
                <label>Monto (C$)</label>
                <input 
                    type="number" 
                    className="rp-input"
                    value={monto} 
                    onChange={e => setMonto(e.target.value)} 
                    placeholder="0.00"
                />
            </div>

            <div className="rp-section">
                <label>Método de Pago</label>
                <div className="rp-metodos">
                    {['efectivo', 'tarjeta', 'transferencia'].map(m => (
                        <button 
                            key={m} 
                            className={`rp-metodo-btn ${metodoPago === m ? 'active' : ''}`}
                            onClick={() => setMetodoPago(m)}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rp-section">
                <label>Notas</label>
                <textarea 
                    className="rp-input"
                    value={notas} 
                    onChange={e => setNotas(e.target.value)} 
                    placeholder="Observaciones adicionales..."
                />
            </div>

            {error && <p className="rp-error">{error}</p>}

            <button 
                className="rp-btn-guardar" 
                onClick={onGuardar} 
                disabled={guardando || !monto}
            >
                {guardando ? 'Guardando...' : 'Confirmar Pago'}
            </button>
        </>
    )
}
