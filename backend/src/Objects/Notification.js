class Notification {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    async listarParaUsuario(params, usuarioSesion) {
        const { limit = 10 } = params;
        const { rows } = await this.dataAccess.exe('notificaciones_listarPorUsuario', [usuarioSesion.id, limit]);
        return rows;
    }

    async marcarComoLeidas(params, usuarioSesion) {
        const { ids } = params;
        if (!ids || ids.length === 0) throw new Error('Se requiere un array de IDs.');
        
        await this.dataAccess.exe('notificaciones_marcarComoLeidas', [ids, usuarioSesion.id]);
        return { message: 'Notificaciones marcadas como leídas.' };
    }
}

export default Notification;