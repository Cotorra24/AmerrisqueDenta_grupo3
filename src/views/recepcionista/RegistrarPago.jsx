import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './RegistrarPago.css'

export default function RegistrarPago({ onExito }) {
    const [pacientes, setPacientes] = useState([])
    const [tratamientos, setTratamientos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [seleccion, setSeleccion] = useState({
        paciente_id: null,
        tratamiento_id: null,
        monto: '',
        metodo_pago: 'efectivo',
        notas: ''
    })
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        const fetchPacientes = async () => {
            const { data } = await supabase.from('pacientes').select('*').eq('activo', true)
            setPacientes(data || [])
        }
        fetchPacientes()
    }, [])

    useEffect(() => {
        if (!seleccion.paciente_id) return
        const fetchTratamientos = async () => {
            // Buscar tratamientos completados del paciente que no estén cancelados
            const { data } = await supabase
                .from('tratamientos')
                .select('*, historiales_clinicos!inner(paciente_id)')
                .eq('historiales_clinicos.paciente_id', seleccion.paciente_id)
                .neq('estado', 'cancelado')
            
            setTratamientos(data || [])
        }
        fetchTratamientos()
    }, [seleccion.paciente_id])

    const handlePago = async (e) => {
        e.preventDefault()
        setCargando(true)

        const { error } = await supabase.from('pagos').insert([{
            paciente_id: seleccion.paciente_id,
            tratamiento_id: seleccion.tratamiento_id || null,
            monto: parseFloat(seleccion.monto),
            metodo_pago: seleccion.metodo_pago,
            notas: seleccion.notas,
            fecha_pago: new Date().toISOString().split('T')[0]
        }])

        if (error) {
            alert('Error al registrar pago: ' + error.message)
        } else {
            alert('Pago registrado correctamente')
            onExito()
        }
        setCargando(false)
    }

    const filtrados = pacientes.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.cedula?.includes(busqueda))

    return (
        <div className="rp-container">
            <div className="rp-card">
                <h2>Registrar Nuevo Pago</h2>
                <form onSubmit={handlePago} className="rp-form">
                    <label>Buscar Paciente:</label>
                    <input 
                        type="text" 
                        placeholder="Nombre o cédula..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <select 
                        required
                        value={seleccion.paciente_id || ''} 
                        onChange={(e) => setSeleccion({...seleccion, paciente_id: parseInt(e.target.value), tratamiento_id: null})}
                    >
                        <option value="">Seleccione al paciente...</option>
                        {filtrados.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
                        ))}
                    </select>

                    {seleccion.paciente_id && (
                        <>
                            <label>Tratamiento a Pagar (Opcional):</label>
                            <select 
                                value={seleccion.tratamiento_id || ''} 
                                onChange={(e) => {
                                    const t = tratamientos.find(tr => tr.id === parseInt(e.target.value))
                                    setSeleccion({...seleccion, tratamiento_id: parseInt(e.target.value), monto: t ? t.costo : ''})
                                }}
                            >
                                <option value="">Abono general (sin tratamiento específico)</option>
                                {tratamientos.map(t => (
                                    <option key={t.id} value={t.id}>{t.descripcion} (C$ {t.costo})</option>
                                ))}
                            </select>
                        </>
                    )}

                    <label>Monto a pagar (C$):</label>
                    <input 
                        type="number" 
                        required 
                        placeholder="0.00"
                        value={seleccion.monto}
                        onChange={(e) => setSeleccion({...seleccion, monto: e.target.value})}
                    />

                    <label>Método de Pago:</label>
                    <select 
                        value={seleccion.metodo_pago}
                        onChange={(e) => setSeleccion({...seleccion, metodo_pago: e.target.value})}
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                    </select>

                    <label>Notas:</label>
                    <textarea 
                        placeholder="Número de factura o referencia..."
                        value={seleccion.notas}
                        onChange={(e) => setSeleccion({...seleccion, notas: e.target.value})}
                    />

                    <button type="submit" disabled={cargando || !seleccion.paciente_id}>
                        {cargando ? 'Registrando...' : 'Registrar Pago'}
                    </button>
                </form>
            </div>
        </div>
    )
}
