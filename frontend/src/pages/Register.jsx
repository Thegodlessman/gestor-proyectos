
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { rpcCall } from '../services/api';

// --- Componentes de PrimeReact para la nueva UI ---
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

// Renombramos el componente para consistencia
const RegisterPage = () => {
    // --- Lógica y estados 100% basados en tu código funcional ---
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(null);
    const [validationStatus, setValidationStatus] = useState('validating');
    const [statusMessage, setStatusMessage] = useState('Validando invitación...');
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const toast = useRef(null);
    const navigate = useNavigate();

    // Tu useEffect para validar el token (sin cambios en la lógica)
    useEffect(() => {
        const inviteToken = searchParams.get('invite_token');
        if (!inviteToken) {
            setValidationStatus('invalid');
            setStatusMessage('No se encontró un token de invitación. Por favor, utiliza el enlace que recibiste por correo.');
            return;
        }
        setToken(inviteToken);
        const validateToken = async () => {
            try {
                const response = await rpcCall('invitaciones.validarToken', { token: inviteToken });
                setEmail(response.email);
                setValidationStatus('valid');
                setStatusMessage(`Completa tu registro para: ${response.email}`);
            } catch (error) {
                setValidationStatus('invalid');
                setStatusMessage(error.message);
            }
        };
        validateToken();
    }, [searchParams]);

    // Tu handleSubmit para registrar al usuario (sin cambios en la lógica)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Las contraseñas no coinciden.' });
            return;
        }
        setLoading(true);
        try {
            const result = await rpcCall('auth.register', {
                token_invitacion: token,
                nombre,
                apellido,
                password
            });
            setValidationStatus('success');
            setStatusMessage(result.message);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error en el Registro', detail: error.message });
            setLoading(false);
        }
    };

    // --- Nueva función para renderizar el contenido con la UI mejorada ---
    const renderContent = () => {
        switch (validationStatus) {
            case 'validating':
                return (
                    <div className="text-center">
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
                        <p className="mt-4 text-slate-500">{statusMessage}</p>
                    </div>
                );
            case 'invalid':
                return (
                    <div className="text-center">
                        <i className="pi pi-times-circle text-red-500" style={{ fontSize: '3rem' }}></i>
                        <p className="text-red-500 mt-4">{statusMessage}</p>
                        <Button label="Volver a Iniciar Sesión" className="mt-4" onClick={() => navigate('/login')} />
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <i className="pi pi-check-circle text-green-500" style={{ fontSize: '3rem' }}></i>
                        <p className="text-green-500 mt-4">{statusMessage}</p>
                        <p className='text-slate-500 text-sm'>Ya puedes iniciar sesión con tus nuevas credenciales.</p>
                        <Button label="Ir a Iniciar Sesión" className="mt-4" onClick={() => navigate('/login')} />
                    </div>
                );
            case 'valid':
                return (
                    <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                        <p className="text-center text-slate-500 m-0">{statusMessage}</p>
                        
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon"><i className="pi pi-user"></i></span>
                            <InputText placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="p-inputgroup">
                            <span className="p-inputgroup-addon"><i className="pi pi-user"></i></span>
                            <InputText placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                        </div>
                        
                        <Divider />
                        
                        <Password 
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            toggleMask
                            required
                            feedback // Muestra el medidor de fortaleza
                        />
                        <Password 
                            placeholder="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            toggleMask
                            required
                            feedback={false} // No es necesario aquí
                        />
                        <Button type="submit" label="Completar Registro" loading={loading} />
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex min-h-screen font-sans bg-slate-50 items-center justify-center p-4">
                <Card title="Registro de Nuevo Miembro" className="w-full max-w-lg shadow-2xl">
                    {renderContent()}
                </Card>
            </div>
        </>
    );
}

export default RegisterPage;

// import React, { useState, useEffect } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import { rpcCall } from '../services/api';

// function RegisterPage() {
//     // Hooks de React para manejar el estado y la URL
//     const [searchParams] = useSearchParams();
//     const [token, setToken] = useState(null);

//     // Estados para el flujo de la página
//     const [validationStatus, setValidationStatus] = useState('validating'); // 'validating', 'valid', 'invalid'
//     const [statusMessage, setStatusMessage] = useState('Validando invitación...');
//     const [email, setEmail] = useState(''); // El email vendrá del token validado

//     // Estados para el formulario de registro
//     const [nombre, setNombre] = useState('');
//     const [apellido, setApellido] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
    
//     // useEffect se ejecuta una sola vez cuando el componente carga
//     useEffect(() => {
//         const inviteToken = searchParams.get('invite_token');
//         if (!inviteToken) {
//             setValidationStatus('invalid');
//             setStatusMessage('No se encontró un token de invitación. Por favor, utiliza el enlace que recibiste por correo.');
//             return;
//         }

//         setToken(inviteToken);

//         const validateToken = async () => {
//             try {
//                 const response = await rpcCall('invitaciones.validarToken', { token: inviteToken });
//                 setEmail(response.email); // Guardamos el email validado
//                 setValidationStatus('valid');
//                 setStatusMessage(`Registro para: ${response.email}`);
//             } catch (error) {
//                 setValidationStatus('invalid');
//                 setStatusMessage(error.message);
//             }
//         };

//         validateToken();
//     }, [searchParams]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (password !== confirmPassword) {
//             setStatusMessage('Las contraseñas no coinciden.');
//             return;
//         }
//         try {
//             const result = await rpcCall('auth.register', {
//                 token_invitacion: token,
//                 nombre,
//                 apellido,
//                 password
//             });
//             setValidationStatus('success');
//             setStatusMessage(result.message);
//         } catch (error) {
//             setStatusMessage(error.message);
//         }
//     };

//     // Función para renderizar el contenido según el estado de la validación
//     const renderContent = () => {
//         switch (validationStatus) {
//             case 'validating':
//                 return <p>{statusMessage}</p>;
//             case 'invalid':
//                 return (
//                     <>
//                         <p className="alert alert-danger">{statusMessage}</p>
//                         <Link to="/login">Volver a Iniciar Sesión</Link>
//                     </>
//                 );
//             case 'success':
//                 return (
//                      <>
//                         <p className="alert alert-success">{statusMessage}</p>
//                         <Link to="/login" className="btn btn-primary">Ir a Iniciar Sesión</Link>
//                     </>
//                 );
//             case 'valid':
//                 return (
//                     <form onSubmit={handleSubmit}>
//                         <p className="text-body-secondary text-center">{statusMessage}</p>
//                         {/* El resto de los campos del formulario */}
//                         <div className="mb-3">
//                             <label htmlFor="nombre" className="form-label">Nombre</label>
//                             <input type="text" id="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="apellido" className="form-label">Apellido</label>
//                             <input type="text" id="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="password" className="form-label">Contraseña</label>
//                             <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                         </div>
//                          <div className="mb-3">
//                             <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
//                             <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
//                         </div>
//                         <div className="d-grid">
//                             <button type="submit" className="btn btn-primary">Completar Registro</button>
//                         </div>
//                     </form>
//                 );
//             default:
//                 return null;
//         }
//     }

//     return (
//         <div className="d-flex align-items-center justify-content-center vh-100">
//             <div className="p-4 border rounded-3 bg-dark shadow text-white" style={{ maxWidth: '450px', width: '100%' }}>
//                 <h2 className="text-center mb-4 text-primary">Registro de Nuevo Miembro</h2>
//                 {renderContent()}
//             </div>
//         </div>
//     );
// }

// export default RegisterPage;