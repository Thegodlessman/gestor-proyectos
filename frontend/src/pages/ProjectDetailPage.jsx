import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rpcCall } from '../services/api';
import { useAuth } from '../context/AuthContext';

// PrimeReact Components
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Sidebar } from 'primereact/sidebar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useRef(null);
    const { user } = useAuth();

    const [projectData, setProjectData] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dropdown options state
    const [members, setMembers] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [roles, setRoles] = useState([]);

    // Modal states
    const [isItemModalVisible, setIsItemModalVisible] = useState(false);
    const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ mode: 'create', type: '', title: '', data: {} });
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);

    // Sidebar state
    const [isDetailSidebarVisible, setIsDetailSidebarVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const transformDataToNodes = useCallback((project) => {
        return (project?.objetivos_generales ?? []).map((og) => ({
            key: `og-${og.id}`,
            data: { ...og, type: 'Objetivo General', nombre: og.descripcion, progreso: og.progreso_promedio || 0 },
            children: (og?.objetivos_especificos ?? []).map((oe) => ({
                key: `oe-${oe.id}`,
                data: { ...oe, type: 'Objetivo Específico', nombre: oe.descripcion, progreso: oe.progreso_promedio || 0 },
                children: (oe?.actividades ?? []).map((act) => ({
                    key: `act-${act.id}`,
                    data: { ...act, type: 'Actividad', nombre: act.descripcion, estado: act.estado_actividad },
                })),
            })),
        }));
    }, []);
    
    const fetchProjectDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const result = await rpcCall('Project', 'obtenerJerarquia', { proyecto_id: id });
            if (result) {
                setProjectData(result);
                setNodes(transformDataToNodes(result));
            } else {
                throw new Error("El proyecto no fue encontrado o no tienes acceso.");
            }
        } catch (err) {
            console.error("Error fetching project details:", err);
            setError(err.message || "No se pudo cargar el proyecto.");
        } finally {
            setLoading(false);
        }
    }, [id, transformDataToNodes]);

    const fetchDropdownData = useCallback(async () => {
        if (!id) return;
        try {
            const [membersData, prioritiesData, rolesData] = await Promise.all([
                rpcCall('Project', 'listarMiembros', { proyecto_id: id }),
                rpcCall('Project', 'listarPrioridades'),
                rpcCall('Project', 'listarRolesProyecto')
            ]);
            
            setMembers(membersData);
            setPriorities(prioritiesData.map(p => ({ label: p.nombre, value: p.id })));
            const projectRoles = rolesData.map(r => ({ label: r.nombre_rol_proyecto, value: r.id }));
            setRoles(projectRoles);
            if (projectRoles.length > 0) {
                const defaultRole = projectRoles.find(r => r.label === 'Colaborador') || projectRoles[0];
                setSelectedRole(defaultRole.value); 
            }

        } catch (error) {
            console.error("Error fetching dropdown data:", error);
            if (toast.current) {
                toast.current.show({ severity: 'error', summary: 'Error de Datos', detail: 'No se pudieron cargar los datos para los formularios.' });
            }
        }
    }, [id]);

    useEffect(() => {
        fetchProjectDetails();
        fetchDropdownData();
    }, [fetchProjectDetails, fetchDropdownData]);

    const openItemModal = (mode, type, node = null) => {
        let title = '';
        let data = {};
        if (mode === 'create') {
            title = `Añadir ${type === 'og' ? 'Objetivo General' : type === 'oe' ? 'Objetivo Específico' : 'Actividad'}`;
            data = { parentId: node?.data.id };
        } else {
            title = `Editar ${node.data.type}`;
            data = { ...node.data, descripcion: node.data.nombre };
        }
        setModalConfig({ mode, type, title, data });
        setIsItemModalVisible(true);
    };

    const handleSaveChanges = async () => {
        const { mode, type, data } = modalConfig;
        let service, method, params;

        try {
            if (type === 'og') {
                service = 'Project';
                method = 'crearObjetivoGeneral';
                params = { proyecto_id: id, descripcion: data.descripcion };
            } else if (type === 'oe') {
                service = 'Project';
                method = 'crearObjetivoEspecifico';
                params = { objetivo_general_id: data.parentId, descripcion: data.descripcion };
            } else if (type === 'act') {
                service = 'Project';
                method = 'crearActividad';
                params = {
                    proyecto_id: id,
                    objetivo_especifico_id: data.parentId,
                    descripcion: data.descripcion,
                    prioridad_id: data.prioridad_id,
                    fecha_fin_estimada: data.fecha_fin_estimada?.toISOString().split('T')[0],
                };
            }
            
            if (!service || !method) {
                throw new Error("Operación no implementada.");
            }

            const result = await rpcCall(service, method, params);

            // Si se creó una actividad y se asignó un responsable, hacer la segunda llamada
            if (type === 'act' && data.id_usuario_responsable && result.id) {
                await rpcCall('Project', 'assignUser', {
                    actividad_id: result.id,
                    usuario_id: data.id_usuario_responsable
                });
            }

            if(toast.current) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Operación realizada correctamente.' });
            }
            fetchProjectDetails();
        } catch (err) {
            if(toast.current) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'No se pudo completar la operación.' });
            }
        } finally {
            setIsItemModalVisible(false);
        }
    };

    const handleDelete = (node) => {
        confirmDialog({
            message: `¿Estás seguro de que quieres eliminar "${node.data.nombre}"?`,
            header: 'Confirmación de Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
               if (toast.current) {
                   toast.current.show({ severity: 'info', summary: 'Función no disponible', detail: 'La eliminación aún no está implementada en el backend.' });
               }
            }
        });
    };

    const handleInviteMember = async () => {
        if (!inviteEmail || !selectedRole) {
            if (toast.current) toast.current.show({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, ingresa un email y selecciona un rol.' });
            return;
        }
        try {
            await rpcCall('Project', 'agregarMiembro', {
                proyecto_id: id,
                email_miembro: inviteEmail,
                rol_proyecto_id: selectedRole
            });
            if (toast.current) toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Miembro agregado correctamente.' });
            setInviteEmail('');
            fetchDropdownData(); // Refrescar la lista de miembros
        } catch (err) {
            if (toast.current) toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'No se pudo agregar al miembro.' });
        }
    };
    
    const handleRemoveMember = (member) => {
        confirmDialog({
            message: `¿Estás seguro de que quieres eliminar a ${member.nombre_usuario} del proyecto?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await rpcCall('Project', 'eliminarMiembro', {
                        proyecto_id: id,
                        usuario_id: member.usuario_id
                    });
                    if (toast.current) toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Miembro eliminado.' });
                    fetchDropdownData(); // Refrescar lista
                } catch (err) {
                    if (toast.current) toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'No se pudo eliminar al miembro.' });
                }
            }
        });
    };

    const openDetailSidebar = (activityData) => {
        setSelectedActivity(activityData);
        setIsDetailSidebarVisible(true);
    };

    const getSeverity = (status) => {
        const statusMap = { 'Completada': 'success', 'En Progreso': 'info', 'Retrasado': 'danger', 'Pendiente': 'warning' };
        return statusMap[status] || 'secondary';
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

    const nameBodyTemplate = (node) => <div><span className="font-bold">{node.data.nombre}</span><div className="text-sm text-gray-500">{node.data.type}</div></div>;

    const responsibleBodyTemplate = (node) => {
        if (!node.data.nombre_responsable) return null;
        return (
            <div className="flex align-items-center gap-2">
                <Avatar label={node.data.nombre_responsable.charAt(0)} size="small" shape="circle" />
                <span>{node.data.nombre_responsable}</span>
            </div>
        );
    };
    
    const priorityBodyTemplate = (node) => {
        if (!node.data.prioridad) return null;
        const priorityMap = { 'Alta': { severity: 'danger', icon: 'pi-arrow-up' }, 'Media': { severity: 'warning', icon: 'pi-minus' }, 'Baja': { severity: 'success', icon: 'pi-arrow-down' }, 'Urgente': { severity: 'danger', icon: 'pi-exclamation-triangle'} };
        const p = priorityMap[node.data.prioridad] || { severity: 'info', icon: 'pi-question-circle' };
        return <Tag value={node.data.prioridad} severity={p.severity} icon={`pi ${p.icon}`} />;
    };

    const statusBodyTemplate = (node) => <Tag value={node.data.estado || 'N/A'} severity={getSeverity(node.data.estado)} />;

    const progressBodyTemplate = (node) => <ProgressBar value={node.data.progreso} showValue={false} style={{ height: '8px' }} />;

    const actionBodyTemplate = (node) => {
        const canEdit = user && (user.nombre_rol === 'Administrador' || user.nombre_rol === 'Project Manager');
        const nextType = node.data.type === 'Objetivo General' ? 'oe' : 'act';

        return (
            <div className="flex gap-2">
                {node.data.type === 'Actividad' && (
                     <Button 
                        icon="pi pi-eye" 
                        className="p-button-rounded p-button-info p-button-icon-only" 
                        style={{ width: '2.5rem', height: '2.5rem' }}
                        tooltip="Ver Detalles"
                        onClick={() => openDetailSidebar(node.data)}
                    />
                )}
                {canEdit && node.data.type !== 'Actividad' && (
                    <Button 
                        icon="pi pi-plus" 
                        className="p-button-rounded p-button-success p-button-icon-only" 
                        style={{ width: '2.5rem', height: '2.5rem' }}
                        tooltip={`Añadir ${nextType === 'oe' ? 'Obj. Específico' : 'Actividad'}`}
                        onClick={() => openItemModal('create', nextType, node)}
                    />
                )}
                {canEdit && (
                    <>
                        <Button 
                            icon="pi pi-pencil" 
                            className="p-button-rounded p-button-warning p-button-icon-only" 
                            style={{ width: '2.5rem', height: '2.5rem' }}
                            tooltip="Editar"
                            onClick={() => toast.current.show({ severity: 'info', summary: 'Próximamente', detail: `La edición no está implementada en el backend.` })}
                        />
                        <Button 
                            icon="pi pi-trash" 
                            className="p-button-rounded p-button-danger p-button-icon-only" 
                            style={{ width: '2.5rem', height: '2.5rem' }}
                            tooltip="Eliminar"
                            onClick={() => handleDelete(node)}
                        />
                    </>
                )}
            </div>
        );
    };
    
    const modalFooter = <div><Button label="Cancelar" icon="pi pi-times" onClick={() => setIsItemModalVisible(false)} className="p-button-text" /><Button label="Guardar" icon="pi pi-check" onClick={handleSaveChanges} autoFocus /></div>;

    if (loading) return <div className="card"><Skeleton width="30%" height="2rem" className="mb-4" /><Skeleton height="400px" /></div>;

    if (error) return <div className="card text-center p-4 border-round-lg"><i className="pi pi-exclamation-triangle text-red-500 text-5xl mb-3"></i><h2 className="text-2xl font-bold text-red-700">Error al Cargar</h2><p className="text-lg">{error}</p><Button label="Volver a Proyectos" icon="pi pi-arrow-left" onClick={() => navigate('/projects')} className="mt-4" /></div>;
    
    return (
        <div className="card shadow-1 border-round-lg">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <Button icon="pi pi-arrow-left" label="Volver a Proyectos" onClick={() => navigate('/projects')} className="p-button-text mb-2" />
                    <h1 className="text-3xl font-bold text-slate-800 m-0">{projectData?.nombre_proyecto}</h1>
                    <p className="text-gray-500 mt-1">{projectData?.descripcion}</p>
                </div>
                {user && (user.nombre_rol === 'Administrador' || user.nombre_rol === 'Project Manager') && (
                    <div className="flex gap-2">
                        <Button label="Añadir Objetivo General" icon="pi pi-plus-circle" onClick={() => openItemModal('create', 'og')} />
                        <Button label="Gestionar Miembros" icon="pi pi-users" onClick={() => setIsMembersModalVisible(true)} className="p-button-outlined" />
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="font-semibold mb-2">Miembros del Proyecto</h3>
                <AvatarGroup>
    {members.map(member => (
        // Usamos 'nombre' en lugar de 'nombre_usuario' y añadimos una comprobación
        // para asegurarnos de que el nombre exista antes de llamar a charAt.
        <Avatar 
            key={member.usuario_id} 
            label={(member.nombre || ' ').charAt(0)} 
            size="large" 
            shape="circle" 
            pt={{ label: { style: { fontSize: '1rem' }}}} 
            tooltip={`${member.nombre} ${member.apellido}`}
        />
    ))}
</AvatarGroup>
            </div>

            <TreeTable value={nodes} tableStyle={{ minWidth: '70rem' }} emptyMessage="Este proyecto aún no tiene objetivos definidos.">
                <Column header="Nombre" body={nameBodyTemplate} expander style={{ width: '35%' }} />
                <Column header="Responsable" body={responsibleBodyTemplate} style={{ width: '15%' }} />
                <Column header="Fecha Fin" body={(node) => formatDate(node.data.fecha_fin_estimada)} />
                <Column header="Prioridad" body={priorityBodyTemplate} />
                <Column header="Progreso" body={progressBodyTemplate} />
                <Column header="Estado" body={statusBodyTemplate} />
                <Column header="Acciones" body={actionBodyTemplate} style={{ width: '150px', textAlign: 'center' }} />
            </TreeTable>

            <Dialog header={modalConfig.title} visible={isItemModalVisible} style={{ width: 'min(90vw, 500px)' }} onHide={() => setIsItemModalVisible(false)} footer={modalFooter} modal>
                <div className="flex flex-column gap-4 mt-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="itemDescription" className='font-semibold'>Descripción</label>
                        <InputTextarea 
                            id="itemDescription" 
                            value={modalConfig.data.descripcion || ''} 
                            onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, descripcion: e.target.value } }))} 
                            rows={3} 
                            autoFocus 
                        />
                    </div>
                    {modalConfig.type === 'act' && (
                        <>
                            <div className="grid formgrid">
                                <div className="col-12 md:col-6 field">
                                    <label htmlFor="itemResponsible" className='font-semibold'>Responsable</label>
                                    <Dropdown 
                                        id="itemResponsible" 
                                        value={modalConfig.data.id_usuario_responsable} 
                                        onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, id_usuario_responsable: e.value } }))} 
                                        options={members.map(m => ({ label: m.nombre_usuario, value: m.usuario_id }))}
                                        placeholder="Selecciona un responsable" 
                                        className="w-full" 
                                    />
                                </div>
                                <div className="col-12 md:col-6 field">
                                    <label htmlFor="itemPriority" className='font-semibold'>Prioridad</label>
                                    <Dropdown 
                                        id="itemPriority" 
                                        value={modalConfig.data.prioridad_id} 
                                        onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, prioridad_id: e.value } }))} 
                                        options={priorities} 
                                        placeholder="Selecciona una prioridad" 
                                        className="w-full" 
                                    />
                                </div>
                            </div>
                            <div className="grid formgrid">
                                 <div className="col-12 md:col-6 field">
                                    <label htmlFor="itemStartDate" className='font-semibold'>Fecha de Inicio Estimada</label>
                                    <Calendar 
                                        id="itemStartDate" 
                                        value={modalConfig.data.fecha_inicio_estimada ? new Date(modalConfig.data.fecha_inicio_estimada) : null} 
                                        onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, fecha_inicio_estimada: e.value } }))} 
                                        dateFormat="dd/mm/yy" 
                                        showIcon 
                                        className="w-full" 
                                    />
                                </div>
                                <div className="col-12 md:col-6 field">
                                    <label htmlFor="itemEndDate" className='font-semibold'>Fecha de Fin Estimada</label>
                                    <Calendar 
                                        id="itemEndDate" 
                                        value={modalConfig.data.fecha_fin_estimada ? new Date(modalConfig.data.fecha_fin_estimada) : null} 
                                        onChange={(e) => setModalConfig(prev => ({ ...prev, data: { ...prev.data, fecha_fin_estimada: e.value } }))} 
                                        dateFormat="dd/mm/yy" 
                                        showIcon 
                                        className="w-full" 
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Dialog>

            <Dialog header="Gestionar Miembros del Proyecto" visible={isMembersModalVisible} style={{ width: 'min(90vw, 600px)' }} onHide={() => setIsMembersModalVisible(false)} modal>
                <div className="flex flex-column gap-3 mt-3">
                    {members.map(member => (
                        <div key={member.usuario_id} className="flex justify-content-between align-items-center p-2 border-round-md bg-slate-50">
                            <div>
                                <p className="font-bold m-0">{member.nombre} {member.apellido}</p>
                                <p className="text-sm text-gray-500 m-0">{member.nombre_rol_proyecto}</p>
                            </div>
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => handleRemoveMember(member)} />
                        </div>
                    ))}
                    <Divider />
                    <div>
                        <h4 className="font-semibold mt-0 mb-3">Añadir Nuevo Miembro</h4>
                        <div className="flex flex-column sm:flex-row gap-2">
                           <InputText value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email del usuario" className="w-full" />
                           <Dropdown value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={roles} placeholder="Selecciona un rol" className="w-full sm:w-15rem" />
                           <Button label="Añadir" onClick={handleInviteMember} />
                        </div>
                    </div>
                </div>
            </Dialog>

            <Sidebar visible={isDetailSidebarVisible} onHide={() => setIsDetailSidebarVisible(false)} position="left">
                {selectedActivity && (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Detalles de la Actividad</h2>
                        
                        <div className="mb-4">
                            <p className="font-bold text-lg">Descripción</p>
                            <p>{selectedActivity.nombre}</p>
                        </div>

                        <div className="mb-4">
                            <p className="font-bold text-lg">Responsable</p>
                            <p>{selectedActivity.nombre_responsable || 'No asignado'}</p>
                        </div>

                        <div className="grid">
                            <div className="col-6">
                                <p className="font-bold text-lg">Fecha de Inicio</p>
                                <p>{formatDate(selectedActivity.fecha_inicio_estimada)}</p>
                            </div>
                            <div className="col-6">
                                <p className="font-bold text-lg">Fecha Límite</p>
                                <p>{formatDate(selectedActivity.fecha_fin_estimada)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Sidebar>
        </div>
    );
};

export default ProjectDetailPage;