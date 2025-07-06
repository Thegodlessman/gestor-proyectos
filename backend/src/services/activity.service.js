import db from '../config/db.js';

/**
 * Crea una nueva actividad dentro de un proyecto y opcionalmente la liga a un objetivo específico.
 * @param {object} params - { proyecto_id, objetivo_especifico_id, descripcion, fecha_fin_estimada, prioridad_id }
 * @param {object} usuarioSesion - El usuario de la sesión.
 * @returns {object} La actividad recién creada.
 */
export const crearActividad = async (params, usuarioSesion) => {
    const { proyecto_id, objetivo_especifico_id, descripcion, fecha_fin_estimada, prioridad_id } = params;
    const { empresa_id } = usuarioSesion;

    if (!proyecto_id || !descripcion || !fecha_fin_estimada || !prioridad_id) {
        throw new Error('Se requieren proyecto, descripción, fecha de fin y prioridad.');
    }

    // Verificamos que el proyecto exista y pertenezca a la empresa del usuario
    const proyectoQuery = 'SELECT id FROM proyectos WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL';
    const proyectoResult = await db.query(proyectoQuery, [proyecto_id, empresa_id]);
    if (proyectoResult.rowCount === 0) {
        throw new Error('Proyecto no encontrado o no tienes permiso.');
    }
    
    // Suponiendo que el estado inicial es 'Pendiente'
    const estadoResult = await db.query("SELECT id FROM estados_actividad WHERE nombre_estado = 'Pendiente'");
    if (estadoResult.rowCount === 0) throw new Error("Estado 'Pendiente' no encontrado en la tabla 'estados_actividad'.");
    const estado_inicial_id = estadoResult.rows[0].id;
    
    const query = `
        INSERT INTO actividades 
            (proyecto_id, objetivo_especifico_id, descripcion, fecha_fin_estimada, prioridad_id, estado_actividad_id)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;

    const values = [proyecto_id, objetivo_especifico_id || null, descripcion, fecha_fin_estimada, prioridad_id, estado_inicial_id];
    const { rows } = await db.query(query, values);
    return rows[0];
};