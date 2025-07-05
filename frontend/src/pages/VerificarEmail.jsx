
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

function VerificarEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState({ 
        type: 'loading', 
        message: 'Verificando tu correo electrónico...' 
    });

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            fetch(`http://localhost:3000/api/auth/verificar-email?token=${token}`)
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => Promise.reject(err));
                    }
                    return res.json();
                })
                .then(data => {
                    setStatus({ type: 'success', message: data.message });
                })
                .catch(err => {
                    setStatus({ type: 'error', message: err.message || 'Error al conectar con el servidor.' });
                });
        } else {
            setStatus({ type: 'error', message: 'Token no encontrado. Por favor, usa el enlace de tu correo.' });
        }
    }, [searchParams]);

    const renderIcon = () => {
        if (status.type === 'loading') {
            return <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />;
        }
        if (status.type === 'success') {
            return <i className="pi pi-check-circle text-green-500" style={{ fontSize: '3rem' }}></i>;
        }
        if (status.type === 'error') {
            return <i className="pi pi-times-circle text-red-500" style={{ fontSize: '3rem' }}></i>;
        }
        return null;
    };

    return (
        <div className="flex min-h-screen font-sans bg-slate-50 items-center justify-content-center p-4">
            <Card title="Verificación de Correo" className="w-full max-w-md shadow-2xl text-center">
                <div className="p-4">
                    {renderIcon()}
                    <p className={`mt-4 font-semibold ${status.type === 'error' ? 'text-red-700' : 'text-slate-600'}`}>
                        {status.message}
                    </p>
                    {status.type !== 'loading' && (
                         <Button label="Ir a Iniciar Sesión" className="mt-4" onClick={() => navigate('/login')} />
                    )}
                </div>
            </Card>
        </div>
    );
}

export default VerificarEmailPage;


//v1
// import React, { useState, useEffect } from 'react';
// import { useSearchParams, Link } from 'react-router-dom';

// function VerificarEmailPage() {
//     const [searchParams] = useSearchParams();
//     const [verificationStatus, setVerificationStatus] = useState('Verificando...');

//     useEffect(() => {
//         const token = searchParams.get('token');
//         if (token) {
//             fetch(`http://localhost:3000/api/auth/verificar-email?token=${token}`)
//                 .then(res => res.json())
//                 .then(data => {
//                     setVerificationStatus(data.message);
//                 })
//                 .catch(err => {
//                     setVerificationStatus('Error al conectar con el servidor.');
//                 });
//         } else {
//             setVerificationStatus('Token no encontrado. Por favor, usa el enlace de tu correo.');
//         }
//     }, [searchParams]);

//     return (
//         <div className="d-flex align-items-center justify-content-center vh-100">
//             <div className="text-center">
//                 <h2>Estado de la Verificación</h2>
//                 <p className="lead">{verificationStatus}</p>
//                 <Link to="/login" className="btn btn-primary mt-3">Ir a Iniciar Sesión</Link>
//             </div>
//         </div>
//     );
// }

// export default VerificarEmailPage;