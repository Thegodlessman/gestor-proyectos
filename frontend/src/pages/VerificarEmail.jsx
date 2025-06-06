import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function VerificarEmailPage() {
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('Verificando...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            fetch(`http://localhost:3000/api/auth/verificar-email?token=${token}`)
                .then(res => res.json())
                .then(data => {
                    setVerificationStatus(data.message);
                })
                .catch(err => {
                    setVerificationStatus('Error al conectar con el servidor.');
                });
        } else {
            setVerificationStatus('Token no encontrado. Por favor, usa el enlace de tu correo.');
        }
    }, [searchParams]);

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
                <h2>Estado de la Verificación</h2>
                <p className="lead">{verificationStatus}</p>
                <Link to="/login" className="btn btn-primary mt-3">Ir a Iniciar Sesión</Link>
            </div>
        </div>
    );
}

export default VerificarEmailPage;