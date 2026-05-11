export default function PasoResumen({ rolCreador, seleccion, error }) {
    return (
        <div className="ac-paso">
            <h2 className="ac-paso-titulo">
                {rolCreador === 'paciente' ? 'Resumen de tu cita' : 'Confirmar cita'}
            </h2>
            <div className="ac-resumen">
                {rolCreador === 'recepcionista' && (
                    <div className="ac-resumen-item">
                        <span className="ac-res-icon">👤</span>
                        <div>
                            <p className="ac-res-label">Paciente</p>
                            <p className="ac-res-valor">{seleccion.paciente_nombre}</p>
                        </div>
                    </div>
                )}
                <div className="ac-resumen-item">
                    <span className="ac-res-icon">📅</span>
                    <div>
                        <p className="ac-res-label">Fecha</p>
                        <p className="ac-res-valor">{seleccion.fecha}</p>
                    </div>
                </div>
                <div className="ac-resumen-item">
                    <span className="ac-res-icon">⏰</span>
                    <div>
                        <p className="ac-res-label">Hora</p>
                        <p className="ac-res-valor">{seleccion.hora}</p>
                    </div>
                </div>
                <div className="ac-resumen-item">
                    <span className="ac-res-icon">🦷</span>
                    <div>
                        <p className="ac-res-label">Odontólogo</p>
                        <p className="ac-res-valor">{seleccion.odontologo_nombre || 'No seleccionado'}</p>
                    </div>
                </div>
                {seleccion.servicio_nombre && (
                    <div className="ac-resumen-item">
                        <span className="ac-res-icon">💊</span>
                        <div>
                            <p className="ac-res-label">Tratamiento</p>
                            <p className="ac-res-valor">{seleccion.servicio_nombre}</p>
                        </div>
                    </div>
                )}
                {seleccion.notas && (
                    <div className="ac-resumen-item">
                        <span className="ac-res-icon">📝</span>
                        <div>
                            <p className="ac-res-label">Notas</p>
                            <p className="ac-res-valor">{seleccion.notas}</p>
                        </div>
                    </div>
                )}
            </div>

            {rolCreador === 'paciente' && (
                <div className="ac-aviso">
                    <span>ℹ️</span>
                    <p>Recibirás una confirmación. Si necesitas cancelar, hazlo con al menos 24 horas de anticipación.</p>
                </div>
            )}

            {error && <p className="ac-error">{error}</p>}
        </div>
    )
}
