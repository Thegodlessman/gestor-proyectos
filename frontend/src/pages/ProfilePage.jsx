import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { rpcCall } from '../services/api';

// PrimeReact Components
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

const API_BASE_URL = 'http://localhost:3000';

const ProfilePage = () => {
    const toast = useRef(null);
    const { user, setUser } = useAuth();

    // State for user profile data
    const [profileData, setProfileData] = useState({
        nombre: '',
        apellido: ''
    });

    // Loading state
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    
    // Estado para forzar la recarga de la imagen después de subir una nueva
    const [imageVersion, setImageVersion] = useState(Date.now());

    // Populate form with user data from context on mount
    useEffect(() => {
        if (user) {
            setProfileData({
                nombre: user.nombre || '',
                apellido: user.apellido || ''
            });
        }
    }, [user]);

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // URL de la imagen del usuario
    const imageUrl = `${API_BASE_URL}/api/profile/image/${user?.id}?v=${imageVersion}`;

    // Esta función se llama cuando la subida es exitosa
    const onUpload = () => {
        toast.current.show({ severity: 'info', summary: 'Éxito', detail: 'Imagen subida correctamente' });
        // Cambiamos el estado para forzar la actualización de la URL de la imagen
        setImageVersion(Date.now());
        // También actualizamos el contexto del usuario para que se refleje en el header
        setUser(prevUser => ({ ...prevUser, profileImageVersion: Date.now() }));
    };
    
    // Esta función se llama si la subida falla
    const onError = (e) => {
        const response = JSON.parse(e.xhr.response);
        toast.current.show({ severity: 'error', summary: 'Error', detail: response.message || 'No se pudo subir la imagen.' });
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
                <h3 className="text-xl font-semibold mb-4">Foto de Perfil</h3>
                <img 
                    src={imageUrl} 
                    alt="Foto de perfil" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'; }}
                    className="w-9rem h-9rem border-2 border-circle border-gray-700 shadow-4 mb-3"
                />
                <FileUpload 
                    name="profileImage" // Debe coincidir con el nombre esperado por Multer
                    url={`${API_BASE_URL}/api/profile/image`}
                    withCredentials={true} // ¡MUY IMPORTANTE para enviar la cookie de sesión!
                    accept="image/*" 
                    maxFileSize={5000000} // 5MB
                    onUpload={onUpload}
                    onError={onError}
                    chooseLabel="Cambiar Foto"
                    uploadLabel="Subir"
                    cancelLabel="Cancelar"
                    mode="basic" // Estilo de botón simple
                    auto // Sube la imagen automáticamente al seleccionarla
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
            </div>
            <div className="flex justify-content-end mt-6">
                <Button label="Guardar Cambios" icon="pi pi-check" onClick={handleProfileUpdate} loading={isProfileSubmitting} />
            </div>
        </div>
    );
};

export default ProfilePage;

