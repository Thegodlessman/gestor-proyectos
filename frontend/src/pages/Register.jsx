import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            const data = await register(nombre, apellido, email, password);
            setSuccessMessage(data.message);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="p-4 border rounded-3 bg-dark shadow" style={{ maxWidth: '450px', width: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center mb-4">Crear Cuenta</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {!successMessage && (
                        <>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input type="text" id="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="apellido" className="form-label">Apellido</label>
                                    <input type="text" id="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                                <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                                <button type="submit" className="btn btn-primary">Registrarse</button>
                            </div>
                        </>
                    )}
                    <p className="text-center mt-3">
                        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
export default RegisterPage;