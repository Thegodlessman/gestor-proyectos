import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

const API_BASE_URL = 'http://localhost:3000';

const ProfileImage = () => {
    const { user } = useAuth();
    const toast = useRef(null);
    // Estado para forzar la recarga de la imagen después de subir una nueva
    const [imageVersion, setImageVersion] = useState(Date.now());

    // URL de la imagen del usuario
    const imageUrl = `${API_BASE_URL}/api/profile/image/${user.id}?v=${imageVersion}`;

    // Esta función se llama cuando la subida es exitosa
    const onUpload = () => {
        toast.current.show({ severity: 'info', summary: 'Éxito', detail: 'Imagen subida correctamente' });
        // Cambiamos el estado para forzar la actualización de la URL de la imagen
        setImageVersion(Date.now());
    };
    
    // Esta función se llama si la subida falla
    const onError = (e) => {
        const response = JSON.parse(e.xhr.response);
        toast.current.show({ severity: 'error', summary: 'Error', detail: response.message || 'No se pudo subir la imagen.' });
    };

    return (
        <div className="card bg-dark p-4">
            <h3 className="text-xl font-semibold mb-4">Foto de Perfil</h3>
            <div className="flex flex-column align-items-center gap-4">
                <Toast ref={toast}></Toast>
                
                <img 
                    src={imageUrl} 
                    alt="Foto de perfil" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'; }}
                    className="w-9rem h-9rem border-2 border-circle border-gray-700 shadow-4"
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
        </div>
    );
};

export default ProfileImage;