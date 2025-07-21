import dataAccess from '../data/DataAccess.js';
import { formatError, formatResponse } from '../utils/response.util.js';

class Security {
    constructor() {
        this.permissionMap = new Map();
    }

    /**
     * Carga todos los permisos de la BD y los construye en un mapa en memoria.
     */
    async loadAllPermissions() {
        console.log('Cargando mapa de permisos en memoria...');
        try {
            const { rows } = await dataAccess.exe('seguridad_obtenerMatrizPermisos');

            this.permissionMap.clear();
            for (const rule of rows) {
                const key = `${rule.rol_id}-${rule.nombre_metodo}`;
                this.permissionMap.set(key, true);
            }

            console.log(`Mapa de permisos cargado exitosamente. ${this.permissionMap.size} reglas activas.`);
            console.log(this.permissionMap)
        } catch (error) {
            console.error('Error Crítico: No se pudo construir el caché de seguridad.', error);
            process.exit(1);
        }
    }

    /**
     * Verifica si un rol tiene permiso para ejecutar un método.
     */
    getPermission(rol_id, fullMethodName) {
        if (!rol_id || !fullMethodName) {
            return false;
        }
        const key = `${rol_id}-${fullMethodName}`;
        console.log(key)
        return this.permissionMap.has(key);
    }

    /**
     * Carga dinámicamente y ejecuta el método.
     */
    async executeMethod(req, res) {
        const { objectName, methodName, params, tx } = req.body;
        const usuario = req.session.usuario;
        const fullMethodName = `${objectName.toLowerCase()}.${methodName}`;
    
        try {
            const boPath = `../Objects/${objectName}.js`;
            const { default: BOClass } = await import(boPath);
    
            const boInstance = new BOClass(dataAccess);
            const methodToExecute = methodName;
    
            if (typeof boInstance[methodToExecute] !== 'function') {
                throw new Error(`El método '${methodName}' no existe en el objeto '${objectName}'.`);
            }
            
            const result = await boInstance[methodToExecute](params, usuario);
            return res.status(200).json(formatResponse(tx, result));
    
        } catch (error) {
            let httpStatus = 500;
            let shortMsg = 'Error interno al procesar la solicitud.';
    
            if (error.code === 'ERR_MODULE_NOT_FOUND') {
                httpStatus = 404;
                shortMsg = `El objeto de negocio '${objectName}' no existe.`;
            } 
            else if (error.message.includes('no existe en el objeto')) {
                httpStatus = 404;
                shortMsg = error.message;
            }
    
            console.error(`Error en método ${fullMethodName} (tx: ${tx}):`, error);
            return res.status(httpStatus).json(formatError(tx, error, shortMsg));
        }
    }
}

export default Security;