export default function CitaHeader({ onVolver, rolCreador }) {
    return (
        <div className="ac-header">
            {onVolver && <button className="ac-volver" onClick={onVolver}>←</button>}
            <div>
                <h1 className="ac-titulo">Agendar Cita</h1>
                <p className="ac-subtitulo">
                    {rolCreador === 'paciente' 
                        ? 'Reserva tu próxima consulta' 
                        : 'Programar consulta para paciente'}
                </p>
            </div>
        </div>
    )
}
