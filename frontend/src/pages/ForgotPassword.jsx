import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            if (data.pregunta_texto) {
                setQuestionText(data.pregunta_texto);
                setResetToken(data.reset_token);
                setStep(2);
            } else {
                setMessage({ type: 'info', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/verify-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, respuesta: answer }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setStep(3);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'Las contraseñas no coinciden.' });
            return;
        }
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setMessage({ type: 'success', text: data.message });
            setStep(4);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Pedir Email
                return (
                    <form onSubmit={handleEmailSubmit}>
                        <h2 className="text-center mb-4 text-primary">Recuperar Contraseña</h2>
                        <p className="text-body-secondary text-center">Ingresa tu correo para continuar.</p>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo Electrónico</label>
                            <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Siguiente</button>
                    </form>
                );
            case 2: // Responder Pregunta
                return (
                    <form onSubmit={handleAnswerSubmit}>
                        <h2 className="text-center mb-4 text-primary">Pregunta de Seguridad</h2>
                        <p className="text-body-secondary">{questionText}</p>
                        <div className="mb-3">
                            <label htmlFor="answer" className="form-label">Tu Respuesta</label>
                            <input type="text" id="answer" className="form-control" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Verificar Respuesta</button>
                    </form>
                );
            case 3: // Poner Nueva Contraseña
                return (
                    <form onSubmit={handlePasswordSubmit}>
                        <h2 className="text-center mb-4 text-primary">Nueva Contraseña</h2>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                            <input type="password" id="newPassword" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Actualizar Contraseña</button>
                    </form>
                );
            case 4: // Éxito
                return (
                    <div className="text-center">
                        <h2 className="text-primary">¡Éxito!</h2>
                        <p className="lead">{message.text}</p>
                        <Link to="/login" className="btn btn-success">Ir a Iniciar Sesión</Link>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="p-4 border rounded-3 bg-dark shadow text-white" style={{ maxWidth: '450px', width: '100%' }}>
                {message.text && step !== 4 && <div className={`alert alert-${message.type}`}>{message.text}</div>}
                {renderStep()}
                {step < 4 && <div className="text-center mt-3"><Link to="/login">Volver a Iniciar Sesión</Link></div>}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;