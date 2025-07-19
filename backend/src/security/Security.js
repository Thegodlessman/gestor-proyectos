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
        return this.permissionMap.has(key);
    }

    /**
     * Carga dinámicamente y ejecuta el método.
     */
    async executeMethod(req, res) {
        const { objectName, methodName, params, tx } = req.body;
        const usuario = req.session.usuario;

        if (!objectName || !methodName || !tx) {
            const error = new Error('Los campos objectName, methodName y tx son requeridos.');
            return res.status(400).json(formatError(tx || 'unknown', error, error.message));
        }

        const fullMethodName = `${objectName.toLowerCase()}.${methodName.toLowerCase()}`;
        
        const publicMethods = ['invitation.validartoken', 'user.registrarconinvitacion'];
        let tienePermiso = publicMethods.includes(fullMethodName);

        if (!tienePermiso && usuario) {
            tienePermiso = this.getPermission(usuario.rol_id, fullMethodName);
        }

        if (!tienePermiso) {
            const error = new Error('No tienes permiso para ejecutar este método.');
            return res.status(403).json(formatError(tx, error, 'Acceso denegado.'));
        }

        try {
            const boPath = `../Objects/${objectName}.js`;
            const { default: BOClass } = await import(boPath);

            const boInstance = new BOClass(dataAccess);

            if (typeof boInstance[methodName] !== 'function') {
                throw new Error(`El método '${methodName}' no existe en el objeto '${objectName}'.`);
            }

            const result = await boInstance[methodName](params, usuario);

            return res.status(200).json({ tx, status: 'OK', typeMsg: 'info', shortMsg: 'Operación exitosa', data: result });

        } catch (error) {
            let httpStatus = 500;
            let shortMsg = 'Error interno al procesar la solicitud.';
            if (error.code === 'ERR_MODULE_NOT_FOUND') {
                httpStatus = 404;
                shortMsg = `El objeto de negocio '${objectName}' no existe.`;
            } else if (error.message.includes('no existe en el objeto')) {
                httpStatus = 404;
                shortMsg = error.message;
            }

            console.error(`Error en el método ${fullMethodName} (tx: ${tx}):`, error);
            return res.status(httpStatus).json({ tx, status: 'ERROR', typeMsg: 'error', shortMsg, longMsg: error.message, data: {} });
        }
    }
}

export default Security;