import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'

export default function RutaProtegida({ children, rolesPermitidos }) {
    const [estado, setEstado] = useState('cargando')

    useEffect(() => {
        const verificar = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setEstado('no-autorizado'); return }

            // Consultar tabla 'usuarios' (con minúscula como en tu SQL)
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4ff' }}>
                <div className="loading-spinner-global" />
                <style>{`
                    .loading-spinner-global {
                        width: 40px; height: 40px;
                        border: 3px solid #e5e7eb;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 0.7s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        )
    }

    if (estado === 'no-autorizado') return <Navigate to="/" replace />

    return children
}