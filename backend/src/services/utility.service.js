import db from '../config/db.js';

/**
 * Obtiene todas las prioridades disponibles en el sistema.
 * @returns {Array} Un array de objetos de prioridad.
 */
export const listarPrioridades = async () => {
    const query = 'SELECT id, nombre_prioridad FROM prioridades;'; 
    const { rows } = await db.query(query);
    return rows;
};