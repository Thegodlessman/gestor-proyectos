import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rpcCall } from '../services/api';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectEndDate, setNewProjectEndDate] = useState(null);
    const [newProjectPriority, setNewProjectPriority] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const priorities = [
        { label: 'Baja', value: '4706b812-2efb-4e45-a61d-94f1d75737cb' },
        { label: 'Media', value: '022678f0-30ce-46a1-a011-06ee3f117caf' },
        { label: 'Alta', value: '1817ff68-342c-4a2b-9817-c3b0f23c4ba9' },
        { label: 'Urgente', value: 'e8d5d10c-ada3-4856-bd7b-f170f40fb2d4' },
    ];

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const result = await rpcCall('Project', 'listar');
            const projectsWithDefaults = Array.isArray(result) 
                ? result.map(p => ({ ...p, progreso: p.progreso || 0 }))
                : [];
            setProjects(projectsWithDefaults);
        } catch (error) {
            console.error("Error al obtener proyectos:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !newProjectEndDate || !newProjectPriority) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, fecha de fin y prioridad son requeridos.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const params = {
                nombre: newProjectName,
                descripcion: newProjectDescription,
                fecha_fin_estimada: newProjectEndDate.toISOString().split('T')[0],
                prioridad_id: newProjectPriority
            };
            
            await rpcCall('Project', 'crear', params);
            
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente.' });
            
            setIsCreateModalVisible(false);
            setNewProjectName('');
            setNewProjectDescription('');
            setNewProjectEndDate(null);
            setNewProjectPriority(null);
            fetchProjects();

        } catch (error) {
            console.error("Error al crear el proyecto:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo crear el proyecto.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Plantillas para la tabla
    const getSeverity = (status) => {
        switch (status) {
            case 'Completado': return 'success';
            case 'En Progreso': return 'info';
            case 'Retrasado': return 'danger';
            case 'Pendiente': return 'warning';
            default: return 'secondary';
        }
    };
    const statusBodyTemplate = (rowData) => <Tag value={rowData.estado || 'N/A'} severity={getSeverity(rowData.estado)} />;
    const progressBodyTemplate = (rowData) => <ProgressBar value={rowData.progreso} showValue={false} style={{ height: '8px' }}></ProgressBar>;
    
    const header = (
        <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 m-0">Mis Proyectos</h1>
            <div className="flex gap-2 w-full sm:w-auto">
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar proyecto..." className="w-full"/>
                </span>
                {user && (user.nombre_rol === 'Administrador' || user.rol === 'Project Manager') && (
                    <Button label="Crear" icon="pi pi-plus" onClick={() => setIsCreateModalVisible(true)} />
                )}
            </div>
        </div>
    );
    
    const createModalFooter = (
        <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setIsCreateModalVisible(false)} className="p-button-text" />
            <Button label="Guardar Proyecto" icon="pi pi-check" onClick={handleCreateProject} loading={isSubmitting} autoFocus />
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card shadow-1 border-round-lg">
                <DataTable 
                    value={projects} 
                    loading={loading}
                    header={header}
                    globalFilter={globalFilter}
                    paginator rows={10} 
                    rowsPerPageOptions={[5, 10, 25]}
                    emptyMessage="No tienes proyectos asignados."
                    className="p-datatable-customers"
                    onRowClick={(e) => navigate(`/project/${e.data.id}`)}
                    rowClassName={() => "cursor-pointer"}
                    dataKey="id_proyecto"
                    sortMode="multiple"
                >
                    <Column field="nombre_proyecto" header="Nombre del Proyecto" sortable style={{ minWidth: '14rem' }} />
                    <Column field="nombre_responsable" header="Responsable" sortable style={{ minWidth: '12rem' }} />
                    <Column field="prioridad" header="Prioridad" sortable />
                    <Column field="progreso" header="Avance" body={progressBodyTemplate} sortable />
                    <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
                </DataTable>
            </div>

            <Dialog 
                header="Crear Nuevo Proyecto" 
                visible={isCreateModalVisible} 
                style={{ width: 'min(90vw, 500px)' }} 
                onHide={() => setIsCreateModalVisible(false)}
                footer={createModalFooter}
                draggable={false}
                modal
            >
                <div className="flex flex-column gap-4 mt-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="projectName" className='font-semibold'>Nombre del Proyecto</label>
                        <InputText id="projectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} autoFocus />
                    </div>
                    
                    <div className="grid formgrid">
                        <div className="col-12 md:col-6 field">
                             <label htmlFor="projectEndDate" className='font-semibold'>Fecha de Fin Estimada</label>
                             <Calendar id="projectEndDate" value={newProjectEndDate} onChange={(e) => setNewProjectEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                        </div>
                        <div className="col-12 md:col-6 field">
                            <label htmlFor="projectPriority" className='font-semibold'>Prioridad</label>
                            <Dropdown id="projectPriority" value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.value)} options={priorities} placeholder="Selecciona una prioridad" className="w-full" />
                        </div>
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="projectDescription" className='font-semibold'>Descripción (Opcional)</label>
                        <InputTextarea id="projectDescription" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} rows={4} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ProjectsPage;

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { rpcCall } from '../services/api';

// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Tag } from 'primereact/tag';
// import { InputText } from 'primereact/inputtext';
// import { ProgressBar } from 'primereact/progressbar';
// import { Dialog } from 'primereact/dialog';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { Calendar } from 'primereact/calendar';
// import { Dropdown } from 'primereact/dropdown';

// const ProjectsPage = () => {
//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [globalFilter, setGlobalFilter] = useState('');
//     const toast = useRef(null);
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
//     const [newProjectName, setNewProjectName] = useState('');
//     const [newProjectDescription, setNewProjectDescription] = useState('');
//     const [newProjectEndDate, setNewProjectEndDate] = useState(null);
//     const [newProjectPriority, setNewProjectPriority] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const priorities = [
//         { label: 'Baja', value: '4706b812-2efb-4e45-a61d-94f1d75737cb' },
//         { label: 'Media', value: '022678f0-30ce-46a1-a011-06ee3f117caf' },
//         { label: 'Alta', value: '1817ff68-342c-4a2b-9817-c3b0f23c4ba9' },
//         { label: 'Urgente', value: 'e8d5d10c-ada3-4856-bd7b-f170f40fb2d4' },
//     ];

//     const fetchProjects = useCallback(async () => {
//         setLoading(true);
//         try {
//             const result = await rpcCall('Project', 'listar');
//             const projectsWithDefaults = Array.isArray(result) 
//         /        ? result.map(p => ({ ...p, progreso: p.progreso || 0 })) // Añadimos progreso por defecto si no viene
//                 : [];
//             setProjects(projectsWithDefaults);
//         } catch (error) {
//             console.error("Error al obtener proyectos:", error);
//             toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos.' });
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchProjects();
//     }, [fetchProjects]);

//     const handleCreateProject = async () => {
//         if (!newProjectName.trim() || !newProjectEndDate || !newProjectPriority) {
//             toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, fecha de fin y prioridad son requeridos.' });
//             return;
//         }
//         setIsSubmitting(true);
//         try {
//             const params = {
//                 nombre: newProjectName,
//                 descripcion: newProjectDescription,
//                 fecha_fin_estimada: newProjectEndDate.toISOString().split('T')[0],
//                 prioridad_id: newProjectPriority
//             };
             
//             await rpcCall('Project', 'crear', params);
            
//             toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente.' });
            
//             setIsCreateModalVisible(false);
//             setNewProjectName('');
//             setNewProjectDescription('');
//             setNewProjectEndDate(null);
//             setNewProjectPriority(null);
//             fetchProjects();

//         } catch (error) {
//             console.error("Error al crear el proyecto:", error);
//             toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo crear el proyecto.' });
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Plantillas para la tabla
//     const getSeverity = (status) => {
//         switch (status) {
//             case 'Completado': return 'success';
//             case 'En Progreso': return 'info';
//             case 'Retrasado': return 'danger';
//             case 'Pendiente': return 'warning';
//             default: return 'secondary';
//         }
//     };
//     const statusBodyTemplate = (rowData) => <Tag value={rowData.estado || 'N/A'} severity={getSeverity(rowData.estado)} />;
//     const progressBodyTemplate = (rowData) => <ProgressBar value={rowData.progreso} showValue={false} style={{ height: '8px' }}></ProgressBar>;
    
