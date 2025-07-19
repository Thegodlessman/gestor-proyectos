import React, { useState, useEffect, useRef } from 'react';
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

const ProjectDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const toast = useRef(null);
    const { user } = useAuth();

    const [projectData, setProjectData] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const transformDataToNodes = (project) => {
        if (!project || !Array.isArray(project.objetivos_generales)) return [];

        return project.objetivos_generales.map((og) => ({
            key: `og-${og.id_objetivo_general}`,
            data: {
                id: og.id_objetivo_general,
                type: 'Objetivo General',
                nombre: og.descripcion,
                progreso: og.progreso_promedio || 0,
                estado: og.estado,
            },
            children: Array.isArray(og.objetivos_especificos) 
                ? og.objetivos_especificos.map((oe) => ({
                    key: `oe-${oe.id_objetivo_especifico}`,
                    data: {
                        id: oe.id_objetivo_especifico,
                        type: 'Objetivo Específico',
                        nombre: oe.descripcion,
                        progreso: oe.progreso_promedio || 0,
                        estado: oe.estado,
                    },
                    children: Array.isArray(oe.actividades) 
                        ? oe.actividades.map((act) => ({
                            key: `act-${act.id_actividad}`,
                            data: {
                                id: act.id_actividad,
                                type: 'Actividad',
                                nombre: act.descripcion,
                                progreso: act.progreso,
                                estado: act.estado_actividad,
                                prioridad: act.prioridad,
                                responsable: act.nombre_responsable,
                                fecha_inicio_estimada: act.fecha_inicio_estimada,
                                fecha_fin_estimada: act.fecha_fin_estimada,
                                fecha_inicio_real: act.fecha_inicio_real,
                                fecha_fin_real: act.fecha_fin_real,
                            },
                        })) 
                        : [],
                })) 
                : [],
        }));
    };

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!id || !user) return;

            setLoading(true);
            setError(null);
            try {
                const result = await rpcCall('Project', 'obtenerPorId', { id: id });
                
                setProjectData(result);
                const transformedNodes = transformDataToNodes(result);
                setNodes(transformedNodes);
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("No se pudo cargar el proyecto. Es posible que no exista o no tengas permiso para verlo.");
                
                if (toast.current) {
                    toast.current.show({ 
                        severity: 'error', 
                        summary: 'Error de Carga', 
                        detail: "Error interno al procesar la solicitud." 
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id, user]);


    const getSeverity = (status) => {
        switch (status) {
            case 'Completada': return 'success';
            case 'En Progreso': return 'info';
            case 'Retrasado': return 'danger';
            case 'Pendiente': return 'warning';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const nameBodyTemplate = (node) => {
        return (
            <div>
                <span className="font-bold">{node.data.nombre}</span>
                <div className="text-sm text-gray-500">{node.data.type}</div>
            </div>
        );
    };

    const responsibleBodyTemplate = (node) => {
        if (!node.data.responsable) return null;
        return (
            <div className="flex align-items-center gap-2">
                <Avatar label={node.data.responsable.charAt(0)} size="small" shape="circle" />
                <span>{node.data.responsable}</span>
            </div>
        );
    };
    
    const priorityBodyTemplate = (node) => {
        if (!node.data.prioridad) return null;
        const priorityMap = {
            'Alta': { severity: 'danger', icon: 'pi-arrow-up' },
            'Media': { severity: 'warning', icon: 'pi-minus' },
            'Baja': { severity: 'success', icon: 'pi-arrow-down' }
        };
        const p = priorityMap[node.data.prioridad] || { severity: 'info', icon: 'pi-question-circle' };
        return <Tag value={node.data.prioridad} severity={p.severity} icon={`pi ${p.icon}`} />;
    };

    const statusBodyTemplate = (node) => (
        <Tag value={node.data.estado || 'N/A'} severity={getSeverity(node.data.estado)} />
    );

    const progressBodyTemplate = (node) => (
        <ProgressBar value={node.data.progreso} showValue={false} style={{ height: '8px' }} />
    );

    const actionBodyTemplate = (node) => {
        return (
            <div className="flex gap-2">
                {node.data.type !== 'Actividad' && (
                    <Button 
                        icon="pi pi-plus" 
                        className="p-button-rounded p-button-success p-button-sm" 
                        tooltip={`Añadir ${node.data.type === 'Objetivo General' ? 'Obj. Específico' : 'Actividad'}`}
                        onClick={() => toast.current.show({ severity: 'info', summary: 'Próximamente', detail: `Añadir en ${node.data.nombre}` })}
                    />
                )}
                <Button 
                    icon="pi pi-pencil" 
                    className="p-button-rounded p-button-warning p-button-sm" 
                    tooltip="Editar"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Próximamente', detail: `Editar ${node.data.nombre}` })}
                />
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-danger p-button-sm" 
                    tooltip="Eliminar"
                    onClick={() => toast.current.show({ severity: 'info', summary: 'Próximamente', detail: `Eliminar ${node.data.nombre}` })}
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="card">
                <Skeleton width="30%" height="2rem" className="mb-4" />
                <Skeleton height="400px" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center p-4 border-round-lg">
                <i className="pi pi-exclamation-triangle text-red-500 text-5xl mb-3"></i>
                <h2 className="text-2xl font-bold text-red-700">Error al Cargar</h2>
                <p className="text-lg">{error}</p>
                <Button label="Volver a Proyectos" icon="pi pi-arrow-left" onClick={() => navigate('/projects')} className="mt-4" />
            </div>
        );
    }
    
    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <Button icon="pi pi-arrow-left" label="Volver a Proyectos" onClick={() => navigate('/projects')} className="p-button-text" />
                    <h1 className="text-3xl font-bold text-slate-800 mt-2">{projectData?.nombre_proyecto}</h1>
                    <p className="text-gray-500">{projectData?.descripcion}</p>
                </div>
                <Button label="Añadir Objetivo General" icon="pi pi-plus-circle" />
            </div>

            <TreeTable value={nodes} autoLayout tableStyle={{ minWidth: '70rem' }}>
                <Column header="Nombre" body={nameBodyTemplate} expander style={{ width: '35%' }} />
                <Column header="Responsable" body={responsibleBodyTemplate} style={{ width: '15%' }} />
                <Column header="Fecha Fin" body={(node) => formatDate(node.data.fecha_fin_estimada)} />
                <Column header="Prioridad" body={priorityBodyTemplate} />
                <Column header="Progreso" body={progressBodyTemplate} />
                <Column header="Estado" body={statusBodyTemplate} />
                <Column header="Acciones" body={actionBodyTemplate} style={{ width: '150px', textAlign: 'center' }} />
            </TreeTable>
        </div>
    );
};

export default ProjectDetailPage;