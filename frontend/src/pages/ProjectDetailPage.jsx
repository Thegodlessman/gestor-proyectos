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

import GanttChart from '../components/GanttChar.jsx';



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
            // CORRECCIÓN: Usamos 'nombre_prioridad' para la etiqueta
            setPriorities(prioritiesData.map(p => ({ label: p.nombre_prioridad, value: p.id })));
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
                    fecha_inicio_estimada: data.fecha_inicio_estimada?.toISOString(),
                    fecha_fin_estimada: data.fecha_fin_estimada?.toISOString(),
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

            if (toast.current) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Operación realizada correctamente.' });
            }
            fetchProjectDetails();
        } catch (err) {
            if (toast.current) {
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

    const formatDate = (dateString) => {
        if (!dateString) return (
            <span className="text-gray-400 italic text-sm">Sin fecha</span>
        );

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let className = 'text-slate-600';
        let icon = 'pi-calendar';

        if (diffDays < 0) {
            className = 'text-red-600';
            icon = 'pi-exclamation-triangle';
        } else if (diffDays <= 7) {
            className = 'text-orange-600';
            icon = 'pi-clock';
        } else if (diffDays <= 30) {
            className = 'text-blue-600';
            icon = 'pi-calendar';
        }

        return (
            <div className={`flex align-items-center gap-2 ${className}`}>
                <i className={`pi ${icon} text-sm`}></i>
                <span className="text-sm font-medium">
                    {date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
            </div>
        );
    };

    const nameBodyTemplate = (node) => {
        const getTypeIcon = (type) => {
            switch (type) {
                case 'Objetivo General': return 'pi-flag';
                case 'Objetivo Específico': return 'pi-target';
                case 'Actividad': return 'pi-check-square';
                default: return 'pi-circle';
            }
        };

        const getTypeColor = (type) => {
            switch (type) {
                case 'Objetivo General': return 'text-blue-600';
                case 'Objetivo Específico': return 'text-green-600';
                case 'Actividad': return 'text-orange-600';
                default: return 'text-gray-600';
            }
        };

        return (
            <div className="flex align-items-center gap-3">
                <i className={`pi ${getTypeIcon(node.data.type)} ${getTypeColor(node.data.type)} text-lg`}></i>
                <div>
                    <div className="font-semibold text-slate-800 mb-1">{node.data.nombre}</div>
                    <div className={`text-xs font-medium ${getTypeColor(node.data.type)} uppercase tracking-wide`}>
                        {node.data.type}
                    </div>
                </div>
            </div>
        );
    };

    const responsibleBodyTemplate = (node) => {
        if (!node.data.nombre_responsable) {
            return (
                <div className="flex align-items-center gap-2 opacity-50">
                    <Avatar icon="pi pi-user" size="small" shape="circle" className="bg-gray-200 text-gray-500" />
                    <span className="text-gray-500 text-sm italic">Sin asignar</span>
                </div>
            );
        }
        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    label={node.data.nombre_responsable.charAt(0)}
                    size="small"
                    shape="circle"
                    className="bg-blue-500 text-white"
                />
                <span className="font-medium text-slate-700">{node.data.nombre_responsable}</span>
            </div>
        );
    };

    const priorityBodyTemplate = (node) => {
        if (!node.data.prioridad) return null;
        const priorityMap = { 'Alta': { severity: 'danger', icon: 'pi-arrow-up' }, 'Media': { severity: 'warning', icon: 'pi-minus' }, 'Baja': { severity: 'success', icon: 'pi-arrow-down' }, 'Urgente': { severity: 'danger', icon: 'pi-exclamation-triangle' } };
        const p = priorityMap[node.data.nombre_prioridad] || { severity: 'info', icon: 'pi-question-circle' };
        return <Tag value={node.data.nombre_prioridad} severity={p.severity} icon={`pi ${p.icon}`} />;
    };

    const statusBodyTemplate = (node) => <Tag value={node.data.estado || 'N/A'} severity={getSeverity(node.data.estado)} />;

    const progressBodyTemplate = (node) => {
        const progress = node.data.progreso || 0;
        const getProgressColor = (value) => {
            if (value >= 80) return '#22c55e'; // Verde
            if (value >= 60) return '#3b82f6'; // Azul
            if (value >= 40) return '#f59e0b'; // Amarillo
            return '#ef4444'; // Rojo
        };

        return (
            <div className="flex align-items-center gap-3">
                <ProgressBar
                    value={progress}
                    showValue={false}
                    style={{
                        height: '12px',
                        flex: 1,
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px'
                    }}
                    pt={{
                        value: {
                            style: {
                                backgroundColor: getProgressColor(progress),
                                borderRadius: '6px'
                            }
                        }
                    }}
                />
                <span className="text-sm font-medium text-slate-600 min-w-max">
                    {progress.toFixed(0)}%
                </span>
            </div>
        );
    };

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
                        <Avatar 
                            key={member.usuario_id} 
                            label={(member.nombre || ' ').charAt(0)} 
                            size="large" 
                            shape="circle" 
                            tooltip={`${member.nombre} ${member.apellido}`}
                        />
                    ))}
                </AvatarGroup>
            </div>

            <div className="bg-white border-round-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-sitemap text-blue-500 text-lg"></i>
                        <h3 className="font-semibold m-0 text-slate-800">Estructura del Proyecto</h3>
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 border-round-md text-sm font-medium">
                            {nodes.length} objetivo{nodes.length !== 1 ? 's' : ''} general{nodes.length !== 1 ? 'es' : ''}
                        </div>
                    </div>
                </div>

                <TreeTable
                    value={nodes}
                    tableStyle={{ minWidth: '70rem' }}
                    emptyMessage={
                        <div className="text-center py-8">
                            <i className="pi pi-sitemap text-gray-300 text-6xl mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay objetivos definidos</h3>
                            <p className="text-gray-500 mb-4">Este proyecto aún no tiene objetivos generales. Comienza añadiendo uno.</p>
                            {user && (user.nombre_rol === 'Administrador' || user.nombre_rol === 'Project Manager') && (
                                <Button
                                    label="Añadir Primer Objetivo"
                                    icon="pi pi-plus-circle"
                                    onClick={() => openItemModal('create', 'og')}
                                    className="p-button-outlined"
                                />
                            )}
                        </div>
                    }
                    pt={{
                        header: {
                            style: {
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                fontWeight: '600',
                                color: '#334155'
                            }
                        },
                        bodyRow: {
                            style: {
                                borderBottom: '1px solid #f1f5f9'
                            }
                        }
                    }}
                >
                    <Column
                        header="Elemento del Proyecto"
                        body={nameBodyTemplate}
                        expander
                        style={{ width: '35%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Responsable"
                        body={responsibleBodyTemplate}
                        style={{ width: '15%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Fecha Límite"
                        body={(node) => formatDate(node.data.fecha_fin_estimada)}
                        style={{ width: '12%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Prioridad"
                        body={priorityBodyTemplate}
                        style={{ width: '12%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Progreso"
                        body={progressBodyTemplate}
                        style={{ width: '15%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Estado"
                        body={statusBodyTemplate}
                        style={{ width: '11%' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc'
                                }
                            }
                        }}
                    />
                    <Column
                        header="Acciones"
                        body={actionBodyTemplate}
                        style={{ width: '150px', textAlign: 'center' }}
                        pt={{
                            headerCell: {
                                style: {
                                    fontWeight: '600',
                                    color: '#475569',
                                    backgroundColor: '#f8fafc',
                                    textAlign: 'center'
                                }
                            }
                        }}
                    />
                </TreeTable>

                <GanttChart projectId={id} />
            </div>

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
    // La lista 'members' viene de 'listarMiembros' y tiene 'id', 'nombre', 'apellido'
    options={members.map(m => ({ label: `${m.nombre} ${m.apellido}`, value: m.id }))}
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
                                <p className="font-bold m-0">{member.nombre}</p>
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
                            <p>{selectedActivity.descripcion}</p>
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