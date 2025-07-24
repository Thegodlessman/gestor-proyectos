class Report {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    /**
     * Obtiene los datos de las actividades de un proyecto formateados para un diagrama de Gantt.
     * @param {object} params - { proyecto_id }
     * @param {object} usuarioSesion - El usuario de la sesión.
     * @returns {Array} Un array de actividades listas para ser visualizadas.
     */
    async getGanttData(params, usuarioSesion) {
        const { proyecto_id } = params;
        const { empresa_id } = usuarioSesion;

        if (!proyecto_id) {
            throw new Error('Se requiere el ID del proyecto.');
        }

        // Verificamos que el proyecto exista y pertenezca a la empresa del usuario
        const proyectoCheck = await this.dataAccess.exe('proyectos_buscarSimple', [proyecto_id, empresa_id]);
        if (proyectoCheck.rowCount === 0) {
            throw new Error('Proyecto no encontrado o no tienes permiso.');
        }

        const { rows } = await this.dataAccess.exe('reportes_getDatosGantt', [proyecto_id]);
        
        // Formateamos las fechas a YYYY-MM-DD para evitar problemas de zona horaria en el frontend
        return rows.map(row => ({
            ...row,
            fecha_inicio: new Date(row.fecha_inicio).toISOString().split('T')[0],
            fecha_fin: new Date(row.fecha_fin).toISOString().split('T')[0]
        }));
    }
}

export default Report;