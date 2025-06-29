// src/pages/AdminPermissionsPage.jsx
import React, { useState, useEffect } from 'react';
import { rpcCall } from '../services/api';

function AdminPermissionsPage() {
    const [matrix, setMatrix] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        rpcCall('permisos.obtenerMatriz')
            .then(data => {
                setMatrix(data);
                setIsLoading(false);
            })
            .catch(error => console.error(error));
    }, []);

    const handlePermissionChange = async (rol, opcion_id, permiso_id, habilitado) => {
        // Encontrar el rol_id basado en el nombre del rol
        // Esto es una simplificación; una app más grande tendría los IDs a mano.
        const rol_id = 'ID_DEL_ROL_CORRESPONDIENTE'; // Necesitaríamos una forma de obtener esto.
        
        // Lo ideal sería que la API devolviera los IDs de los roles también.
        // Por ahora, esta parte es conceptual.
        console.log("Cambiando permiso:", { rol, opcion_id, permiso_id, habilitado });
        
        /*
        try {
            const result = await rpcCall('permisos.actualizar', { rol_id, opcion_id, permiso_id, habilitado });
            setMessage(result.message);
            // Volver a cargar la matriz para reflejar el cambio
            const data = await rpcCall('permisos.obtenerMatriz');
            setMatrix(data);
        } catch (error) {
            setMessage(error.message);
        }
        */
    };

    if (isLoading) return <div>Cargando matriz de permisos...</div>;

    return (
        <div className="container mt-5">
            <h2>Gestión de Permisos</h2>
            {message && <div className="alert alert-info">{message}</div>}
            
            {Object.entries(matrix).map(([nombreModulo, opciones]) => (
                <div key={nombreModulo} className="mb-4">
                    <h3>Módulo: {nombreModulo}</h3>
                    {opciones.map(({ opcion_id, nombre_opcion, permisos }) => (
                        <div key={opcion_id} className="card bg-dark mb-3">
                            <div className="card-header">{nombre_opcion}</div>
                            <div className="card-body">
                                <table className="table table-dark table-hover">
                                    <thead>
                                        <tr>
                                            <th>Permiso</th>
                                            {/* Asumimos que todos tienen los mismos roles. Obtenemos los nombres de los roles del primer permiso */}
                                            {permisos[0] && Object.keys(permisos[0].roles).map(rol => <th key={rol} className="text-center">{rol}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permisos.map(({ permiso_id, nombre_permiso, roles }) => (
                                            <tr key={permiso_id}>
                                                <td>{nombre_permiso}</td>
                                                {Object.entries(roles).map(([rol, habilitado]) => (
                                                    <td key={rol} className="text-center">
                                                        <div className="form-check form-switch d-flex justify-content-center">
                                                           <input 
                                                               className="form-check-input" 
                                                               type="checkbox" 
                                                               role="switch"
                                                               checked={habilitado}
                                                               // La lógica de onChange necesita ser implementada con los IDs correctos
                                                               // onChange={(e) => handlePermissionChange(rol, opcion_id, permiso_id, e.target.checked)}
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default AdminPermissionsPage;