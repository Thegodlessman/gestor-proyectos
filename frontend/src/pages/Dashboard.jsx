import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { rpcCall } from '../services/api'; // Importamos nuestra función RPC

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- NUEVOS ESTADOS PARA EL FORMULARIO DE INVITACIÓN ---
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    // --- NUEVA FUNCIÓN PARA ENVIAR INVITACIONES ---
    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setInviteMessage({ type: '', text: '' }); // Limpiamos mensajes previos
        try {
            const result = await rpcCall('invitaciones.crear', { email: inviteEmail });
            setInviteMessage({ type: 'success', text: result.message });
            setInviteEmail(''); // Limpiamos el input
        } catch (error) {
            setInviteMessage({ type: 'danger', text: error.message });
        }
    };

    return (
        <div>
            {/* ... (Navbar existente, no cambia) ... */}
            <div className="container mt-5">
                <h1 className="text-primary-emphasis">Dashboard Principal</h1>
                <p className="text-body-secondary">Bienvenido, {user?.nombre} {user?.apellido}!</p>
                
                <div className="card bg-dark mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Seguridad de la Cuenta</h5>
                        <p className="card-text">Añade o actualiza tus preguntas de seguridad para proteger tu cuenta.</p>
                        <Link to="/seguridad" className="btn btn-primary">Configurar Preguntas</Link>
                    </div>
                </div>

                {/* --- SECCIÓN PARA ADMINISTRADORES --- */}
                {user?.nombre_rol === 'Administrador' && (
                    <div className="card bg-dark mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Gestionar Equipo</h5>
                            <p className="card-text">Invita a nuevos miembros a unirse a tu empresa.</p>
                            <form onSubmit={handleInviteSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="inviteEmail" className="form-label">Correo del nuevo miembro</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        id="inviteEmail"
                                        placeholder="ejemplo@empresa.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success">Enviar Invitación</button>
                            </form>
                            {inviteMessage.text && (
                                <div className={`alert alert-${inviteMessage.type} mt-3`}>
                                    {inviteMessage.text}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;