import React from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';

// Componente principal del Dashboard
const DashboardProyecto = () => {

    // Datos de ejemplo para las tareas urgentes
    // En una aplicación real, estos datos vendrían de una API
    const tareasUrgentes = [
        { id: 1, titulo: 'Revisar flujo de trabajo de marketing', vence: 'Vence en 2 días', progreso: '2/3' },
        { id: 2, titulo: 'Actualizar copia de la pagina de inicio', vence: 'Vence en 4 días', progreso: '1/3' },
        { id: 3, titulo: 'Investigar herramientas de análisis de datos', vence: 'Vence en 6 días', progreso: '0/3' },
        { id: 4, titulo: 'Crear informe de rendimiento de ventas', vence: 'Vence en 8 días', progreso: '0/3' },
        { id: 5, titulo: 'Optimizar el flujo de registro de usuarios', vence: 'Vence en 10 días', progreso: '0/3' }
    ];

    // Contenido para la barra de navegación superior (Toolbar)
    const startContent = (
        <React.Fragment>
            <h1 className="text-xl font-semibold">Gestor de proyecto</h1>
        </React.Fragment>
    );

    const endContent = (
        <React.Fragment>
            <Button icon="pi pi-bell" className="p-button-text p-button-rounded mr-2" />
            <Button icon="pi pi-search" className="p-button-text p-button-rounded mr-2" />
            <Avatar image="https://i.pravatar.cc/150?u=luigi" size="large" shape="circle" />
        </React.Fragment>
    );

    // Estilos para el banner con imagen de fondo
    const bannerStyle = {
        backgroundImage: `url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')`, // URL de una imagen de fondo de ejemplo
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '12px',
        color: 'white',
        padding: '4rem'
    };


    return (
        <div className="surface-ground p-4 lg:p-6">
            
            {/* 1. Barra de Navegación Superior */}
            <Toolbar start={startContent} end={endContent} className="surface-card shadow-1 border-round-lg" />

            <div className="mt-5">
                
                {/* 2. Saludo y Banner Principal */}
                <h2 className="text-3xl font-bold text-color">Hola, Luigi</h2>
                
                <div style={bannerStyle} className="mt-4 flex flex-column align-items-center justify-content-center text-center">
                    <h1 className="text-4xl md:text-5xl font-bold">Bienvenida a tu plataforma de gestor de proyectos</h1>
                    <p className="text-lg mt-2">loremp</p>
                    <div className="mt-5">
                        <Button label="Crear nuevo proyecto" className="p-button-lg mr-3" />
                        <Button label="Abrir un proyecto existente" className="p-button-lg p-button-outlined" />
                    </div>
                </div>

                {/* 3. Sección de Tareas Urgentes */}
                <div className="mt-6">
                    <Card title="Mis tareas urgentes" className="shadow-2 border-round-lg">
                        <div className="flex flex-column gap-4">
                            {tareasUrgentes.map((tarea) => (
                                <div key={tarea.id} className="flex align-items-center p-3 border-bottom-1 surface-border">
                                    <i className="pi pi-clock text-xl text-color-secondary mr-4"></i>
                                    <div className="flex-grow-1">
                                        <p className="font-semibold text-lg mb-1">{tarea.titulo}</p>
                                        <p className="text-color-secondary">{tarea.vence}</p>
                                    </div>
                                    <span className="font-semibold text-lg">{tarea.progreso}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                
            </div>

            {/* 4. Pie de Página */}
            <footer className="mt-6 text-color-secondary text-center">
                <div className="flex justify-content-center gap-4 mb-3">
                    <a href="#" className="text-color-secondary no-underline">Terminos de servicio</a>
                    <a href="#" className="text-color-secondary no-underline">Política de privacidad</a>
                    <a href="#" className="text-color-secondary no-underline">Ayuda y soporte</a>
                </div>
                <p>2022, todos los derechos reservados</p>
            </footer>

        </div>
    );
};

export default DashboardProyecto;