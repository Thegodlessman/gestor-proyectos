import db from '../config/db.js';
import { updateSecurityCache } from './security.service.js';

/**
 * Obtiene una matriz completa de todos los roles, opciones y sus permisos asociados.
 * @returns {object} Un objeto estructurado con toda la matriz de permisos.
 */
export const obtenerMatrizDePermisos = async () => {
    const rolesPromise = db.query('SELECT id, nombre_rol FROM roles');
    const opcionesPromise = db.query('SELECT o.id, o.nombre_opcion, m.nombre_modulo FROM opciones o JOIN modulos m ON o.modulo_id = m.id');
    const permisosPromise = db.query('SELECT id, nombre_permiso FROM permisos');
    const reglasExistentesPromise = db.query('SELECT rol_id, opcion_id, permiso_id FROM rol_permisos WHERE habilitado = true');

    // Esperamos a que todas las consultas terminen en paralelo
    const [rolesResult, opcionesResult, permisosResult, reglasResult] = await Promise.all([
        rolesPromise, opcionesPromise, permisosPromise, reglasExistentesPromise
    ]);

    // Procesamos las reglas existentes en un formato fácil de buscar (un Set)
    const reglasSet = new Set(
        reglasResult.rows.map(r => `${r.rol_id}-${r.opcion_id}-${r.permiso_id}`)
    );

    // Construimos la estructura de datos que necesita el frontend
    const modulos = {};
    for (const opcion of opcionesResult.rows) {
        if (!modulos[opcion.nombre_modulo]) {
            modulos[opcion.nombre_modulo] = [];
        }
        const permisosParaOpcion = [];
        for (const permiso of permisosResult.rows) {
            const rolesParaPermiso = {};
            for (const rol of rolesResult.rows) {
                const reglaKey = `${rol.id}-${opcion.id}-${permiso.id}`;
                rolesParaPermiso[rol.nombre_rol] = reglasSet.has(reglaKey);
            }
            permisosParaOpcion.push({
                permiso_id: permiso.id,
                nombre_permiso: permiso.nombre_permiso,
                roles: rolesParaPermiso
            });
        }
        modulos[opcion.nombre_modulo].push({
            opcion_id: opcion.id,
            nombre_opcion: opcion.nombre_opcion,
            permisos: permisosParaOpcion
        });
    }

    // Devolvemos el objeto final
    return modulos;
};

/**
 * Habilita o deshabilita un permiso específico para un rol.
 * @param {object} params - { rol_id, opcion_id, permiso_id, habilitado: boolean }
 * @returns {object} Un mensaje de éxito.
 */
export const actualizarPermiso = async (params) => {
    const { rol_id, opcion_id, permiso_id, habilitado } = params;

    if (!rol_id || !opcion_id || !permiso_id || typeof habilitado !== 'boolean') {
        throw new Error('Todos los parámetros son requeridos.');
    }

    const query = `
        INSERT INTO rol_permisos (rol_id, opcion_id, permiso_id, habilitado)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (rol_id, opcion_id, permiso_id)
        DO UPDATE SET habilitado = $4;
    `;
    await db.query(query, [rol_id, opcion_id, permiso_id, habilitado]);
    
    await updateSecurityCache();

    return { message: 'Permiso actualizado correctamente.' };
};