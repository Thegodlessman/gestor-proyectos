
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';

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
            <div className="flex min-h-screen font-sans">
                
            
                <div 
                    className="hidden lg:flex lg:w-7 bg-cover bg-center p-8 flex-col justify-between"
                    style={{ backgroundImage: `url('/login-bg')` }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-sky-700 opacity-80 z-0 lg:w-7"></div>
                    <div className="z-10">
                        <div className="flex align-items-center text-white">
                            <i className="pi pi-chart-line" style={{ fontSize: '2.5rem' }}></i>
                            <span className="text-4xl font-bold ml-3">Proyectify</span>
                        </div>
                        <p className="text-2xl text-sky-100 mt-8 line-height-3">
                            Transforma tus ideas en resultados. El éxito de tu próximo proyecto comienza aquí.
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-5 p-8 flex items-center justify-content-center bg-slate-50">
                    <div className="w-full" style={{ maxWidth: '28rem' }}>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
                            <p className="mt-2 text-slate-500">Inicia sesión para acceder a tus proyectos.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-column gap-5">
                            <span className="p-float-label">
                                <InputText 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full"
                                    required
                                />
                                <label htmlFor="email">Correo Electrónico</label>
                            </span>

                            <span className="p-float-label">
                                <Password 
                                    inputId="password"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full"
                                    inputClassName="w-full"
                                    toggleMask
                                    feedback={false}
                                    required
                                />
                                <label htmlFor="password">Contraseña</label>
                            </span>
                            
                            <div className="flex items-center justify-content-between">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberMe" onChange={e => setRememberMe(e.checked)} checked={rememberMe}></Checkbox>
                                    <label htmlFor="rememberMe" className="ml-2">Recordarme</label>
                                </div>
                                <Link to="/forgot-password" className="font-medium text-sm text-sky-600 hover:text-sky-700 no-underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <Button 
                                type="submit"
                                label={loading ? 'Iniciando...' : 'Ingresar'} 
                                icon="pi pi-sign-in" 
                                className="w-full justify-content-center" 
                                loading={loading} 
                            />
                            
                            <div className="text-center text-slate-500">
                                ¿No tienes una cuenta? <Link to="/register" className="font-medium text-sky-600 hover:text-sky-700 no-underline">Regístrate</Link>
                            </div>
                        </form>
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