import cron from 'node-cron';
import dataAccess from '../data/DataAccess.js';

// Esta función se ejecutará todos los días a las 8:00 AM
export const startDeadlineChecker = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('Ejecutando tarea programada: Verificador de vencimientos...');
        try {
            const query = `
                SELECT a.id, a.descripcion, aa.usuario_id, p.nombre_proyecto
                FROM actividades a
                JOIN asignaciones_actividades aa ON a.id = aa.actividad_id
                JOIN proyectos p ON a.proyecto_id = p.id
                WHERE a.fecha_fin_estimada BETWEEN NOW() AND NOW() + INTERVAL '3 days'
                AND a.notificacion_vencimiento_enviada = false;
            `;
            const { rows: actividadesPorVencer } = await dataAccess.exe(query);
            
            if (actividadesPorVencer.length > 0) {
                const { rows: tipoNotif } = await dataAccess.exe("SELECT id FROM tipos_notificacion WHERE codigo_tipo = 'VENCIMIENTO_PROXIMO'");
                if (tipoNotif.length > 0) {
                    for (const act of actividadesPorVencer) {
                        const mensaje = `La actividad '${act.descripcion}' del proyecto '${act.nombre_proyecto}' está próxima a vencer.`;
                        await dataAccess.exe(
                            "INSERT INTO notificaciones (usuario_id, tipo_notificacion_id, mensaje, referencia_id, entidad_referencia) VALUES ($1, $2, $3, $4, 'actividad')",
                            [act.usuario_id, tipoNotif[0].id, mensaje, act.id]
                        );
                        // Marcamos la actividad para no volver a notificar
                        await dataAccess.exe("UPDATE actividades SET notificacion_vencimiento_enviada = true WHERE id = $1", [act.id]);
                    }
                }
            }
        } catch (error) {
            console.error('Error en el cron job de vencimientos:', error);
        }
    });
};