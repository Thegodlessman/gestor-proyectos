import db from '../config/db.js';

let permissionMap = new Map();

export async function initSecurityCache() {
    console.log('Cargando mapa de permisos en memoria...');
    try {
        const query = `
            SELECT 
                rp.rol_id,
                mr.nombre_metodo
            FROM rol_permisos rp
            JOIN metodos_rpc mr ON rp.opcion_id = mr.opcion_id AND rp.permiso_id = mr.permiso_id
            WHERE rp.habilitado = true;
        `;
        const { rows } = await db.query(query);

        //console.log(rows)

        // Limpiamos el mapa anterior y lo reconstruimos
        permissionMap.clear();
        for (const rule of rows) {
            const key = `${rule.rol_id}-${rule.nombre_metodo}`;
            permissionMap.set(key, true);
        }

        console.log(`Mapa de permisos cargado exitosamente. ${permissionMap.size} reglas activas.`);
    } catch (error) {
        console.error('Error Crítico: No se pudo construir el caché de seguridad.', error);
        process.exit(1);
    }
}

/**
 * Verifica si un rol tiene permiso para ejecutar un método.
 * @param {string} rol_id - El UUID del rol del usuario.
 * @param {string} methodName - El nombre del método RPC (ej. 'proyectos.crear').
 * @returns {boolean} - True si tiene permiso, false si no.
 */
export function canExecute(rol_id, methodName) {
    //console.log(permissionMap)
    if (!rol_id || !methodName) {
        return false;
    }
    const key = `${rol_id}-${methodName}`;
    //console.log("esta es la llave: ----> "+key)
    return permissionMap.has(key);
}