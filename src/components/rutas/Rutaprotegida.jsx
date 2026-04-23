import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'

export default function RutaProtegida({ children, rolesPermitidos }) {
    const [estado, setEstado] = useState('cargando') // 'cargando' | 'autorizado' | 'no-autorizado'

    useEffect(() => {
        const verificar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setEstado('no-autorizado'); return }

            const { data: usuario } = await supabase
                .from('usuarios')
                .select('rol_id')
                .eq('id', user.id)
                .single()

            if (!usuario) { setEstado('no-autorizado'); return }

            if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol_id)) {
                setEstado('no-autorizado')
                return
            }
            setEstado('autorizado')
        }
        verificar()
    }, [rolesPermitidos])

    if (estado === 'cargando') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (estado === 'no-autorizado') return <Navigate to="/" replace />

    return children
}