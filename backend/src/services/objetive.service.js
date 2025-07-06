import db from '../config/db.js';

/**
 * Crea un nuevo objetivo general dentro de un proyecto.
 * @param {object} params - { proyecto_id, descripcion }
 * @param {object} usuarioSesion - El usuario de la sesión.
 * @returns {object} El objetivo general recién creado.
 */
export const crearObjetivoGeneral = async (params, usuarioSesion) => {
    const { proyecto_id, descripcion } = params;
    const { empresa_id } = usuarioSesion;

    if (!proyecto_id || !descripcion) {
        throw new Error('Se requiere el ID del proyecto y la descripción del objetivo.');
    }

    // Verificamos que el proyecto exista y pertenezca a la empresa del usuario
    const proyectoQuery = 'SELECT id FROM proyectos WHERE id = $1 AND empresa_id = $2 AND fecha_eliminacion IS NULL';
    const proyectoResult = await db.query(proyectoQuery, [proyecto_id, empresa_id]);
    if (proyectoResult.rowCount === 0) {
        throw new Error('Proyecto no encontrado o no tienes permiso.');
    }

    const query = 'INSERT INTO objetivos_generales (proyecto_id, descripcion) VALUES ($1, $2) RETURNING *';
    const { rows } = await db.query(query, [proyecto_id, descripcion]);
    return rows[0];
};

/**
 * Crea un nuevo objetivo específico anidado en un objetivo general.
 * @param {object} params - { objetivo_general_id, descripcion }
 * @param {object} usuarioSesion - El usuario de la sesión.
 * @returns {object} El objetivo específico recién creado.
 */
export const crearObjetivoEspecifico = async (params, usuarioSesion) => {
    const { objetivo_general_id, descripcion } = params;
    const { empresa_id } = usuarioSesion;

    if (!objetivo_general_id || !descripcion) {
        throw new Error('Se requiere el ID del objetivo general y la descripción.');
    }

    // Verificamos que el objetivo general padre pertenezca a un proyecto de la empresa del usuario
    const objetivoGeneralQuery = `
        SELECT og.id FROM objetivos_generales og
        JOIN proyectos p ON og.proyecto_id = p.id
        WHERE og.id = $1 AND p.empresa_id = $2;
    `;
    const objetivoGeneralResult = await db.query(objetivoGeneralQuery, [objetivo_general_id, empresa_id]);
    if (objetivoGeneralResult.rowCount === 0) {
        throw new Error('Objetivo general no encontrado o no tienes permiso.');
    }

    const query = 'INSERT INTO objetivos_especificos (objetivo_general_id, descripcion) VALUES ($1, $2) RETURNING *';
    const { rows } = await db.query(query, [objetivo_general_id, descripcion]);
    return rows[0];
};