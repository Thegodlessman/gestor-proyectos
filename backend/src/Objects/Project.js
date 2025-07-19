class Project {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    async crear(params, usuarioSesion) {
        const { nombre, descripcion, fecha_fin_estimada, miembros, prioridad_id} = params;
        const { id: usuario_id, empresa_id } = usuarioSesion;

        if (!nombre || !fecha_fin_estimada) {
            throw new Error('El nombre y la fecha de fin estimada son requeridos.');
        }

        const client = await this.dataAccess.getClient();
        try {
            await client.query('BEGIN');

            const estadoResult = await client.query("SELECT id FROM estados_proyecto WHERE nombre_estado = 'Planificado'");
            const rolLiderResult = await client.query("SELECT id FROM roles_proyecto WHERE nombre_rol_proyecto = 'Líder de Proyecto'");

            const nuevoProyectoResult = await client.query(
                this.dataAccess.queries['proyectos_crear'],
                [nombre, descripcion || null, fecha_fin_estimada, estadoResult.rows[0].id, usuario_id, empresa_id, prioridad_id]
            );
            const nuevoProyecto = nuevoProyectoResult.rows[0];

            await client.query(this.dataAccess.queries['proyecto_usuarios_insertar'], [nuevoProyecto.id, usuario_id, rolLiderResult.rows[0].id]);

            if (miembros && miembros.length > 0) {
                const rolColaboradorResult = await client.query("SELECT id FROM roles_proyecto WHERE nombre_rol_proyecto = 'Colaborador'");
                const rol_colaborador_id = rolColaboradorResult.rows[0].id;
                for (const miembro of miembros) {
                    if (miembro.id !== usuario_id) {
                        await client.query(this.dataAccess.queries['proyecto_usuarios_insertar'], [nuevoProyecto.id, miembro.id, rol_colaborador_id]);
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
    }

    async listar(params, usuarioSesion) {
        const { id: usuario_id, empresa_id } = usuarioSesion;
        const { rows } = await this.dataAccess.exe('proyectos_listarPorUsuario', [usuario_id, empresa_id]);
        return rows;
    }

    async obtenerPorId(params, usuarioSesion) {
        const { id } = params;
        if (!id) throw new Error('Se requiere el ID del proyecto.');
        
        const { rows, rowCount } = await this.dataAccess.exe('proyectos_obtenerPorId', [id, usuarioSesion.empresa_id]);
        if (rowCount === 0) throw new Error('Proyecto no encontrado o no tienes permiso.');
        
        return rows[0];
    }

    async actualizar(params, usuarioSesion) {
        const { id, nombre, descripcion, fecha_fin_estimada, prioridad_id } = params;
        if (!id) throw new Error('El ID del proyecto es requerido para actualizar.');

        const { rows, rowCount } = await this.dataAccess.exe('proyectos_actualizar', [nombre, descripcion, fecha_fin_estimada, prioridad_id, id, usuarioSesion.empresa_id]);
        if (rowCount === 0) throw new Error('Proyecto no encontrado o no tienes permiso para modificarlo.');

        return rows[0];
    }
    
    async archivar(params, usuarioSesion) {
        const { id } = params;
        if (!id) throw new Error('El ID del proyecto es requerido para archivarlo.');

        const { rows, rowCount } = await this.dataAccess.exe('proyectos_archivar', [id, usuarioSesion.empresa_id]);
        if (rowCount === 0) throw new Error('Proyecto no encontrado, ya fue archivado, o no tienes permiso.');

        return rows[0];
    }

    async agregarMiembro(params, usuarioSesion) {
        const { proyecto_id, email_miembro, rol_proyecto_id } = params;
        if (!proyecto_id || !email_miembro || !rol_proyecto_id) throw new Error('Se requiere el ID del proyecto, el email del miembro y el ID del rol.');

        const client = await this.dataAccess.getClient();
        try {
            await client.query('BEGIN');

            const proyectoResult = await client.query(this.dataAccess.queries['proyectos_buscarSimple'], [proyecto_id, usuarioSesion.empresa_id]);
            if (proyectoResult.rowCount === 0) throw new Error('Proyecto no encontrado o no tienes permiso.');

            const usuarioResult = await client.query(this.dataAccess.queries['usuarios_buscarPorEmailEnEmpresa'], [email_miembro, usuarioSesion.empresa_id]);
            if (usuarioResult.rowCount === 0) throw new Error(`No se encontró un usuario con el email '${email_miembro}' en tu empresa.`);
            const usuario_a_agregar_id = usuarioResult.rows[0].id;
            
            const yaEsMiembro = await client.query(this.dataAccess.queries['proyecto_usuarios_buscarMiembro'], [proyecto_id, usuario_a_agregar_id]);
            if (yaEsMiembro.rowCount > 0) throw new Error('Este usuario ya es miembro del proyecto.');

            const { rows } = await client.query(this.dataAccess.queries['proyecto_usuarios_insertar'], [proyecto_id, usuario_a_agregar_id, rol_proyecto_id]);

            await client.query('COMMIT');
            return rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async listarMiembros(params, usuarioSesion) {
        const { proyecto_id } = params;
        if (!proyecto_id) throw new Error('Se requiere el ID del proyecto.');

        const { rows } = await this.dataAccess.exe('proyecto_usuarios_listarMiembros', [proyecto_id, usuarioSesion.empresa_id]);
        return rows;
    }

    async eliminarMiembro(params, usuarioSesion) {
        const { proyecto_id, usuario_id } = params;
        if (!proyecto_id || !usuario_id) throw new Error('Se requiere el ID del proyecto y el ID del usuario.');
        
        const { rowCount } = await this.dataAccess.exe('proyecto_usuarios_eliminarMiembro', [proyecto_id, usuario_id, usuarioSesion.empresa_id]);
        if (rowCount === 0) throw new Error('No se encontró la asignación del miembro o no tienes permiso para eliminarla.');

        return { message: 'Miembro eliminado del proyecto exitosamente.' };
    }
}

export default Project;