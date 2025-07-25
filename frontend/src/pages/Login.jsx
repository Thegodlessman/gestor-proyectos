
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import logoUrl from '../layouts/proyectify.svg';

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error de Autenticación', 
                detail: err.message 
            });
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (isAuthenticated) {
            toast.current.show({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Inicio de sesión correcto. Redirigiendo...' 
            });
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <Toast ref={toast} />
            <div className="flex min-h-screen font-sans bg-gradient-to-br from-slate-50 to-sky-50">
                
                {/* Panel Izquierdo - Hero Section */}
                <div className="hidden lg:flex lg:w-7 relative overflow-hidden">
                    {/* Fondo con gradiente y patrón */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-800"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full" 
                             style={{
                                 backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
                                 backgroundSize: '50px 50px'
                             }}>
                        </div>
                    </div>
                    
                    <div className="relative z-10 p-12 flex flex-column justify-between h-full">
                        {/* Logo y Título */}
                        <div>
                            <div className="flex align-items-center text-white mb-8">
                                <img src={logoUrl} alt="Proyectify Logo" className="w-4rem h-4rem mr-4" style={{ filter: 'brightness(0) invert(1)' }} />
                                <span className="text-5xl font-bold">Proyectify</span>
                            </div>
                            
                            <div className="text-white">
                                <h1 className="text-4xl font-bold mb-6 line-height-3">
                                    Transforma tus ideas en resultados extraordinarios
                                </h1>
                                <p className="text-xl text-sky-100 line-height-3 mb-8">
                                    La plataforma integral para gestionar proyectos, colaborar en equipo y alcanzar el éxito. 
                                    Tu próximo gran logro comienza aquí.
                                </p>
                            </div>
                        </div>

                        {/* Features destacados */}
                        <div className="text-white">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex align-items-center">
                                    <div className="w-3rem h-3rem bg-white bg-opacity-20 border-round-lg flex align-items-center justify-content-center mr-4">
                                        <i className="pi pi-users text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Colaboración en Tiempo Real</h3>
                                        <p className="text-sky-100 text-sm">Trabaja con tu equipo sin límites</p>
                                    </div>
                                </div>
                                
                                <div className="flex align-items-center">
                                    <div className="w-3rem h-3rem bg-white bg-opacity-20 border-round-lg flex align-items-center justify-content-center mr-4">
                                        <i className="pi pi-chart-line text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Seguimiento Inteligente</h3>
                                        <p className="text-sky-100 text-sm">Visualiza el progreso en tiempo real</p>
                                    </div>
                                </div>
                                
                                <div className="flex align-items-center">
                                    <div className="w-3rem h-3rem bg-white bg-opacity-20 border-round-lg flex align-items-center justify-content-center mr-4">
                                        <i className="pi pi-shield text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Seguridad Garantizada</h3>
                                        <p className="text-sky-100 text-sm">Tus datos protegidos siempre</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Formulario de Login */}
                <div className="w-full lg:w-5 flex align-items-center justify-content-center p-6">
                    <div className="w-full" style={{ maxWidth: '28rem' }}>
                        
                        {/* Logo móvil */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="flex align-items-center justify-content-center mb-4">
                                <img src={logoUrl} alt="Proyectify Logo" className="w-3rem h-3rem mr-3" />
                                <span className="text-3xl font-bold text-slate-800">Proyectify</span>
                            </div>
                        </div>

                        <Card className="shadow-4 border-round-2xl overflow-hidden">
                            <div className="p-6">
                                {/* Header del formulario */}
                                <div className="text-center mb-6">
                                    <div className="w-4rem h-4rem bg-sky-100 border-round-2xl flex align-items-center justify-content-center mx-auto mb-4">
                                        <i className="pi pi-sign-in text-sky-600 text-2xl"></i>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Bienvenido de nuevo!</h2>
                                    <p className="text-slate-500 text-lg">Inicia sesión para continuar con tus proyectos</p>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                                    {/* Campo Email */}
                                    <div className="field">
                                        <span className="p-float-label">
                                            <InputText 
                                                id="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                className="w-full p-3 text-lg border-round-lg"
                                                style={{ fontSize: '1rem' }}
                                                required
                                            />
                                            <label htmlFor="email" className="text-slate-600">Correo Electrónico</label>
                                        </span>
                                    </div>

                                    {/* Campo Password */}
                                    <div className="field">
                                        <span className="p-float-label">
                                            <Password 
                                                inputId="password"
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                className="w-full"
                                                inputClassName="w-full p-3 text-lg border-round-lg"
                                                inputStyle={{ fontSize: '1rem' }}
                                                toggleMask
                                                feedback={false}
                                                required
                                            />
                                            <label htmlFor="password" className="text-slate-600">Contraseña</label>
                                        </span>
                                    </div>
                                    
                                    {/* Recordarme y Olvidé contraseña */}
                                    <div className="flex align-items-center justify-content-between mb-2">
                                        <div className="flex align-items-center">
                                            <Checkbox 
                                                inputId="rememberMe" 
                                                onChange={e => setRememberMe(e.checked)} 
                                                checked={rememberMe}
                                                className="mr-2"
                                            />
                                            <label htmlFor="rememberMe" className="text-slate-600 cursor-pointer">Recordarme</label>
                                        </div>
                                        <Link 
                                            to="/forgot-password" 
                                            className="font-medium text-sky-600 hover:text-sky-700 no-underline transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    {/* Botón de Login */}
                                    <Button 
                                        type="submit"
                                        label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} 
                                        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                                        className="w-full justify-content-center p-3 text-lg font-semibold border-round-lg bg-sky-600 hover:bg-sky-700 transition-colors"
                                        loading={loading}
                                        disabled={loading}
                                    />
                                    
                                  </form>
                            </div>
                        </Card>

                        {/* Footer */}
                        <div className="text-center mt-6">
                            <p className="text-slate-400 text-sm">
                                © 2024 Proyectify. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;

// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// function LoginPage() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         try {
//             await login(email, password);
//             navigate('/dashboard');
//         } catch (err) {
//             setError(err.message);
//         }
//     };

//     return (
//         <div className="d-flex align-items-center justify-content-center vh-100">
//             <div className="p-4 border rounded-3 bg-dark shadow" style={{ maxWidth: '450px', width: '100%' }}>
//                 <form onSubmit={handleSubmit}>
//                     <h2 className="text-center mb-4 text-primary">Iniciar Sesión</h2>
//                     {error && <div className="alert alert-danger">{error}</div>}
//                     <div className="mb-3">
//                         <label htmlFor="email" className="form-label">Correo Electrónico</label>
//                         <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                     </div>
//                     <div className="mb-3">
//                         <label htmlFor="password" className="form-label">Contraseña</label>
//                         <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                     </div>
//                     <div className="d-grid">
//                         <button type="submit" className="btn btn-primary">Ingresar</button>
//                     </div>
//                     <div className="text-center mt-2">
//                         <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
//                     </div>
//                     <p className="text-center mt-3">
//                         ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
//                     </p>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default LoginPage;