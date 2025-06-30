// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout'; // <-- Importamos el Layout aquí

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <h1>Cargando...</h1>; // O un componente de Spinner
    }

    if (!isAuthenticated && !isLoading) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderiza el Layout principal.
    // El componente <Outlet/> dentro de AppLayout se encargará de mostrar la página correcta (Dashboard, etc.)
    return <AppLayout />;
};

export default ProtectedRoute;





// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// function ProtectedRoute({ children }) {
//     const { isAuthenticated, isLoading } = useAuth();

//     if (isLoading) {
//         return <div>Cargando...</div>;
//     }

//     if (!isAuthenticated) {
//         return <Navigate to="/login" />;
//     }

//     return children;
// }

// export default ProtectedRoute;