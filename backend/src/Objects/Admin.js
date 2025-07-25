import { updateSecurityCache } from '../security/Security.js';

class Admin {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    async getPermissionMatrixData(params, usuarioSesion) {
        const [roles, modulos, opciones, permisos, reglas] = await Promise.all([
            this.dataAccess.exe('roles_listar').then(r => r.rows),
            this.dataAccess.exe('modulos_listar').then(r => r.rows),
            this.dataAccess.exe('opciones_listar').then(r => r.rows),
            this.dataAccess.exe('permisos_listar').then(r => r.rows),
            this.dataAccess.exe('rolPermisos_listar').then(r => r.rows)
        ]);
        
        return { roles, modulos, opciones, permisos, reglas };
    }

    async updatePermission(params, usuarioSesion) {
        const { rol_id, opcion_id, permiso_id, habilitado } = params;
        if (!rol_id || !opcion_id || !permiso_id || typeof habilitado !== 'boolean') {
            throw new Error('Parámetros inválidos.');
        }

        await this.dataAccess.exe('rolPermisos_upsert', [rol_id, opcion_id, permiso_id, habilitado]);
        
        await updateSecurityCache();

        return { message: 'Permiso actualizado correctamente. El cambio se aplicó en tiempo real.' };
    }
}

export default Admin;