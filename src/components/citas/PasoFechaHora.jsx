export default function PasoFechaHora({ 
    rolCreador, 
    pacienteNombre, 
    fechaSeleccionada, 
    horaSeleccionada, 
    proximosDias, 
    diasSemana, 
    meses, 
    horarios, 
    onSelectFecha, 
    onSelectHora, 
    horaOcupada 
}) {
    return (
        <div className="ac-paso">
            <h2 className="ac-paso-titulo">Fecha y horario</h2>
            {rolCreador === 'recepcionista' && pacienteNombre && (
                <div className="ac-paciente-seleccionado">
                    <div className="ac-pac-avatar">{pacienteNombre[0]}</div>
                    <span>{pacienteNombre}</span>
                </div>
            )}

            <p className="ac-sub-label">Selecciona una fecha</p>
            <div className="ac-fechas">
                {proximosDias.map(d => {
                    const iso = d.toISOString().split('T')[0]
                    return (
                        <div 
                            key={iso} 
                            className={`ac-fecha-item ${fechaSeleccionada === iso ? 'seleccionado' : ''}`}
                            onClick={() => onSelectFecha(iso)}
                        >
                            <span className="ac-fecha-dia">{diasSemana[d.getDay()]}</span>
                            <span className="ac-fecha-num">{d.getDate()}</span>
                            <span className="ac-fecha-mes">{meses[d.getMonth()]}</span>
                        </div>
                    )
                })}
            </div>

            {fechaSeleccionada && (
                <>
                    <p className="ac-sub-label">Horarios disponibles</p>
                    <div className="ac-horarios">
                        {horarios.map(h => {
                            const ocupado = horaOcupada(h)
                            return (
                                <div 
                                    key={h}
                                    className={`ac-hora ${horaSeleccionada === h ? 'seleccionado' : ''} ${ocupado ? 'ocupado' : ''}`}
                                    onClick={() => !ocupado && onSelectHora(h)}
                                >
                                    {h}
                                </div>
                            )
                        })}
                    </div>
                    <div className="ac-leyenda">
                        <span className="ac-ley-item">
                            <span className="ac-ley-circulo disponible" /> Disponible
                        </span>
                        <span className="ac-ley-item">
                            <span className="ac-ley-circulo ocupado" /> Ocupado
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}