//     const header = (
//         <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
//             <h1 className="text-2xl font-bold text-slate-800 m-0">Mis Proyectos</h1>
//             <div className="flex gap-2 w-full sm:w-auto">
//                 <span className="p-input-icon-left w-full">
//                     <i className="pi pi-search" />
//                     <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar proyecto..." className="w-full"/>
//                 </span>
//                 <Button label="Crear" icon="pi pi-plus" onClick={() => setIsCreateModalVisible(true)} />
//             </div>
//         </div>
//     );
    
//     const createModalFooter = (
//         <div>
//             <Button label="Cancelar" icon="pi pi-times" onClick={() => setIsCreateModalVisible(false)} className="p-button-text" />
//             <Button label="Guardar Proyecto" icon="pi pi-check" onClick={handleCreateProject} loading={isSubmitting} autoFocus />
//         </div>
//     );

//     return (
//         <div>
//             <Toast ref={toast} />
//             <div className="card shadow-1 border-round-lg">
//                 <DataTable 
//                     value={projects} 
//                     loading={loading}
//                     header={header}
//                     globalFilter={globalFilter}
//                     paginator rows={10} 
//                     rowsPerPageOptions={[5, 10, 25]}
//                     emptyMessage="No tienes proyectos asignados."
//                     className="p-datatable-customers"
//                     onRowClick={(e) => navigate(`/project/${e.data.id}`)}
//                     rowClassName={() => "cursor-pointer"}
//                     dataKey="id_proyecto"
//                     sortMode="multiple"
//                 >
//                     <Column field="nombre_proyecto" header="Nombre del Proyecto" sortable style={{ minWidth: '14rem' }} />
//                     <Column field="nombre_responsable" header="Responsable" sortable style={{ minWidth: '12rem' }} />
//                     <Column field="prioridad" header="Prioridad" sortable />
//                     <Column field="progreso" header="Avance" body={progressBodyTemplate} sortable />
//                     <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
//                 </DataTable>
//             </div>

//             <Dialog 
//                 header="Crear Nuevo Proyecto" 
//                 visible={isCreateModalVisible} 
//                 style={{ width: 'min(90vw, 500px)' }} 
//                 onHide={() => setIsCreateModalVisible(false)}
//                 footer={createModalFooter}
//                 draggable={false}
//                 modal
//             >
//                 <div className="flex flex-column gap-4 mt-3">
//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="projectName" className='font-semibold'>Nombre del Proyecto</label>
//                         <InputText id="projectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} autoFocus />
//                     </div>
                    
//                     <div className="grid formgrid">
//                         <div className="col-12 md:col-6 field">
//                              <label htmlFor="projectEndDate" className='font-semibold'>Fecha de Fin Estimada</label>
//                              <Calendar id="projectEndDate" value={newProjectEndDate} onChange={(e) => setNewProjectEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
//                         </div>
//                         <div className="col-12 md:col-6 field">
//                             <label htmlFor="projectPriority" className='font-semibold'>Prioridad</label>
//                             <Dropdown id="projectPriority" value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.value)} options={priorities} placeholder="Selecciona una prioridad" className="w-full" />
//                         </div>
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="projectDescription" className='font-semibold'>Descripción (Opcional)</label>
//                         <InputTextarea id="projectDescription" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} rows={4} />
//                     </div>
//                 </div>
//             </Dialog>
//         </div>
//     );
// };

// export default ProjectsPage;


// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { rpcCall } from '../services/api';

// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Tag } from 'primereact/tag';
// import { InputText } from 'primereact/inputtext';
// import { ProgressBar } from 'primereact/progressbar';
// import { Dialog } from 'primereact/dialog';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { Calendar } from 'primereact/calendar';
// import { Dropdown } from 'primereact/dropdown';

// const ProjectsPage = () => {
//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [globalFilter, setGlobalFilter] = useState('');
//     const toast = useRef(null);
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
//     const [newProjectName, setNewProjectName] = useState('');
//     const [newProjectDescription, setNewProjectDescription] = useState('');
//     const [newProjectEndDate, setNewProjectEndDate] = useState(null);
//     const [newProjectPriority, setNewProjectPriority] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const priorities = [
//         { label: 'Baja', value: 1 },
//         { label: 'Media', value: 2 },
//         { label: 'Alta', value: 3 }
//     ];

