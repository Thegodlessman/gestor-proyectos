
import React, { useRef, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import logoUrl from './proyectify.svg';

const API_BASE_URL = 'http://localhost:3000';

// Componente para mostrar la imagen de perfil o avatar por defecto
const ProfileImageAvatar = ({ user, imageUrl }) => {
    const [showFallback, setShowFallback] = useState(false);

    // Resetear el fallback cuando cambie la URL de la imagen
    useEffect(() => {
        setShowFallback(false);
    }, [imageUrl]);

    const handleImageError = () => {
        setShowFallback(true);
    };

    if (!imageUrl || showFallback) {
        return (
            <Avatar 
                label={user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'} 
                size="large" 
                shape="circle" 
                className="bg-sky-500 text-white"
            />
        );
    }

    return (
        <img 
            src={imageUrl} 
            alt="Foto de perfil" 
            onError={handleImageError}
            className="w-3rem h-3rem border-circle shadow-2"
            style={{ objectFit: 'cover' }}
        />
    );
};

const AppLayout = () => {
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menu = useRef(null);
    const [imageVersion, setImageVersion] = useState(Date.now());

    // Actualizar la versión de la imagen cuando cambie el usuario
    useEffect(() => {
        if (user?.profileImageVersion) {
            setImageVersion(user.profileImageVersion);
        }
    }, [user?.profileImageVersion]);

    // URL de la imagen del usuario
    const imageUrl = user?.id ? `${API_BASE_URL}/api/profile/image/${user.id}?v=${imageVersion}` : null;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    const userMenuItems = [
        { label: 'Mi Perfil', icon: 'pi pi-user', command: () => navigate('/profile') },
        { label: 'Seguridad', icon: 'pi pi-lock', command: () => navigate('/security') },
        { separator: true },
        { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: handleLogout }
    ];
    
    const getButtonClass = (path) => {
        return classNames('w-full p-button-text justify-content-start', {
            'text-sky-700 font-bold': location.pathname === path,
            'text-slate-700': location.pathname !== path
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
    
            <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:block">
                <div className="p-2 flex align-items-center gap-3 ">
                    <img src={logoUrl} alt="Proyectify Logo" style={{ height: '1.5rem', width: '1.5rem' }} />
                    <span className="text-2xl font-bold text-slate-500">Proyectify</span>
                </div>
                <nav className="p-3">
                    <ul className="list-none p-0 m-0">
                        <li className='mb-2'>
                            <Link to="/dashboard">
                                <Button 
                                    label="Dashboard" 
                                    className={getButtonClass('/dashboard')} 
                                />
                            </Link>
                        </li>
                        <li className='mb-2'>
                            <Link to="/projects">
                                <Button 
                                    label="Mis Proyectos"
                                    className={getButtonClass('/projects')}
                                />
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <div className="flex-1 flex flex-column">
                <header className="bg-white  h-16 flex justify-content-end align-items-center px-5 sticky top-0 z-10">
                    <div className="flex align-items-center gap-4">
                        <span className="font-semibold text-slate-600 hidden sm:block">
                            {user?.nombre || 'Usuario'} {user?.apellido || ''}
                        </span>
                        <div className='cursor-pointer' onClick={(e) => menu.current.toggle(e)} aria-controls="user-menu" aria-haspopup>
                            <ProfileImageAvatar user={user} imageUrl={imageUrl} />
                        </div>
                        <Menu model={userMenuItems} popup ref={menu} id="user-menu" />
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;


//v2
// import React, { useRef } from 'react';
// import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Avatar } from 'primereact/avatar';
// import { Menu } from 'primereact/menu';
// import { classNames } from 'primereact/utils';

// const AppLayout = () => {
//     const { user, logout } = useAuth(); 
//     const navigate = useNavigate();
//     const location = useLocation();
//     const menu = useRef(null);

//     const handleLogout = async () => {
//         try {
//             await logout();
//             navigate('/login');
//         } catch (error) {
//             console.error("Error al cerrar sesión", error);
//         }
//     };

//     const userMenuItems = [
//         { label: 'Mi Perfil', icon: 'pi pi-user', command: () => navigate('/profile') },
//         { label: 'Seguridad', icon: 'pi pi-lock', command: () => navigate('/security') },
//         { separator: true },
//         { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: handleLogout }
//     ];
    
//     const getNavLinkClass = (path) => {
//         return classNames('flex align-items-center p-3 border-round-lg text-slate-700 transition-colors transition-duration-150', {
//             'bg-sky-100 text-sky-700 font-bold': location.pathname === path,
//             'hover:bg-gray-100': location.pathname !== path
//         });
//     };

//     return (
//         <div className="flex min-h-screen bg-slate-50 font-sans">
    
//             <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:block">
//                 <div className="p-4 flex align-items-center gap-3 border-bottom-1 border-gray-200 h-16">
//                     <i className="pi pi-chart-line text-sky-600" style={{ fontSize: '2rem' }}></i>
//                     <span className="text-2xl font-bold text-slate-800">Proyectify</span>
//                 </div>
//                 <nav className="p-3">
//                     <ul className="list-none p-0 m-0">
//                         <li className='mb-2'>
//                             <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
//                                 <i className="pi pi-home mr-2"></i>
//                                 <span className="font-semibold">Dashboard</span>
//                             </Link>
//                         </li>
//                         <li className='mb-2'>
//                             <Link to="/projects" className={getNavLinkClass('/projects')}>
//                                 <i className="pi pi-briefcase mr-2"></i>
//                                 <span className="font-semibold">Mis Proyectos</span>
//                             </Link>
//                         </li>
//                     </ul>
//                 </nav>
//             </aside>

//             <div className="flex-1 flex flex-column">
//                 <header className="bg-white border-bottom-1 border-gray-200 h-16 flex justify-content-end align-items-center px-5 sticky top-0 z-10">
//                     <div className="flex align-items-center gap-4">
//                         <span className="font-semibold text-slate-600 hidden sm:block">
//                             {user?.nombre || 'Usuario'} {user?.apellido || ''}
//                         </span>
//                         <div className='cursor-pointer' onClick={(e) => menu.current.toggle(e)} aria-controls="user-menu" aria-haspopup>
//                             <Avatar 
//                                 label={user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'} 
//                                 size="large" 
//                                 shape="circle" 
//                                 className="bg-sky-500 text-white"
//                             />
//                         </div>
//                         <Menu model={userMenuItems} popup ref={menu} id="user-menu" />
//                     </div>
//                 </header>
//                 <main className="flex-1 p-4 md:p-6 lg:p-8">
//                     <Outlet />
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default AppLayout;

// import React, { useRef } from 'react';
// import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Avatar } from 'primereact/avatar';
// import { Menu } from 'primereact/menu';
// import { classNames } from 'primereact/utils';

// const AppLayout = () => {
//     const { user, logout } = useAuth(); 
//     const navigate = useNavigate();
//     const location = useLocation();
//     const menu = useRef(null);

//     const handleLogout = async () => {
//         try {
//             await logout();
//             navigate('/login');
//         } catch (error) {
//             console.error("Error al cerrar sesión", error);
//         }
//     };

//     const userMenuItems = [
//         { label: 'Mi Perfil', icon: 'pi pi-user', command: () => navigate('/profile') },
//         { label: 'Seguridad', icon: 'pi pi-lock', command: () => navigate('/security') },
//         { separator: true },
//         { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: handleLogout }
//     ];
    
//     const getNavLinkClass = (path) => classNames('flex items-center p-3 rounded-lg text-slate-700 transition-colors', {
//         'bg-sky-100 text-sky-700 font-bold': location.pathname === path,
//         'hover:bg-sky-100 hover:text-sky-700': location.pathname !== path
//     });

//     return (
//         <div className="flex min-h-screen bg-slate-100 font-sans">
//             {/* Barra Lateral Izquierda */}
//             <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden lg:block">
//                 <div className="p-4 flex items-center space-x-3 border-b h-16">
//                     <i className="pi pi-chart-line text-sky-600" style={{ fontSize: '1.5rem' }}></i>
//                     <span className="text-2xl font-bold text-slate-800">Proyectify</span>
//                 </div>
//                 <nav className="p-4">
//                     <ul className="space-y-2">
//                         <li>
//                             <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
//                                 <i className="pi pi-home mr-3"></i>
//                                 <span className="font-semibold">Dashboard</span>
//                             </Link>
//                         </li>
//                         <li>
//                             <Link to="/projects" className={getNavLinkClass('/projects')}>
//                                 <i className="pi pi-briefcase mr-3"></i>
//                                 <span className="font-semibold">Mis Proyectos</span>
//                             </Link>
//                         </li>
//                     </ul>
//                 </nav>
//             </aside>

//             {/* Contenido Principal con Cabecera */}
//             <div className="flex-1 flex flex-col">
//                 <header className="bg-white border-b h-16 flex justify-end items-center px-6">
//                     <div className="flex items-center space-x-4">
//                         <span className="font-semibold text-slate-600 hidden sm:block">
//                             Hola, {user?.nombre || 'Usuario'}
//                         </span>
//                         <div className='cursor-pointer' onClick={(e) => menu.current.toggle(e)}>
//                             <Avatar 
//                                 label={user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'} 
//                                 size="large" 
//                                 shape="circle" 
//                                 className="bg-sky-500 text-white"
//                             />
//                         </div>
//                         <Menu model={userMenuItems} popup ref={menu} id="user-menu" />
//                     </div>
//                 </header>
//                 <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
//                     {/* Aquí se renderizará el Dashboard o la página activa */}
//                     <Outlet />
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default AppLayout;
