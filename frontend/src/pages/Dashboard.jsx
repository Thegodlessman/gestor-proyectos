
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { rpcCall } from '../services/api';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';

import ProfileImage from '../components/ProfileImage';

const DashboardPage = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();
    const toast = useRef(null);

    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);

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

    const urgentTasks = [
        { name: 'Desarrollo de API de Proyectos', project: 'Lanzamiento App Móvil Q3', due: 'Vence hace 2 días' },
        { name: 'Revisión de estrategia SEO', project: 'Campaña de Marketing Digital', due: 'Vence en 3 días' },
        { name: 'Pruebas finales de migración', project: 'Migración a Nuevo Servidor Cloud', due: 'Vence en 5 días' },
    ];

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
                                <Card title="Mis Tareas Urgentes" className="shadow-1 h-full">
                                    <ul className="list-none p-0 m-0">
                                        {urgentTasks.map((task, index) => (
                                            <li key={index} className="flex align-items-center py-3 border-bottom-1 border-gray-200">
                                                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-amber-100 border-circle mr-3 flex-shrink-0">
                                                    <i className="pi pi-clock text-amber-500 text-xl"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 m-0">{task.name}</p>
                                                    <p className="text-sm text-slate-500 m-0">{task.due}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
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

            <ProfileImage />
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