//     const fetchProjects = async () => {
//         if (!user?.id_usuario) return;
//         setLoading(true);
//         try {
//             const result = await rpcCall('proyectos.listar', { id_usuario: user.id_usuario });
//             const projectsWithDefaults = Array.isArray(result) 
// /                 ? result.map(p => ({ ...p, progreso: p.progreso || 0 }))
//                 : [];
//             setProjects(projectsWithDefaults);
//         } catch (error) {
//             console.error("Error al obtener proyectos:", error);
//             toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos.' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (user?.id_usuario) {
//             fetchProjects();
//         } else {
//             setLoading(false);
//         }
//     }, [user]);

//     const handleCreateProject = async () => {
//         if (!newProjectName.trim() || !newProjectEndDate || !newProjectPriority) {
//             toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre, fecha de fin y prioridad son requeridos.' });
//             return;
//         }
//         setIsSubmitting(true);
//         try {
//             const params = {
//                 nombre: newProjectName,
//                 descripcion: newProjectDescription,
//                 fecha_fin_estimada: newProjectEndDate.toISOString().split('T')[0],
//                 prioridad_id: newProjectPriority,
//                 id_usuario_propietario: user.id_usuario,
//             };
            
//             await rpcCall('proyectos.crear', params);
            
//             toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente.' });
            
//             setIsCreateModalVisible(false);
//             setNewProjectName('');
//             setNewProjectDescription('');
//             setNewProjectEndDate(null);
//             setNewProjectPriority(null);
//             fetchProjects();

//         } catch (error) {
//             console.error("Error al crear el proyecto:", error);
//             toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo crear el proyecto.' });
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const getSeverity = (status) => {
//         switch (status) {
//             case 'Completado': return 'success';
//             case 'En Progreso': return 'info';
//             case 'Retrasado': return 'danger';
//             case 'Pendiente': return 'warning';
//             default: return 'secondary';
//         }
//     };
//     const statusBodyTemplate = (rowData) => <Tag value={rowData.estado || 'N/A'} severity={getSeverity(rowData.estado)} />;
//     const progressBodyTemplate = (rowData) => <ProgressBar value={rowData.progreso} showValue={false} style={{ height: '8px' }}></ProgressBar>;
    
//     const header = (
//         <div className="flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
//             <h1 className="text-2xl font-bold text-slate-800 m-0">Mis Proyectos</h1>
//             <div className="flex gap-2 w-full sm:w-auto">
//                 <span className="p-input-icon-left w-full">
//                     <i className="pi pi-search" />
//                     <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar proyecto..." className="w-full"/>
//                 </span>
//                 <Button label="Crear" icon="pi pi-plus" onClick={() => setIsCreateModalVisible(true)} />
//             </div>
//         </div>
//     );
    
//     const createModalFooter = (
//         <div>
//             <Button label="Cancelar" icon="pi pi-times" onClick={() => setIsCreateModalVisible(false)} className="p-button-text" />
//             <Button label="Guardar Proyecto" icon="pi pi-check" onClick={handleCreateProject} loading={isSubmitting} autoFocus />
//         </div>
//     );

//     return (
//         <div>
//             <Toast ref={toast} />
//             <div className="card shadow-1 border-round-lg">
//                 <DataTable 
//                     value={projects} 
//                     loading={loading}
//                     header={header}
//                     globalFilter={globalFilter}
//                     paginator rows={10} 
//                     rowsPerPageOptions={[5, 10, 25]}
//                     emptyMessage="No tienes proyectos asignados."
//                     className="p-datatable-customers"
//                     onRowClick={(e) => navigate(`/project/${e.data.id_proyecto}`)}
//                     rowClassName={() => "cursor-pointer"}
//                     dataKey="id_proyecto"
//                     sortMode="multiple"
//                 >
//                     <Column field="nombre" header="Nombre del Proyecto" sortable style={{ minWidth: '14rem' }} />
//                     <Column field="nombre_responsable" header="Responsable" sortable style={{ minWidth: '12rem' }} />
//                     <Column field="prioridad" header="Prioridad" sortable />
//                     <Column field="progreso" header="Avance" body={progressBodyTemplate} sortable />
//                     <Column field="estado" header="Estado" body={statusBodyTemplate} sortable />
//                 </DataTable>
//             </div>

//             <Dialog 
//                 header="Crear Nuevo Proyecto" 
//                 visible={isCreateModalVisible} 
//                 style={{ width: 'min(90vw, 500px)' }} 
//                 onHide={() => setIsCreateModalVisible(false)}
//                 footer={createModalFooter}
//                 draggable={false}
//                 modal
//             >
//                 <div className="flex flex-column gap-4 mt-3">
//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="projectName" className='font-semibold'>Nombre del Proyecto</label>
//                         <InputText id="projectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} autoFocus />
//                     </div>
                    
//                     <div className="grid formgrid">
//                         <div className="col-12 md:col-6 field">
//                              <label htmlFor="projectEndDate" className='font-semibold'>Fecha de Fin Estimada</label>
//                              <Calendar id="projectEndDate" value={newProjectEndDate} onChange={(e) => setNewProjectEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
//                         </div>
//                         <div className="col-12 md:col-6 field">
//                             <label htmlFor="projectPriority" className='font-semibold'>Prioridad</label>
//                             <Dropdown id="projectPriority" value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.value)} options={priorities} placeholder="Selecciona una prioridad" className="w-full" />
//                         </div>
//                     </div>

//                     <div className="flex flex-column gap-2">
//                         <label htmlFor="projectDescription" className='font-semibold'>Descripción (Opcional)</label>
//                         <InputTextarea id="projectDescription" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} rows={4} />
//                     </div>
//                 </div>
//             </Dialog>
//         </div>
//     );
// };

// export default ProjectsPage;






// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { rpcCall } from '../services/api';

// // --- Componentes de PrimeReact ---
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Tag } from 'primereact/tag';
// import { InputText } from 'primereact/inputtext';
// import { ProgressBar } from 'primereact/progressbar';

