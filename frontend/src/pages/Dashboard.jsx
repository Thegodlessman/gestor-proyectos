import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    return (
        <div>

            <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-body">
                <div className="container-fluid">
                    <span className="navbar-brand text-primary">Gestor de Proyectos</span>
                    <div className="d-flex align-items-center">
                        <span className="navbar-text me-3 text-white">
                            Bienvenido, {user?.nombre || ''} {user?.apellido || ''}
                        </span>
                        <button className="btn btn-outline-primary" onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                </div>
            </nav>
            <div className="container mt-5">
                <h1 className="text-primary-emphasis">Dashboard Principal</h1>
                <p className="text-body-secondary">¡Has iniciado sesión correctamente!</p>
            </div>
            <div className="card bg-dark mt-4">
                <div className="card-body">
                    <h5 className="card-title">Seguridad de la Cuenta</h5>
                    <p className="card-text">Añade o actualiza tus preguntas de seguridad para proteger tu cuenta.</p>
                    <Link to="/seguridad" className="btn btn-primary">Configurar Preguntas</Link>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;