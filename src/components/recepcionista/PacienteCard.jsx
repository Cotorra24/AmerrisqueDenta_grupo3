export default function PacienteCard({ paciente, onCambiar }) {
    return (
        <div className="rp-paciente-card">
            <span>👤</span>
            <div>
                <p><b>{paciente.nombre} {paciente.apellido}</b></p>
                <p><small>{paciente.cedula}</small></p>
            </div>
            <button onClick={onCambiar}>Cambiar</button>
        </div>
    )
}
