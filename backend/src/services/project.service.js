import db from '../config/db.js';

/**
 * Crea un nuevo proyecto y asigna al creador como líder del proyecto.
 * @param {object} params - Parámetros de la función. Debe contener {nombre, descripcion}.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión actual.
 * @returns {object} El proyecto recién creado.
 */

export const crearProyecto = async (params, usuarioSesion) => {
    const { nombre, descripcion, fecha_fin_estimada } = params;
    const { id: usuario_id, empresa_id } = usuarioSesion;

    if (!nombre || !fecha_fin_estimada) {
        throw new Error('El nombre del proyecto y la fecha de fin estimada son requeridos.');
    }

    const client = await db.getPool().connect();
    try {
        await client.query('BEGIN');

        // Buscamos los IDs del estado inicial y del rol de líder.
        const estadoResult = await client.query("SELECT id FROM estados_proyecto WHERE nombre_estado = 'Planificado'");
        if (estadoResult.rows.length === 0) throw new Error("Estado 'Planificado' no encontrado.");
        const estado_inicial_id = estadoResult.rows[0].id;

        const rolLiderResult = await client.query("SELECT id FROM roles_proyecto WHERE nombre_rol_proyecto = 'Líder de Proyecto'");
        if (rolLiderResult.rows.length === 0) throw new Error("Rol 'Líder de Proyecto' no encontrado.");
        const rol_lider_id = rolLiderResult.rows[0].id;

        // 1. Insertar el nuevo proyecto
        const proyectoQuery = `
            INSERT INTO proyectos (nombre_proyecto, descripcion, fecha_inicio, fecha_fin_estimada, estado_proyecto_id, usuario_creador_id, empresa_id)
            VALUES ($1, $2, NOW(), $3, $4, $5, $6)
            RETURNING *;
        `;
        const nuevoProyectoResult = await client.query(proyectoQuery, [nombre, descripcion || null, fecha_fin_estimada, estado_inicial_id, usuario_id, empresa_id]);
        const nuevoProyecto = nuevoProyectoResult.rows[0];

        // 2. Asignar al usuario creador al proyecto con el rol de "Líder de Proyecto"
        const asignacionQuery = `
            INSERT INTO proyecto_usuarios (proyecto_id, usuario_id, rol_proyecto_id)
            VALUES ($1, $2, $3);
        `;
        await client.query(asignacionQuery, [nuevoProyecto.id, usuario_id, rol_lider_id]);

        await client.query('COMMIT');
        
        return nuevoProyecto;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error; 
    } finally {
        client.release();
    }
};

/**
 * Lista todos los proyectos de la empresa del usuario actual.
 * @param {object} params - Parámetros (actualmente no se usa).
 * @param {object} usuarioSesion - El objeto de usuario de la sesión actual.
 * @returns {Array} Un array de proyectos.
 */
export const listarProyectos = async (params, usuarioSesion) => {
    const { empresa_id } = usuarioSesion;

    const query = `
        SELECT * FROM proyectos 
        WHERE empresa_id = $1 
        ORDER BY fecha_creacion DESC;
    `;

    const { rows } = await db.query(query, [empresa_id]);
    return rows;
};