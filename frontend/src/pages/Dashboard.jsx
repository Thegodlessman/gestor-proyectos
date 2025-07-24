
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { rpcCall } from '../services/api';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';



const DashboardPage = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const toast = useRef(null);

    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [userActivities, setUserActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await rpcCall('Invitation', 'crear', { email: inviteEmail });
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: result.message });
            setInviteEmail(''); 
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener las actividades asignadas al usuario
    const fetchUserActivities = useCallback(async () => {
        if (!user?.id) return;
        
        setActivitiesLoading(true);
        try {
            // 1. Obtener todos los proyectos del usuario
            const projects = await rpcCall('Project', 'listar');
            
            if (!Array.isArray(projects) || projects.length === 0) {
                setUserActivities([]);
                return;
            }

            // 2. Para cada proyecto, obtener su jerarquía y filtrar actividades del usuario
            const allUserActivities = [];
            
            for (const project of projects) {
                try {
                    const projectHierarchy = await rpcCall('Project', 'obtenerJerarquia', { proyecto_id: project.id });
                    
                    // Recorrer la jerarquía para encontrar actividades asignadas al usuario
                    if (projectHierarchy?.objetivos_generales) {
                        projectHierarchy.objetivos_generales.forEach(og => {
                            if (og.objetivos_especificos) {
                                og.objetivos_especificos.forEach(oe => {
                                    if (oe.actividades) {
                                        oe.actividades.forEach(actividad => {
                                            // Verificar si el usuario está asignado a esta actividad
                                            const isAssigned = actividad.usuarios_asignados?.some(
                                                usuario => usuario.usuario_id === user.id
                                            );
                                            
                                            if (isAssigned) {
                                                allUserActivities.push({
                                                    ...actividad,
                                                    proyecto_nombre: project.nombre_proyecto,
                                                    proyecto_id: project.id
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error obteniendo jerarquía del proyecto ${project.id}:`, error);
                }
            }

            // 3. Ordenar por fecha de fin (más urgentes primero)
            allUserActivities.sort((a, b) => {
                if (!a.fecha_fin_estimada) return 1;
                if (!b.fecha_fin_estimada) return -1;
                return new Date(a.fecha_fin_estimada) - new Date(b.fecha_fin_estimada);
            });

            // 4. Tomar solo las primeras 5 actividades más urgentes
            setUserActivities(allUserActivities.slice(0, 5));
            
        } catch (error) {
            console.error('Error obteniendo actividades del usuario:', error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudieron cargar las actividades.' 
            });
        } finally {
            setActivitiesLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchUserActivities();
    }, [fetchUserActivities]);

    // Función para formatear la fecha de vencimiento
    const formatDueDate = (dateString) => {
        if (!dateString) return 'Sin fecha límite';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Vence hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays === 0) {
            return 'Vence hoy';
        } else if (diffDays === 1) {
            return 'Vence mañana';
        } else {
            return `Vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        }
    };

    // Función para obtener el severity del estado
    const getStatusSeverity = (estado) => {
        switch (estado) {
            case 'Completada': return 'success';
            case 'En Progreso': return 'info';
            case 'Pendiente': return 'warning';
            default: return 'secondary';
        }
    };

    const projectStatusData = {
        labels: ['En Progreso', 'Retrasado', 'Completado', 'Pendiente'],
        datasets: [{ data: [5, 2, 8, 3], backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#e5e7eb'] }]
    };
    const chartOptions = { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, color: '#4b5563' } } }, cutout: '60%' };

    return (
        <>
            <Toast ref={toast} />
            <div>
                <div className="flex flex-column sm:flex-row justify-content-between align-items-start mb-5 gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 m-0">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Bienvenido, {user?.nombre} {user?.apellido}!</p>
                    </div>
                    <div className="flex gap-2">
                        <Button label="Crear un proyecto" icon="pi pi-plus" onClick={() => navigate('/projects/new')} />
                        <Button label="Ir a mis proyectos" icon="pi pi-arrow-right" className="p-button-outlined" onClick={() => navigate('/projects')} />
                    </div>
                </div>

                <div className="grid">
                    <div className="col-12 lg:col-8">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card title="Mis Actividades" className="shadow-1 h-full">
                                    {activitiesLoading ? (
                                        <div className="flex align-items-center justify-content-center p-4">
                                            <i className="pi pi-spinner pi-spin text-2xl text-blue-500"></i>
                                            <span className="ml-2">Cargando actividades...</span>
                                        </div>
                                    ) : userActivities.length === 0 ? (
                                        <div className="text-center p-4">
                                            <i className="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
                                            <p className="text-slate-600 m-0">No tienes actividades asignadas</p>
                                        </div>
                                    ) : (
                                        <ul className="list-none p-0 m-0">
                                            {userActivities.map((activity, index) => (
                                                <li key={activity.id} className="flex align-items-start py-3 border-bottom-1 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => navigate(`/project/${activity.proyecto_id}`)}>
                                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                                        <i className="pi pi-check-square text-blue-500 text-xl"></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex align-items-center gap-2 mb-1">
                                                            <p className="font-bold text-slate-800 m-0 flex-1">{activity.descripcion}</p>
                                                            <Tag 
                                                                value={activity.estado_actividad} 
                                                                severity={getStatusSeverity(activity.estado_actividad)}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                        <p className="text-sm text-slate-500 m-0 mb-1">{activity.proyecto_nombre}</p>
                                                        <p className="text-xs text-slate-400 m-0">{formatDueDate(activity.fecha_fin_estimada)}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card title="Proyectos por Estado" className="shadow-1 h-full flex flex-column align-items-center justify-content-center">
                                    <Chart type="doughnut" data={projectStatusData} options={chartOptions} style={{ position: 'relative', width: '75%' }} />
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-4">
                       <div className="flex flex-column gap-4">
                           {user?.nombre_rol === 'Administrador' && (
                                <Card title="Gestionar Equipo" className="shadow-1">
                                    <p className="m-0 text-sm text-slate-600 mb-4">Invita a nuevos miembros a unirse a tu empresa.</p>
                                    <form onSubmit={handleInviteSubmit}>
                                        <div className="p-inputgroup mb-3">
                                            <InputText 
                                                placeholder="Correo del nuevo miembro"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                required 
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            label="Enviar Invitación" 
                                            icon="pi pi-send" 
                                            className="w-full"
                                            loading={loading}
                                        />
                                    </form>
                                </Card>
                            )}
                            <Card title="Seguridad de la Cuenta" className="shadow-1">
                                <p className="m-0 text-sm text-slate-600 mb-4">Añade o actualiza tus preguntas de seguridad para proteger tu cuenta.</p>
                                <Button label="Configurar Preguntas" className="w-full p-button-outlined" onClick={() => navigate('/security')} />
                            </Card>
                       </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;



// import React, { useState, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { rpcCall } from '../services/api';

// // --- Componentes de PrimeReact para la nueva UI ---
// import { Card } from 'primereact/card';
// import { Button } from 'primereact/button';
// import { InputText } from 'primereact/inputtext';
// import { Toast } from 'primereact/toast';
// import { Chart } from 'primereact/chart';

// const DashboardPage = () => {
//     const { user } = useAuth(); 
//     const navigate = useNavigate();
//     const toast = useRef(null);

//     // --- Lógica funcional para invitación (de tu código original) ---
//     const [inviteEmail, setInviteEmail] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleInviteSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const result = await rpcCall('invitaciones.crear', { email: inviteEmail });
//             toast.current.show({ severity: 'success', summary: 'Éxito', detail: result.message });
//             setInviteEmail(''); 
//         } catch (error) {
//             toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- Datos de ejemplo para los widgets visuales ---
//     const urgentTasks = [
//         { name: 'Desarrollo de API de Proyectos', project: 'Lanzamiento App Móvil Q3', due: 'Vence hace 2 días' },
//         { name: 'Revisión de estrategia SEO', project: 'Campaña de Marketing Digital', due: 'Vence en 3 días' },
//         { name: 'Pruebas finales de migración', project: 'Migración a Nuevo Servidor Cloud', due: 'Vence en 5 días' },
//     ];

//     const projectStatusData = {
//         labels: ['En Progreso', 'Retrasado', 'Completado', 'Pendiente'],
//         datasets: [{ data: [5, 2, 8, 3], backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#e5e7eb'] }]
//     };
//     const chartOptions = { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, color: '#4b5563' } } }, cutout: '60%' };

//     return (
//         <>
//             <Toast ref={toast} />
//             <div className="surface-ground">
//                 {/* --- Cabecera del Dashboard --- */}
//                 <div className="flex flex-column sm:flex-row justify-content-between align-items-start mb-5 gap-3">
//                     <div>
//                         <h1 className="text-3xl font-bold text-slate-900 m-0">Dashboard</h1>
//                         <p className="text-slate-500 mt-1">Bienvenido, {user?.nombre} {user?.apellido}!</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button label="Crear un proyecto" icon="pi pi-plus" onClick={() => navigate('/projects/new')} />
//                         <Button label="Ir a mis proyectos" icon="pi pi-arrow-right" className="p-button-outlined" onClick={() => navigate('/projects')} />
//                     </div>
//                 </div>

//                 {/* --- Contenedor de Widgets con Grid Layout (CORREGIDO) --- */}
//                 <div className="grid">
//                     {/* Columna Principal (8 de 12) */}
//                     <div className="col-12 lg:col-8">
//                         <div className="grid">
//                             <div className="col-12 md:col-6">
//                                 <Card title="Mis Tareas Urgentes" className="shadow-1 h-full">
//                                     <ul className="list-none p-0 m-0 space-y-4">
//                                         {urgentTasks.map((task, index) => (
//                                             <li key={index} className="border-left-3 border-amber-500 pl-3">
//                                                 <p className="font-semibold text-slate-800 m-0">{task.name}</p>
//                                                 <p className="text-sm text-slate-500 m-0">{task.project} - <span className="font-medium">{task.due}</span></p>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </Card>
//                             </div>
//                             <div className="col-12 md:col-6">
//                                 <Card title="Proyectos por Estado" className="shadow-1 h-full">
//                                     <div className="flex justify-content-center">
//                                       <Chart type="doughnut" data={projectStatusData} options={chartOptions} style={{ position: 'relative', width: '75%' }} />
//                                     </div>
//                                 </Card>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Columna Lateral (4 de 12) */}
//                     <div className="col-12 lg:col-4">
//                        <div className="flex flex-column gap-4">
//                            {user?.nombre_rol === 'Administrador' && (
//                                 <Card title="Gestionar Equipo" className="shadow-1">
//                                     <p className="m-0 text-sm text-slate-600 mb-4">Invita a nuevos miembros a unirse a tu empresa.</p>
//                                     <form onSubmit={handleInviteSubmit}>
//                                         <div className="p-inputgroup mb-3">
//                                             <InputText 
//                                                 placeholder="Correo del nuevo miembro"
//                                                 value={inviteEmail}
//                                                 onChange={(e) => setInviteEmail(e.target.value)}
//                                                 required 
//                                             />
//                                         </div>
//                                         <Button 
//                                             type="submit" 
//                                             label="Enviar Invitación" 
//                                             icon="pi pi-send" 
//                                             className="w-full"
//                                             loading={loading}
//                                         />
//                                     </form>
//                                 </Card>
//                             )}
//                             <Card title="Seguridad de la Cuenta" className="shadow-1">
//                                 <p className="m-0 text-sm text-slate-600 mb-4">Añade o actualiza tus preguntas de seguridad para proteger tu cuenta.</p>
//                                 <Button label="Configurar Preguntas" className="w-full p-button-outlined" onClick={() => navigate('/security')} />
//                             </Card>
//                        </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DashboardPage;



// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import { rpcCall } from '../services/api'; // Importamos nuestra función RPC

// function DashboardPage() {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();

//     // --- NUEVOS ESTADOS PARA EL FORMULARIO DE INVITACIÓN ---
//     const [inviteEmail, setInviteEmail] = useState('');
//     const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });

//     const handleLogout = async () => {
//         try {
//             await logout();
//             navigate('/login');
//         } catch (error) {
//             console.error("Error al cerrar sesión", error);
//         }
//     };

//     // --- NUEVA FUNCIÓN PARA ENVIAR INVITACIONES ---
//     const handleInviteSubmit = async (e) => {
//         e.preventDefault();
//         setInviteMessage({ type: '', text: '' }); // Limpiamos mensajes previos
//         try {
//             const result = await rpcCall('invitaciones.crear', { email: inviteEmail });
//             setInviteMessage({ type: 'success', text: result.message });
//             setInviteEmail(''); // Limpiamos el input
//         } catch (error) {
//             setInviteMessage({ type: 'danger', text: error.message });
//         }
//     };

//     return (
//         <div>
//             {/* ... (Navbar existente, no cambia) ... */}
//             <div className="container mt-5">
//                 <h1 className="text-primary-emphasis">Dashboard Principal</h1>
//                 <p className="text-body-secondary">Bienvenido, {user?.nombre} {user?.apellido}!</p>
                
//                 <div className="card bg-dark mt-4">
//                     <div className="card-body">
//                         <h5 className="card-title">Seguridad de la Cuenta</h5>
//                         <p className="card-text">Añade o actualiza tus preguntas de seguridad para proteger tu cuenta.</p>
//                         <Link to="/seguridad" className="btn btn-primary">Configurar Preguntas</Link>
//                     </div>
//                 </div>

//                 {/* --- SECCIÓN PARA ADMINISTRADORES --- */}
//                 {user?.nombre_rol === 'Administrador' && (
//                     <div className="card bg-dark mt-4">
//                         <div className="card-body">
//                             <h5 className="card-title">Gestionar Equipo</h5>
//                             <p className="card-text">Invita a nuevos miembros a unirse a tu empresa.</p>
//                             <form onSubmit={handleInviteSubmit}>
//                                 <div className="mb-3">
//                                     <label htmlFor="inviteEmail" className="form-label">Correo del nuevo miembro</label>
//                                     <input 
//                                         type="email" 
//                                         className="form-control" 
//                                         id="inviteEmail"
//                                         placeholder="ejemplo@empresa.com"
//                                         value={inviteEmail}
//                                         onChange={(e) => setInviteEmail(e.target.value)}
//                                         required
//                                     />
//                                 </div>
//                                 <button type="submit" className="btn btn-success">Enviar Invitación</button>
//                             </form>
//                             {inviteMessage.text && (
//                                 <div className={`alert alert-${inviteMessage.type} mt-3`}>
//                                     {inviteMessage.text}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default DashboardPage;