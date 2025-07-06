
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout'; 

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <h1>Cargando...</h1>; 
    }

    if (!isAuthenticated && !isLoading) {
        return <Navigate to="/login" replace />;
    }

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