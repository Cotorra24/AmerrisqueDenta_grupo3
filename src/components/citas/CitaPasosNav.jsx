export default function CitaPasosNav({ pasos, pasoActual }) {
    return (
        <div className="ac-pasos">
            {pasos.map((p, i) => {
                const num = i + 1
                const activo = num === pasoActual
                const completado = num < pasoActual
                return (
                    <div key={p} className="ac-paso-item">
                        <div className={`ac-paso-circulo ${activo ? 'activo' : completado ? 'completado' : ''}`}>
                            {completado ? '✓' : num}
                        </div>
                        <span className={`ac-paso-label ${activo ? 'activo' : ''}`}>{p}</span>
                        {i < pasos.length - 1 && <div className={`ac-paso-linea ${completado ? 'completada' : ''}`} />}
                    </div>
                )
            })}
        </div>
    )
}
