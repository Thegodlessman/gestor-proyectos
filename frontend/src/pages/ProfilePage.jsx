import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { rpcCall } from '../services/api';

// PrimeReact Components
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

const ProfilePage = () => {
    const toast = useRef(null);
    const { user, setUser } = useAuth();

    // State for user profile data
    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: '',
        correo: ''
    });

    // Loading state
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

    // Populate form with user data from context on mount
    useEffect(() => {
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                correo: user.correo || ''
            });
        }
    }, [user]);

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async () => {
        if (!profileData.nombre || !profileData.apellido) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre y Apellido son requeridos.' });
            return;
        }

        setIsProfileSubmitting(true);
        try {
            const params = {
                id_usuario: user.id_usuario,
                nombre: profileData.nombre,
                apellido: profileData.apellido,
            };
            await rpcCall('user.actualizarPerfil', params);

            // Update user in context to reflect changes globally
            setUser(prevUser => ({ ...prevUser, ...profileData }));

            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente.' });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo actualizar el perfil.' });
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto px-6 pb-6 pt-2 md:px-8 md:pb-8">
            <Toast ref={toast} />
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Tu perfil</h1>

            <div className="flex flex-column align-items-center mb-6">
                <Avatar image={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.nombre}+${user?.apellido}&background=random`} size="xlarge" shape="circle" className="mb-3" />
                <FileUpload 
                    mode="basic" 
                    name="avatar" 
                    url="/api/user/avatar-upload" // Endpoint de ejemplo
                    accept="image/*" 
                    maxFileSize={1000000} 
                    chooseLabel="Cambiar foto" 
                    className="p-button-sm p-button-outlined"
                    auto 
                    onUpload={() => toast.current.show({severity: 'info', summary: 'Éxito', detail: 'Foto actualizada (simulado)'})}
                />
            </div>

            <div className="flex flex-column gap-4">
                <div className="flex flex-column gap-2">
                    <label htmlFor="nombre" className="font-semibold">Nombre</label>
                    <InputText id="nombre" name="nombre" value={profileData.nombre} onChange={handleProfileInputChange} />
                </div>
               
                <div className="flex flex-column gap-2">
                    <label htmlFor="apellido" className="font-semibold">Apellido</label>
                    <InputText id="apellido" name="apellido" value={profileData.apellido} onChange={handleProfileInputChange} />
                </div>

                <div className="flex flex-column gap-2">
                    <label htmlFor="correo" className="font-semibold">Correo</label>
                    <InputText id="correo" value={profileData.correo} disabled />
                </div>
            </div>
            <div className="flex justify-content-end mt-6">
                <Button label="Guardar Cambios" icon="pi pi-check" onClick={handleProfileUpdate} loading={isProfileSubmitting} />
            </div>
        </div>
    );
};

export default ProfilePage;


// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { rpcCall } from '../services/api';

// // PrimeReact Components
// import { Button } from 'primereact/button';
// import { InputText } from 'primereact/inputtext';
// import { Avatar } from 'primereact/avatar';
// import { Toast } from 'primereact/toast';
// import { FileUpload } from 'primereact/fileupload';

// const ProfilePage = () => {
//     const toast = useRef(null);
//     const { user, setUser } = useAuth();

//     // State for user profile data
//     const [profileData, setProfileData] = useState({
//         nombre: '',
//         apellido: '',
//         correo: ''
//     });

//     // Loading state
//     const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

//     // Populate form with user data from context on mount
//     useEffect(() => {
//         if (user) {
//             setProfileData({
//                 nombre: user.nombre || '',
//                 apellido: user.apellido || '',
//                 correo: user.correo || ''
//             });
//         }
//     }, [user]);

//     const handleProfileInputChange = (e) => {
//         const { name, value } = e.target;
//         setProfileData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleProfileUpdate = async () => {
//         if (!profileData.nombre || !profileData.apellido) {
//             toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Nombre y Apellido son requeridos.' });
//             return;
//         }

//         setIsProfileSubmitting(true);
//         try {
//             const params = {
//                 id_usuario: user.id_usuario,
//                 nombre: profileData.nombre,
//                 apellido: profileData.apellido,
//             };
//             // Asumiendo que existe un método RPC para actualizar el perfil.
//             // Si el nombre es diferente, ajústalo aquí.
//             await rpcCall('user.actualizarPerfil', params);

//             // Update user in context to reflect changes globally
//             setUser(prevUser => ({ ...prevUser, ...profileData }));

//             toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente.' });
//         } catch (error) {
//             console.error("Error updating profile:", error);
//             toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo actualizar el perfil.' });
//         } finally {
//             setIsProfileSubmitting(false);
//         }
//     };

//     return (
//         // CORRECCIÓN: Se ajusta el padding para reducir el espacio superior (de p-6 a pt-2 y px-6 pb-6)
//         <div className="card max-w-2xl mx-auto px-6 pb-6 pt-2 md:px-8 md:pb-8">
//             <Toast ref={toast} />
//             <h1 className="text-3xl font-bold text-slate-800 mb-6">Tu perfil</h1>

//             <div className="flex flex-column align-items-center mb-6">
//                 <Avatar image={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.nombre}+${user?.apellido}&background=random`} size="xlarge" shape="circle" className="mb-3" />
//                 {/* La funcionalidad de subida de archivos requiere un endpoint en el backend que no existe actualmente. */}
//                 <FileUpload 
//                     mode="basic" 
//                     name="avatar" 
//                     url="/api/user/avatar-upload" // Endpoint de ejemplo
//                     accept="image/*" 
//                     maxFileSize={1000000} 
//                     chooseLabel="Cambiar foto" 
//                     className="p-button-sm p-button-outlined"
//                     auto // Uploads the file automatically on selection
//                     onUpload={() => toast.current.show({severity: 'info', summary: 'Éxito', detail: 'Foto actualizada (simulado)'})}
//                 />
//             </div>

//             {/* Profile Info Form */}
//             <div className="flex flex-column gap-4">
//                 <div className="flex flex-column gap-2">
//                     <label htmlFor="nombre" className="font-semibold">Nombre</label>
//                     <InputText id="nombre" name="nombre" value={profileData.nombre} onChange={handleProfileInputChange} />
//                 </div>
               
//                 <div className="flex flex-column gap-2">
//                     <label htmlFor="apellido" className="font-semibold">Apellido</label>
//                     <InputText id="apellido" name="apellido" value={profileData.apellido} onChange={handleProfileInputChange} />
//                 </div>

//                 <div className="flex flex-column gap-2">
//                     <label htmlFor="correo" className="font-semibold">Correo</label>
//                     <InputText id="correo" value={profileData.correo} disabled />
//                 </div>
//             </div>
//             <div className="flex justify-content-end mt-6">
//                 <Button label="Guardar Cambios" icon="pi pi-check" onClick={handleProfileUpdate} loading={isProfileSubmitting} />
//             </div>
//         </div>
//     );
// };

// export default ProfilePage;