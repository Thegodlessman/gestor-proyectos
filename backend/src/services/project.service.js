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
        WHERE empresa_id = $1 AND fecha_eliminacion IS NULL
        ORDER BY fecha_creacion DESC;
    `;
    
    const { rows } = await db.query(query, [empresa_id]);
    return rows;
};

/**
 * Obtiene un proyecto específico por su ID.
 * @param {object} params - Debe contener { id: "uuid-del-proyecto" }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {object} El objeto del proyecto encontrado.
 */
export const obtenerProyectoPorId = async (params, usuarioSesion) => {
    const { id } = params;
    const { empresa_id } = usuarioSesion;

    if (!id) {
        throw new Error('Se requiere el ID del proyecto.');
    }

    // El WHERE es crucial para la seguridad y multi-tenancy
    const query = 'SELECT * FROM proyectos WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL';
    const { rows } = await db.query(query, [id, empresa_id]);

    if (rows.length === 0) {
        throw new Error('Proyecto no encontrado o no tienes permiso para verlo.');
    }

    return rows[0];
};

/**
 * Actualiza un proyecto existente.
 * @param {object} params - Debe contener { id: "uuid", y opcionalmente nombre, descripcion, fecha_fin_estimada }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {object} El objeto del proyecto actualizado.
 */
export const actualizarProyecto = async (params, usuarioSesion) => {
    const { id, nombre, descripcion, fecha_fin_estimada } = params;
    const { empresa_id } = usuarioSesion;

    if (!id) {
        throw new Error('El ID del proyecto es requerido para actualizar.');
    }

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (nombre) {
        fields.push(`nombre_proyecto = $${queryIndex++}`);
        values.push(nombre);
    }
    if (descripcion) {
        fields.push(`descripcion = $${queryIndex++}`);
        values.push(descripcion);
    }
    if (fecha_fin_estimada) {
        fields.push(`fecha_fin_estimada = $${queryIndex++}`);
        values.push(fecha_fin_estimada);
    }

    if (fields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar.');
    }

    // Añadimos el id del proyecto y el id de la empresa al final para el WHERE
    values.push(id, empresa_id);

    const query = `
        UPDATE proyectos 
        SET ${fields.join(', ')}, fecha_actualizacion = NOW()
        WHERE id = $${queryIndex++} AND empresa_id = $${queryIndex++}
        RETURNING *;
    `;

    const { rows, rowCount } = await db.query(query, values);

    if (rowCount === 0) {
        throw new Error('Proyecto no encontrado o no tienes permiso para modificarlo.');
    }

    return rows[0];
};

/**
 * Realiza un borrado lógico (soft delete) de un proyecto, marcándolo con una fecha de eliminación.
 * @param {object} params - Debe contener { id: "uuid-del-proyecto" }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {object} El proyecto que fue archivado.
 */
export const archivarProyecto = async (params, usuarioSesion) => {
    const { id } = params;
    const { empresa_id } = usuarioSesion;

    if (!id) {
        throw new Error('El ID del proyecto es requerido para archivarlo.');
    }

    const query = `
        UPDATE proyectos 
        SET fecha_eliminacion = NOW() 
        WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL
        RETURNING *;
    `;
    
    const { rows, rowCount } = await db.query(query, [id, empresa_id]);

    if (rowCount === 0) {
        throw new Error('Proyecto no encontrado, ya fue eliminado, o no tienes permiso.');
    }

    return rows[0];
};