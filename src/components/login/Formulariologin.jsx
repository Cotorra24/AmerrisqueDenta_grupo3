import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../database/supabaseconfig';
import '../../App.css';

const FormularioLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarPass, setMostrarPass] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        
        // 1. Intentar Login en Auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            console.error('Error detallado de Supabase:', error);
            let mensaje = 'Error de acceso: ' + error.message;
            
            if (error.status === 400) {
                mensaje += '\n\nPosibles causas:\n1. El usuario no existe en Supabase > Auth.\n2. La contraseña es incorrecta.\n3. Debes confirmar tu email (revisa tu bandeja de entrada o desactiva "Confirm Email" en Supabase Auth Settings).';
            }
            
            alert(mensaje);
            setCargando(false);
            return;
        }

        // 2. Buscar información en la tabla 'usuarios' (Español)
        const { data: usuario, error: errorUser } = await supabase
            .from('usuarios')
            .select('*, roles(nombre)')
            .eq('id', data.user.id)
            .single();

        if (errorUser || !usuario) {
            console.log('Usuario no encontrado en la tabla usuarios, creando perfil por defecto...');
            await supabase.from('usuarios').insert([
                { id: data.user.id, email: data.user.email, nombre: data.user.email.split('@')[0], rol_id: 4 }
            ]);
            navigate('/paciente');
        } else {
            // Redirigir según el rol (1=admin, 2=doctor, 3=recep, 4=paciente)
            const rolId = usuario.rol_id;
            if (rolId === 1) navigate('/admin');
            else if (rolId === 2) navigate('/odontologo');
            else if (rolId === 3) navigate('/recepcionista');
            else navigate('/paciente');
        }

        setCargando(false);
    };

    const rellenarCredenciales = (u, p) => {
        setEmail(u);
        setPassword(p);
    };

    return (
        <div className="login-wrapper">
            <div className="login-card fade-in">
                <div className="login-header" style={{textAlign: 'center', marginBottom: '2.5rem'}}>
                    <div className="login-logo">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}>
                            <path d="M12 2C8 2 5 5 5 9c0 4.5 7 13 7 13s7-8.5 7-13c0-4-3-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                    </div>
                    <h1 className="login-titulo">Amerrisque</h1>
                    <p className="login-subtitulo">Odontología de Vanguardia</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="login-campo">
                        <label className="login-label">Email Corporativo</label>
                        <div className="login-input-wrapper" style={{position: 'relative'}}>
                            <input 
                                type="email" 
                                className="login-input"
                                placeholder="ejemplo@amerrisque.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="login-campo">
                        <label className="login-label">Contraseña</label>
                        <div className="login-input-wrapper" style={{position: 'relative'}}>
                            <input 
                                type={mostrarPass ? "text" : "password"} 
                                className="login-input"
                                placeholder="••••••••"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button 
                                type="button" 
                                className="login-ojo"
                                style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem'}}
                                onClick={() => setMostrarPass(!mostrarPass)}
                            >
                                {mostrarPass ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? 'Verificando...' : 'Iniciar Sesión'} 
                        {!cargando && <span style={{marginLeft: '0.5rem'}}>→</span>}
                    </button>
                </form>

                <div className="login-credenciales" style={{marginTop: '2.5rem'}}>
                    <p className="login-label" style={{textAlign: 'center', marginBottom: '1.25rem'}}>Acceso rápido al equipo</p>
                    <div className="login-credenciales-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="login-cred-item" style={{background: '#f8fafc', padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'}} 
                            onClick={() => rellenarCredenciales('admin@amerrisque.com', 'Admin1234')}>
                            <div style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>👑</div>
                            <span className="login-cred-rol" style={{fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)'}}>ADMIN</span>
                        </div>
                        <div className="login-cred-item" style={{background: '#f8fafc', padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'}} 
                            onClick={() => rellenarCredenciales('recepcion@amerrisque.com', 'Recep1234')}>
                            <div style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>📅</div>
                            <span className="login-cred-rol" style={{fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)'}}>RECEP</span>
                        </div>
                        <div className="login-cred-item" style={{background: '#f8fafc', padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'}} 
                            onClick={() => rellenarCredenciales('doctor@amerrisque.com', 'Doctor1234')}>
                            <div style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>🩺</div>
                            <span className="login-cred-rol" style={{fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)'}}>DOCTOR</span>
                        </div>
                        <div className="login-cred-item" style={{background: '#f8fafc', padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'}} 
                            onClick={() => rellenarCredenciales('paciente@amerrisque.com', 'Paciente1234')}>
                            <div style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>👤</div>
                            <span className="login-cred-rol" style={{fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)'}}>PACIENTE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioLogin;