export default function PacienteFiltros({ busqueda, setBusqueda, filtro, setFiltro, total, activos, inactivos }) {
    return (
        <>
            <div className="gp-busqueda-wrapper">
                <div className="gp-busqueda">
                    <span>🔍</span>
                    <input
                        placeholder="Buscar por nombre, cédula o teléfono..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="gp-busqueda-input"
                    />
                </div>
            </div>

            <div className="gp-filtros">
                {[
                    { id: 'todos', label: 'Todos', count: total },
                    { id: 'activos', label: 'Activos', count: activos },
                    { id: 'inactivos', label: 'Inactivos', count: inactivos }
                ].map(f => (
                    <button
                        key={f.id}
                        className={`gp-filtro ${filtro === f.id ? 'activo' : ''}`}
                        onClick={() => setFiltro(f.id)}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>
        </>
    )
}