// const ProjectsPage = () => {
//     const [projects, setProjects] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [globalFilter, setGlobalFilter] = useState('');
//     const toast = useRef(null);
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     useEffect(() => {
//         const fetchProjects = async () => {
//             setLoading(true);
//             try {
//                 // Usamos tu método RPC para listar proyectos
//                 const result = await rpcCall('proyectos.listar', { usuario_id: user.id });
//                 setProjects(result);
//             } catch (error) {
//                 console.error("Error al obtener proyectos:", error);
//                 toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos.' });
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (user?.id) {
//             fetchProjects();
//         }
//     }, [user]);

//     const getSeverity = (status) => {
//         switch (status) {
//             case 'Completado': return 'success';
//             case 'En Progreso': return 'info';
//             case 'Retrasado': return 'danger';
//             case 'Pendiente': return 'warning';
//             default: return null;
//         }
//     };

//     const statusBodyTemplate = (rowData) => {
//         return <Tag value={rowData.estado} severity={getSeverity(rowData.estado)} />;
//     };
    
//     const progressBodyTemplate = (rowData) => {
//         return <ProgressBar value={rowData.progreso} showValue={false} style={{ height: '8px' }}></ProgressBar>;
//     };

//     const header = (
//         <div className="flex justify-content-between align-items-center">
//             <h1 className="text-2xl font-bold text-slate-800 m-0">Mis Proyectos</h1>
//             <div className="flex gap-2">
//                 <span className="p-input-icon-left">
//                     <i className="pi pi-search" />
//                     <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
//                 </span>
//                 <Button label="Crear Proyecto" icon="pi pi-plus" onClick={() => navigate('/projects/new')} />
//             </div>
//         </div>
//     );

//     return (
//         <div>
//             <Toast ref={toast} />
//             <div className="card shadow-1">
//                 <DataTable 
//                     value={projects} 
//                     loading={loading}
//                     header={header}
//                     globalFilter={globalFilter}
//                     paginator rows={10} 
//                     rowsPerPageOptions={[5, 10, 25]}
//                     emptyMessage="No se encontraron proyectos."
//                     className="p-datatable-customers"
//                     onRowClick={(e) => navigate(`/project/${e.data.id_proyecto}`)} // Navegar al detalle del proyecto
//                     rowClassName="cursor-pointer"
//                 >
//                     <Column field="nombre" header="Nombre del Proyecto" sortable style={{ minWidth: '14rem' }} />
//                     <Column field="responsable_nombre" header="Responsable" sortable style={{ minWidth: '12rem' }} />
//                     <Column field="prioridad" header="Prioridad" sortable style={{ minWidth: '8rem' }} />
//                     <Column field="progreso" header="Avance" body={progressBodyTemplate} sortable style={{ minWidth: '10rem' }} />
//                     <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ minWidth: '10rem' }} />
//                 </DataTable>
//             </div>
//         </div>
//     );
// };

// export default ProjectsPage;