import React, { useState, useEffect, useRef } from 'react';
import { rpcCall } from '../services/api';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';

const AdminPermissionsPage = () => {
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await rpcCall('Admin', 'getPermissionMatrixData');
                
                // Transformamos los datos a un formato plano para la DataTable
                const flatPermissions = [];
                for (const modulo of data.modulos) {
                    const opciones = data.opciones.filter(o => o.modulo_id === modulo.id);
                    for (const opcion of opciones) {
                        for (const permiso of data.permisos) {
                            const rowData = {
                                key: `${opcion.id}-${permiso.id}`,
                                modulo: modulo.nombre_modulo,
                                opcion_id: opcion.id,
                                opcion_nombre: opcion.nombre_opcion,
                                permiso_id: permiso.id,
                                permiso_nombre: permiso.nombre_permiso,
                            };
                            
                            data.roles.forEach(rol => {
                                const regla = data.reglas.find(r => r.rol_id === rol.id && r.opcion_id === opcion.id && r.permiso_id === permiso.id);
                                rowData[rol.nombre_rol] = !!regla;
                            });
                            flatPermissions.push(rowData);
                        }
                    }
                }
                setPermissions(flatPermissions);
                setRoles(data.roles);
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPermissions();
    }, []);

    const handlePermissionChange = async (rowData, rol, isEnabled) => {
        try {
            await rpcCall('Admin', 'updatePermission', {
                rol_id: rol.id,
                opcion_id: rowData.opcion_id,
                permiso_id: rowData.permiso_id,
                habilitado: isEnabled
            });

            // Actualización optimista de la UI
            setPermissions(currentPermissions => 
                currentPermissions.map(p => 
                    p.key === rowData.key ? { ...p, [rol.nombre_rol]: isEnabled } : p
                )
            );
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Permiso actualizado.' });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el permiso.' });
        }
    };

    if (isLoading) {
        return <div className="card m-4"><Skeleton height="50vh" /></div>;
    }

    // Plantilla para renderizar el switch en cada celda
    const switchBodyTemplate = (rowData, rol) => {
        return (
            <InputSwitch
                checked={rowData[rol.nombre_rol]}
                onChange={(e) => handlePermissionChange(rowData, rol, e.value)}
            />
        );
    };

    // Crea las columnas de roles dinámicamente
    const roleColumns = roles.map(rol => (
        <Column key={rol.id} header={rol.nombre_rol} body={(rowData) => switchBodyTemplate(rowData, rol)} style={{ textAlign: 'center' }} />
    ));

    // Define la fila de cabecera para agrupar por opción
    const rowGroupHeaderTemplate = (data) => (
        <strong className="text-lg">{data.opcion_nombre}</strong>
    );

    return (
        <div className="card m-4">
            <Toast ref={toast} />
            <h1 className="text-2xl font-bold mb-4">Gestión de Permisos</h1>
            <DataTable 
                value={permissions} 
                rowGroupMode="subheader" 
                groupRowsBy="opcion_nombre"
                sortMode="single" 
                sortField="opcion_nombre" 
                sortOrder={1}
                rowGroupHeaderTemplate={rowGroupHeaderTemplate}
                className="p-datatable-sm"
            >
                <Column field="permiso_nombre" header="Permiso" style={{ minWidth: '200px' }} />
                {roleColumns}
            </DataTable>
        </div>
    );
};

export default AdminPermissionsPage;