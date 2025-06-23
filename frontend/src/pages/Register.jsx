// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { rpcCall } from '../services/api';

function RegisterPage() {
    // Hooks de React para manejar el estado y la URL
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(null);

    // Estados para el flujo de la página
    const [validationStatus, setValidationStatus] = useState('validating'); // 'validating', 'valid', 'invalid'
    const [statusMessage, setStatusMessage] = useState('Validando invitación...');
    const [email, setEmail] = useState(''); // El email vendrá del token validado

    // Estados para el formulario de registro
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // useEffect se ejecuta una sola vez cuando el componente carga
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
                setEmail(response.email); // Guardamos el email validado
                setValidationStatus('valid');
                setStatusMessage(`Registro para: ${response.email}`);
            } catch (error) {
                setValidationStatus('invalid');
                setStatusMessage(error.message);
            }
        };

        validateToken();
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatusMessage('Las contraseñas no coinciden.');
            return;
        }
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
            setStatusMessage(error.message);
        }
    };

    // Función para renderizar el contenido según el estado de la validación
    const renderContent = () => {
        switch (validationStatus) {
            case 'validating':
                return <p>{statusMessage}</p>;
            case 'invalid':
                return (
                    <>
                        <p className="alert alert-danger">{statusMessage}</p>
                        <Link to="/login">Volver a Iniciar Sesión</Link>
                    </>
                );
            case 'success':
                return (
                     <>
                        <p className="alert alert-success">{statusMessage}</p>
                        <Link to="/login" className="btn btn-primary">Ir a Iniciar Sesión</Link>
                    </>
                );
            case 'valid':
                return (
                    <form onSubmit={handleSubmit}>
                        <p className="text-body-secondary text-center">{statusMessage}</p>
                        {/* El resto de los campos del formulario */}
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <input type="text" id="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="apellido" className="form-label">Apellido</label>
                            <input type="text" id="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                         <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                            <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Completar Registro</button>
                        </div>
                    </form>
                );
            default:
                return null;
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="p-4 border rounded-3 bg-dark shadow text-white" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 className="text-center mb-4 text-primary">Registro de Nuevo Miembro</h2>
                {renderContent()}
            </div>
        </div>
    );
}

export default RegisterPage;