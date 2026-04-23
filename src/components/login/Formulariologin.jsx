import { useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './FormularioLogin.css'

export default function FormularioLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setCargando(true)
        setError('')

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError('Correo o contraseña incorrectos')
            setCargando(false)
            return
        }

        // Obtener rol del usuario
        const { data: usuario, error: userError } = await supabase
            .from('usuarios')
            .select('rol_id, primer_login, nombre')
            .eq('id', data.user.id)
            .single()

        if (userError || !usuario) {
            setError('No se encontró información del usuario')
            await supabase.auth.signOut()
            setCargando(false)
            return
        }

        // Redirigir según rol
        const rutas = {
            1: '/admin',
            2: '/odontologo',
            3: '/recepcionista',
            4: '/paciente',
        }

        window.location.href = rutas[usuario.rol_id] || '/'
    }

    return (
        <div className="login-wrapper">
            {/* Fondo diagonal */}
            <div className="login-bg">
                <div className="login-bg-top" />
                <div className="login-bg-bottom" />
            </div>

            {/* Header con logo */}
            <div className="login-header">
                <div className="login-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                </div>
                <h1 className="login-titulo">Amerrisque Dental</h1>
                <p className="login-subtitulo">Tu sonrisa, nuestra misión</p>
            </div>

            {/* Card del formulario */}
            <div className="login-card">
                <h2 className="login-card-titulo">Bienvenido de vuelta</h2>
                <p className="login-card-subtitulo">Inicia sesión para continuar</p>

                <form onSubmit={handleLogin} className="login-form">
                    {/* Email */}
                    <div className="login-campo">
                        <label className="login-label">Correo electrónico</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-10 7L2 7" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                className="login-input"
                                placeholder="correo@amerrisque.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className="login-campo">
                        <label className="login-label">Contraseña</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-ojo"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="login-olvide">
                            <a href="#">¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="login-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? (
                            <span className="login-spinner" />
                        ) : (
                            <>
                                Iniciar Sesión
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Credenciales de acceso */}
                <div className="login-credenciales">
                    <p className="login-credenciales-titulo">Credenciales de acceso</p>
                    <div className="login-credenciales-grid">
                        <div className="login-cred-item" onClick={() => { setEmail('admin@amerrisque.com'); setPassword('Admin1234') }}>
                            <span className="login-cred-icon admin">⚙️</span>
                            <div>
                                <p className="login-cred-rol">Administrador</p>
                                <p className="login-cred-desc">Reportes y gestión total</p>
                            </div>
                        </div>
                        <div className="login-cred-item" onClick={() => { setEmail('recepcion@amerrisque.com'); setPassword('Recep1234') }}>
                            <span className="login-cred-icon recep">📋</span>
                            <div>
                                <p className="login-cred-rol">Recepcionista</p>
                                <p className="login-cred-desc">Gestión de agenda y pagos</p>
                            </div>
                        </div>
                        <div className="login-cred-item" onClick={() => { setEmail('doctor@amerrisque.com'); setPassword('Doctor1234') }}>
                            <span className="login-cred-icon doctor">🦷</span>
                            <div>
                                <p className="login-cred-rol">Odontólogo</p>
                                <p className="login-cred-desc">Historial clínico y citas</p>
                            </div>
                        </div>
                        <div className="login-cred-item" onClick={() => { setEmail('paciente@amerrisque.com'); setPassword('Paciente1234') }}>
                            <span className="login-cred-icon paciente">👤</span>
                            <div>
                                <p className="login-cred-rol">Paciente</p>
                                <p className="login-cred-desc">Ver citas y mi historial</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}