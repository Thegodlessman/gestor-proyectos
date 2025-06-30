// src/pages/ForgotPassword.jsx

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Componentes de PrimeReact ---
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Steps } from 'primereact/steps'; // Para mostrar el progreso de los pasos

// Mantenemos el nombre original de tu componente
function ForgotPasswordPage() {
    const navigate = useNavigate();
    const toast = useRef(null);

    // --- Estados 100% basados en tu lógica funcional ---
    const [step, setStep] = useState(0); // Usamos 0-indexed para el componente Steps
    const [email, setEmail] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);

    // Definición de los pasos para el componente visual Steps
    const items = [
        { label: 'Correo' },
        { label: 'Pregunta' },
        { label: 'Nueva Contraseña' }
    ];

    // --- Todas tus funciones de fetch se mantienen intactas ---
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Esta es tu lógica original: si el backend devuelve la pregunta, avanzamos.
            if (data.pregunta_texto) {
                setQuestionText(data.pregunta_texto);
                setResetToken(data.reset_token);
                setStep(1); // Avanzar al siguiente paso
            } else {
                // Si no, mostramos el mensaje informativo que envía el backend.
                toast.current.show({ severity: 'info', summary: 'Información', detail: data.message, life: 6000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/verify-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, respuesta: answer }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setStep(2);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Las contraseñas no coinciden.' });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            // El mensaje de éxito se muestra en el paso final
            setStep(3);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado de cada paso con la nueva UI ---
    const renderStep = () => {
        switch (step) {
            case 0: // Pedir Email
                return (
                    <form onSubmit={handleEmailSubmit} className="flex flex-column gap-4">
                        <p className="text-center text-slate-600 m-0">Ingresa tu correo electrónico para iniciar el proceso de recuperación.</p>
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon"><i className="pi pi-envelope"></i></span>
                            <InputText type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                        </div>
                        <Button type="submit" label="Siguiente" loading={loading} />
                    </form>
                );
            case 1: // Responder Pregunta
                return (
                    <form onSubmit={handleAnswerSubmit} className="flex flex-column gap-4">
                        <div className="text-center">
                            <p className="font-bold text-slate-700">Pregunta de Seguridad:</p>
                            <p className="text-slate-600 m-0">{questionText}</p>
                        </div>
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon"><i className="pi pi-question-circle"></i></span>
                            <InputText placeholder="Tu respuesta secreta" value={answer} onChange={(e) => setAnswer(e.target.value)} required autoFocus />
                        </div>
                        <Button type="submit" label="Verificar Respuesta" loading={loading} />
                    </form>
                );
            case 2: // Poner Nueva Contraseña
                return (
                    <form onSubmit={handlePasswordSubmit} className="flex flex-column gap-4">
                         <Password placeholder="Nueva Contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required toggleMask feedback />
                         <Password placeholder="Confirmar Nueva Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required toggleMask feedback={false} />
                        <Button type="submit" label="Actualizar Contraseña" loading={loading} />
                    </form>
                );
            case 3: // Éxito
                return (
                    <div className="text-center p-4">
                        <i className="pi pi-check-circle text-green-500" style={{ fontSize: '3rem' }}></i>
                        <p className="text-green-700 mt-4 font-semibold">¡Contraseña actualizada con éxito!</p>
                        <Button label="Ir a Iniciar Sesión" className="mt-4" onClick={() => navigate('/login')} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex min-h-screen font-sans bg-slate-50 items-center justify-content-center p-4">
                <Card title="Recuperación de Contraseña" className="w-full max-w-lg shadow-2xl">
                    <Steps model={items} activeIndex={step} className="mb-5" readOnly={true} />
                    {renderStep()}
                    {step < 3 && (
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-sky-600 hover:text-sky-700 no-underline">Volver a Iniciar Sesión</Link>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}

export default ForgotPasswordPage;



// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';

// function ForgotPasswordPage() {
//     const [step, setStep] = useState(1); 
//     const [email, setEmail] = useState('');
//     const [questionText, setQuestionText] = useState('');
//     const [answer, setAnswer] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [resetToken, setResetToken] = useState('');
//     const [message, setMessage] = useState({ type: '', text: '' });

//     const handleEmailSubmit = async (e) => {
//         e.preventDefault();
//         setMessage({ type: '', text: '' });
//         try {
//             const response = await fetch('http://localhost:3000/api/auth/forgot-password/start', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email }),
//             });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message);

//             if (data.pregunta_texto) {
//                 setQuestionText(data.pregunta_texto);
//                 setResetToken(data.reset_token);
//                 setStep(2);
//             } else {
//                 setMessage({ type: 'info', text: data.message });
//             }
//         } catch (error) {
//             setMessage({ type: 'danger', text: error.message });
//         }
//     };

//     const handleAnswerSubmit = async (e) => {
//         e.preventDefault();
//         setMessage({ type: '', text: '' });
//         try {
//             const response = await fetch('http://localhost:3000/api/auth/forgot-password/verify-answer', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ reset_token: resetToken, respuesta: answer }),
//             });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message);
//             setStep(3);
//         } catch (error) {
//             setMessage({ type: 'danger', text: error.message });
//         }
//     };

//     const handlePasswordSubmit = async (e) => {
//         e.preventDefault();
//         if (newPassword !== confirmPassword) {
//             setMessage({ type: 'danger', text: 'Las contraseñas no coinciden.' });
//             return;
//         }
//         setMessage({ type: '', text: '' });
//         try {
//             const response = await fetch('http://localhost:3000/api/auth/forgot-password/finalize', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
//             });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message);
//             setMessage({ type: 'success', text: data.message });
//             setStep(4);
//         } catch (error) {
//             setMessage({ type: 'danger', text: error.message });
//         }
//     };

//     const renderStep = () => {
//         switch (step) {
//             case 1: // Pedir Email
//                 return (
//                     <form onSubmit={handleEmailSubmit}>
//                         <h2 className="text-center mb-4 text-primary">Recuperar Contraseña</h2>
//                         <p className="text-body-secondary text-center">Ingresa tu correo para continuar.</p>
//                         <div className="mb-3">
//                             <label htmlFor="email" className="form-label">Correo Electrónico</label>
//                             <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                         </div>
//                         <button type="submit" className="btn btn-primary w-100">Siguiente</button>
//                     </form>
//                 );
//             case 2: // Responder Pregunta
//                 return (
//                     <form onSubmit={handleAnswerSubmit}>
//                         <h2 className="text-center mb-4 text-primary">Pregunta de Seguridad</h2>
//                         <p className="text-body-secondary">{questionText}</p>
//                         <div className="mb-3">
//                             <label htmlFor="answer" className="form-label">Tu Respuesta</label>
//                             <input type="text" id="answer" className="form-control" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
//                         </div>
//                         <button type="submit" className="btn btn-primary w-100">Verificar Respuesta</button>
//                     </form>
//                 );
//             case 3: // Poner Nueva Contraseña
//                 return (
//                     <form onSubmit={handlePasswordSubmit}>
//                         <h2 className="text-center mb-4 text-primary">Nueva Contraseña</h2>
//                         <div className="mb-3">
//                             <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
//                             <input type="password" id="newPassword" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
//                             <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
//                         </div>
//                         <button type="submit" className="btn btn-primary w-100">Actualizar Contraseña</button>
//                     </form>
//                 );
//             case 4: // Éxito
//                 return (
//                     <div className="text-center">
//                         <h2 className="text-primary">¡Éxito!</h2>
//                         <p className="lead">{message.text}</p>
//                         <Link to="/login" className="btn btn-success">Ir a Iniciar Sesión</Link>
//                     </div>
//                 );
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="d-flex align-items-center justify-content-center vh-100">
//             <div className="p-4 border rounded-3 bg-dark shadow text-white" style={{ maxWidth: '450px', width: '100%' }}>
//                 {message.text && step !== 4 && <div className={`alert alert-${message.type}`}>{message.text}</div>}
//                 {renderStep()}
//                 {step < 4 && <div className="text-center mt-3"><Link to="/login">Volver a Iniciar Sesión</Link></div>}
//             </div>
//         </div>
//     );
// }

// export default ForgotPasswordPage;