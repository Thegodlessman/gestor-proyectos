import React, { useState, useEffect, useRef } from 'react';
import { rpcCall } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Badge } from 'primereact/badge';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const op = useRef(null); // Referencia para el panel flotante
    const { user } = useAuth();

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const result = await rpcCall('Notification', 'listarParaUsuario', { soloNoLeidas: true, limit: 5 });
            setNotifications(result);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para buscar notificaciones al cargar y luego cada 30 segundos
    useEffect(() => {
        fetchNotifications(); // Carga inicial
        const interval = setInterval(fetchNotifications, 5000); // Polling cada 30 segundos
        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [user]);

    const handleMarkAsRead = async () => {
        if (notifications.length === 0) return;
        try {
            const idsToMark = notifications.map(n => n.id);
            await rpcCall('Notification', 'marcarComoLeidas', { ids: idsToMark });
            setNotifications([]); 
        } catch (error) {
            console.error("Error al marcar como leídas:", error);
        }
    };

    const bellIcon = (
        <i className="pi pi-bell p-overlay-badge" style={{ fontSize: '1.5rem' }}>
            {notifications.length > 0 && <Badge value={notifications.length} severity="danger"></Badge>}
        </i>
    );

    return (
        <div>
            <Button
                icon={bellIcon}
                className="p-button-rounded p-button-text text-white"
                aria-label="Notifications"
                onClick={(e) => op.current.toggle(e)}
            />

            <OverlayPanel ref={op} className="w-full md:w-25rem">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h4 className='font-bold m-0'>Notificaciones</h4>
                    {notifications.length > 0 && (
                        <Button label="Marcar como leídas" className="p-button-link" onClick={handleMarkAsRead} />
                    )}
                </div>
                {loading && <p>Cargando...</p>}
                {!loading && notifications.length === 0 && <p>No tienes notificaciones nuevas.</p>}
                {!loading && notifications.map(notif => (
                    <div key={notif.id} className="p-2 border-bottom-1 border-gray-200">
                        <p className="m-0">{notif.mensaje}</p>
                        <small className="text-gray-500">{new Date(notif.fecha_creacion).toLocaleString()}</small>
                    </div>
                ))}
            </OverlayPanel>
        </div>
    );
};

export default NotificationBell;