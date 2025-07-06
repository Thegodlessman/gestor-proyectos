import db from '../config/db.js';

/**
 * Crea un nuevo proyecto y asigna al creador como líder del proyecto.
 * @param {object} params - Parámetros de la función. Debe contener {nombre, descripcion}.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión actual.
 * @returns {object} El proyecto recién creado.
 */

export const crearProyecto = async (params, usuarioSesion) => {
    const { nombre, descripcion, fecha_fin_estimada, prioridad_id, miembros } = params;
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

        const rolColaboradorResult = await client.query("SELECT id FROM roles_proyecto WHERE nombre_rol_proyecto = 'Colaborador'");
        if (rolColaboradorResult.rows.length === 0) throw new Error("Rol 'Líder de Proyecto' no encontrado.");
        const rol_colaborador_id = rolLiderResult.rows[0].id;
        

        const proyectoQuery = `
            INSERT INTO proyectos (nombre_proyecto, descripcion, prioridad_id, fecha_inicio, fecha_fin_estimada, estado_proyecto_id, usuario_creador_id, empresa_id)
            VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7) RETURNING *;
        `;
        const nuevoProyectoResult = await client.query(proyectoQuery, [nombre, descripcion || null, prioridad_id, fecha_fin_estimada, estado_inicial_id, usuario_id, empresa_id]);
        const nuevoProyecto = nuevoProyectoResult.rows[0];

        // 2. Asignar al creador como "Líder de Proyecto"
        const asignacionLiderQuery = 'INSERT INTO proyecto_usuarios (proyecto_id, usuario_id, rol_proyecto_id) VALUES ($1, $2, $3);';
        await client.query(asignacionLiderQuery, [nuevoProyecto.id, usuario_id, rol_lider_id]);

        // 3. Asignar a los otros miembros seleccionados
        if (miembros && miembros.length > 0) {
            
            for (const miembro of miembros) {
                if (miembro.id !== usuario_id) { 
                    const asignacionMiembroQuery = 'INSERT INTO proyecto_usuarios (proyecto_id, usuario_id, rol_proyecto_id) VALUES ($1, $2, $3);';
                    await client.query(asignacionMiembroQuery, [nuevoProyecto.id, miembro.id, rol_colaborador_id]);
                }
            }
        }
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
    const { id: usuario_id, empresa_id } = usuarioSesion;

    const query = `
        SELECT 
            p.id,
            p.nombre_proyecto,
            p.descripcion,
            p.fecha_creacion,
            p.fecha_fin_estimada,
            p.progreso,
            creator_profile.nombre || ' ' || creator_profile.apellido AS nombre_responsable,
            ep.nombre_estado AS estado,
            pr.nombre_prioridad AS prioridad
        FROM 
            proyectos p
        JOIN 
            proyecto_usuarios pu ON p.id = pu.proyecto_id
        JOIN 
            estados_proyecto ep ON p.estado_proyecto_id = ep.id
        JOIN 
            perfiles creator_profile ON p.usuario_creador_id = creator_profile.usuario_id
        LEFT JOIN 
            prioridades pr ON p.prioridad_id = pr.id
        WHERE 
            pu.usuario_id = $1 
            AND p.empresa_id = $2 
            AND p.fecha_eliminacion IS NULL
        ORDER BY 
            p.fecha_creacion DESC;
    `;

    const { rows } = await db.query(query, [usuario_id, empresa_id]);
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

/**
 * Agrega un usuario existente de la misma empresa a un proyecto.
 * @param {object} params - Debe contener { proyecto_id, email_miembro, rol_proyecto_id }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {object} El registro de la nueva asignación.
 */
export const agregarMiembro = async (params, usuarioSesion) => {
    const { proyecto_id, email_miembro, rol_proyecto_id } = params;
    const { empresa_id } = usuarioSesion;

    if (!proyecto_id || !email_miembro || !rol_proyecto_id) {
        throw new Error('Se requiere el ID del proyecto, el email del miembro y el ID del rol.');
    }

    const client = await db.getPool().connect();
    try {
        await client.query('BEGIN');

        // 1. Verificar que el proyecto existe y pertenece a la empresa del admin/pm.
        const proyectoResult = await client.query('SELECT id FROM proyectos WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL', [proyecto_id, empresa_id]);
        if (proyectoResult.rowCount === 0) throw new Error('Proyecto no encontrado o no tienes permiso.');

        // 2. Encontrar al usuario a agregar por su email y verificar que pertenece a la misma empresa.
        const usuarioResult = await client.query('SELECT id FROM usuarios WHERE email = $1 AND empresa_id = $2', [email_miembro, empresa_id]);
        if (usuarioResult.rowCount === 0) throw new Error(`No se encontró un usuario con el email '${email_miembro}' en tu empresa.`);
        const usuario_a_agregar_id = usuarioResult.rows[0].id;

        // 3. Verificar que el usuario no esté ya en el proyecto.
        const yaEsMiembro = await client.query('SELECT id FROM proyecto_usuarios WHERE proyecto_id = $1 AND usuario_id = $2', [proyecto_id, usuario_a_agregar_id]);
        if (yaEsMiembro.rowCount > 0) throw new Error('Este usuario ya es miembro del proyecto.');

        // 4. Insertar la nueva asignación.
        const asignacionQuery = 'INSERT INTO proyecto_usuarios (proyecto_id, usuario_id, rol_proyecto_id) VALUES ($1, $2, $3) RETURNING *';
        const nuevaAsignacion = await client.query(asignacionQuery, [proyecto_id, usuario_a_agregar_id, rol_proyecto_id]);

        await client.query('COMMIT');
        return nuevaAsignacion.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Lista todos los miembros de un proyecto específico.
 * @param {object} params - Debe contener { proyecto_id }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {Array} Un array de objetos con los detalles de los miembros.
 */
export const listarMiembros = async (params, usuarioSesion) => {
    const { proyecto_id } = params;
    const { empresa_id } = usuarioSesion;

    if (!proyecto_id) throw new Error('Se requiere el ID del proyecto.');

    const query = `
        SELECT p.nombre, p.apellido, u.email, rp.nombre_rol_proyecto, pu.fecha_incorporacion
        FROM proyecto_usuarios pu
        JOIN usuarios u ON pu.usuario_id = u.id
        JOIN perfiles p ON u.id = p.usuario_id
        JOIN roles_proyecto rp ON pu.rol_proyecto_id = rp.id
        WHERE pu.proyecto_id = $1 AND u.empresa_id = $2
        ORDER BY p.nombre;
    `;
    const { rows } = await db.query(query, [proyecto_id, empresa_id]);
    return rows;
};

/**
 * Elimina a un miembro de un proyecto.
 * @param {object} params - Debe contener { proyecto_id, usuario_id }.
 * @param {object} usuarioSesion - El objeto de usuario de la sesión.
 * @returns {object} Un mensaje de éxito.
 */
export const eliminarMiembro = async (params, usuarioSesion) => {
    const { proyecto_id, usuario_id } = params;
    const { empresa_id } = usuarioSesion;

    if (!proyecto_id || !usuario_id) {
        throw new Error('Se requiere el ID del proyecto y el ID del usuario.');
    }

    const query = `
        DELETE FROM proyecto_usuarios pu
        USING proyectos p
        WHERE pu.proyecto_id = p.id
        AND pu.proyecto_id = $1
        AND pu.usuario_id = $2
        AND p.empresa_id = $3;
    `;

    const { rowCount } = await db.query(query, [proyecto_id, usuario_id, empresa_id]);

    if (rowCount === 0) {
        throw new Error('No se encontró la asignación del miembro o no tienes permiso para eliminarla.');
    }

    return { message: 'Miembro eliminado del proyecto exitosamente.' };
};

/**
 * Obtiene todos los detalles de un proyecto, incluyendo sus objetivos y actividades,
 * en una estructura anidada.
 * @param {object} params - { proyecto_id }
 * @param {object} usuarioSesion - El usuario de la sesión.
 * @returns {object} Un objeto con toda la información del proyecto.
 */
export const obtenerDetallesCompletos = async (params, usuarioSesion) => {
    const { proyecto_id } = params;
    const { empresa_id } = usuarioSesion;

    // 1. Obtener los detalles básicos del proyecto (y verificar permisos)
    const proyectoPromise = db.query(
        'SELECT * FROM proyectos WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL',
        [proyecto_id, empresa_id]
    );

    // 2. Obtener todos los objetivos generales de ese proyecto
    const objetivosGeneralesPromise = db.query(
        'SELECT * FROM objetivos_generales WHERE proyecto_id = $1 ORDER BY fecha_creacion',
        [proyecto_id]
    );
    
    // 3. Obtener todos los objetivos específicos de ese proyecto
    const objetivosEspecificosPromise = db.query(
        `SELECT oe.* FROM objetivos_especificos oe
         JOIN objetivos_generales og ON oe.objetivo_general_id = og.id
         WHERE og.proyecto_id = $1 ORDER BY oe.fecha_creacion`,
        [proyecto_id]
    );

    // 4. Obtener todas las actividades de ese proyecto
    const actividadesPromise = db.query(
        'SELECT * FROM actividades WHERE proyecto_id = $1 ORDER BY fecha_creacion',
        [proyecto_id]
    );

    // Ejecutamos todas las consultas en paralelo para mayor eficiencia
    const [
        proyectoResult,
        objetivosGeneralesResult,
        objetivosEspecificosResult,
        actividadesResult
    ] = await Promise.all([
        proyectoPromise,
        objetivosGeneralesPromise,
        objetivosEspecificosPromise,
        actividadesPromise
    ]);

    if (proyectoResult.rowCount === 0) {
        throw new Error('Proyecto no encontrado o no tienes permiso para verlo.');
    }

    // --- Ensamblaje de la Respuesta ---
    const proyecto = proyectoResult.rows[0];
    const actividades = actividadesResult.rows;
    const objetivosEspecificos = objetivosEspecificosResult.rows;
    const objetivosGenerales = objetivosGeneralesResult.rows;

    // Agrupamos los objetivos específicos por su padre (objetivo general)
    const especificosPorGeneral = new Map();
    objetivosEspecificos.forEach(oe => {
        if (!especificosPorGeneral.has(oe.objetivo_general_id)) {
            especificosPorGeneral.set(oe.objetivo_general_id, []);
        }
        especificosPorGeneral.get(oe.objetivo_general_id).push(oe);
    });

    // Agrupamos las actividades por su objetivo específico (si lo tienen)
    const actividadesPorEspecifico = new Map();
    actividades.forEach(act => {
        const key = act.objetivo_especifico_id || 'sin_objetivo';
        if (!actividadesPorEspecifico.has(key)) {
            actividadesPorEspecifico.set(key, []);
        }
        actividadesPorEspecifico.get(key).push(act);
    });

    // Construimos la estructura final anidada
    proyecto.objetivos_generales = objetivosGenerales.map(og => {
        const especificos = especificosPorGeneral.get(og.id) || [];
        og.objetivos_especificos = especificos.map(oe => {
            oe.actividades = actividadesPorEspecifico.get(oe.id) || [];
            return oe;
        });
        return og;
    });

    // Añadimos las actividades que no están asociadas a ningún objetivo específico
    proyecto.actividades_sin_objetivo = actividadesPorEspecifico.get('sin_objetivo') || [];

    return proyecto;
};