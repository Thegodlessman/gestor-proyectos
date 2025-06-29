import React, { useState, useEffect, useCallback } from 'react';
import { rpcCall } from '../services/api';

function AdminPermissionsPage() {
    const [matrixData, setMatrixData] = useState({});
    const [rolesList, setRolesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchPermissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await rpcCall('permisos.obtenerMatriz');
            setMatrixData(data.matriz);
            setRolesList(data.roles);
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handlePermissionChange = async (rol_nombre, opcion_id, permiso_id, nuevo_estado) => {
        setMessage({ type: 'info', text: 'Actualizando permiso...' });

        // Encontramos el ID del rol a partir de su nombre
        const rol = rolesList.find(r => r.nombre_rol === rol_nombre);
        if (!rol) {
            setMessage({ type: 'danger', text: 'Error: Rol no encontrado.' });
            return;
        }

        try {
            // Llamamos al backend para actualizar el permiso en la BD y en el caché
            const result = await rpcCall('permisos.actualizar', {
                rol_id: rol.id,
                opcion_id: opcion_id,
                permiso_id: permiso_id,
                habilitado: nuevo_estado
            });
            setMessage({ type: 'success', text: result.message });

            setMatrixData(currentMatrix => {
                const newMatrix = JSON.parse(JSON.stringify(currentMatrix));
                for (const modulo in newMatrix) {
                    const opcion = newMatrix[modulo].find(o => o.opcion_id === opcion_id);
                    if (opcion) {
                        const permiso = opcion.permisos.find(p => p.permiso_id === permiso_id);
                        if (permiso) {
                            permiso.roles[rol_nombre] = nuevo_estado;
                            break;
                        }
                    }
                }
                return newMatrix;
            });

        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    if (isLoading) {
        return <div className="container mt-5">Cargando matriz de permisos...</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Gestión de Permisos del Sistema</h2>
            <p className="text-body-secondary">Activa o desactiva los permisos para cada rol. Los cambios se aplican en tiempo real.</p>
            {message.text && <div className={`alert alert-${message.type} mt-3`}>{message.text}</div>}

            {Object.entries(matrixData).map(([nombreModulo, opciones]) => (
                <div key={nombreModulo} className="mb-4">
                    <h3>Módulo: {nombreModulo}</h3>
                    {opciones.map(({ opcion_id, nombre_opcion, permisos }) => (
                        <div key={opcion_id} className="card bg-dark mb-3">
                            <div className="card-header">{nombre_opcion}</div>
                            <div className="card-body">
                                <table className="table table-dark table-hover table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Permiso</th>
                                            {rolesList.map(rol => <th key={rol.id} className="text-center">{rol.nombre_rol}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permisos.map(({ permiso_id, nombre_permiso, roles }) => (
                                            <tr key={permiso_id}>
                                                <td>{nombre_permiso}</td>
                                                {rolesList.map(rol => (
                                                    <td key={rol.id} className="text-center">
                                                        <div className="form-check form-switch d-inline-block">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                role="switch"
                                                                checked={roles[rol.nombre_rol] || false}
                                                                onChange={(e) => handlePermissionChange(rol.nombre_rol, opcion_id, permiso_id, e.target.checked)}
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