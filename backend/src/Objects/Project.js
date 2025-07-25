class Project {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    async crear(params, usuarioSesion) {
        const { nombre, descripcion, fecha_fin_estimada, miembros, prioridad_id } = params;
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

            const mensaje = `Has sido añadido al proyecto '${proyectoResult.rows[0].nombre_proyecto}'.`;
            await client.query(this.dataAccess.queries['notificaciones_crear'], 
                [usuario_a_agregar_id, 'NUEVA_ASIGNACION_PROYECTO', mensaje, proyecto_id, 'proyecto']
            );
            
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

    async crearObjetivoGeneral(params, usuarioSesion) {
        const { proyecto_id, descripcion } = params;
        if (!proyecto_id || !descripcion) throw new Error('Se requiere el ID del proyecto y la descripción.');

        const proyectoCheck = await this.dataAccess.exe('proyectos_buscarSimple', [proyecto_id, usuarioSesion.empresa_id]);
        if (proyectoCheck.rowCount === 0) throw new Error('Proyecto no encontrado o no tienes permiso.');

        const { rows } = await this.dataAccess.exe('objetivos_crearGeneral', [proyecto_id, descripcion]);
        return rows[0];
    }

    async crearObjetivoEspecifico(params, usuarioSesion) {
        const { objetivo_general_id, descripcion } = params;
        if (!objetivo_general_id || !descripcion) throw new Error('Se requiere el ID del objetivo general y la descripción.');

        const objGeneralCheck = await this.dataAccess.exe('objetivos_verificarPertenencia', [objetivo_general_id, usuarioSesion.empresa_id]);
        if (objGeneralCheck.rowCount === 0) throw new Error('Objetivo general no encontrado o no tienes permiso.');

        const { rows } = await this.dataAccess.exe('objetivos_crearEspecifico', [objetivo_general_id, descripcion]);
        return rows[0];
    }

    async crearActividad(params, usuarioSesion) {
        let { proyecto_id, objetivo_especifico_id, descripcion, fecha_inicio_estimada, fecha_fin_estimada, prioridad_id } = params;
    
        if (!proyecto_id || !descripcion || !fecha_fin_estimada || !prioridad_id) {
            throw new Error('Proyecto, descripción, fecha de fin y prioridad son requeridos.');
        }

        const fechaInicio = fecha_inicio_estimada ? fecha_inicio_estimada.split('T')[0] : new Date().toISOString().split('T')[0];
        const fechaFin = fecha_fin_estimada.split('T')[0];
    
        const proyectoCheck = await this.dataAccess.exe('proyectos_buscarSimple', [proyecto_id, usuarioSesion.empresa_id]);
        if (proyectoCheck.rowCount === 0) throw new Error('Proyecto no encontrado.');
        
        const estadoResult = await this.dataAccess.exe('estados_actividad_buscarPendiente');
        const estado_inicial_id = estadoResult.rows[0].id;
        
        const values = [proyecto_id, objetivo_especifico_id || null, descripcion, fechaInicio, fechaFin, prioridad_id, estado_inicial_id];
        const { rows } = await this.dataAccess.exe('actividades_crear', values);
        return rows[0];
    }

    /**
     * Obtiene la jerarquía completa de un proyecto, incluyendo sus objetivos y actividades.
     * @param {object} params - { proyecto_id }
     * @param {object} usuarioSesion - El usuario de la sesión.
     * @returns {object} Un objeto con toda la información anidada del proyecto.
     */
    async obtenerJerarquia(params, usuarioSesion) {
        const { proyecto_id } = params;
        const { empresa_id } = usuarioSesion;
    
        // 1. Validar y obtener el proyecto principal
        const proyectoResult = await this.dataAccess.exe('proyectos_obtenerPorId', [proyecto_id, empresa_id]);
        if (proyectoResult.rowCount === 0) {
            throw new Error('Proyecto no encontrado o no tienes permiso.');
        }
        const proyecto = proyectoResult.rows[0];
    
        // 2. Obtener todos los datos relacionados en paralelo
        const [objetivosGenerales, objetivosEspecificos, actividades, asignaciones] = await Promise.all([
            this.dataAccess.exe('objetivos_listarPorProyecto', [proyecto_id]).then(r => r.rows),
            this.dataAccess.exe('objetivosEspecificos_listarPorProyecto', [proyecto_id]).then(r => r.rows),
            this.dataAccess.exe('actividades_listarPorProyecto', [proyecto_id]).then(r => r.rows),
            this.dataAccess.exe('asignaciones_listarPorProyecto', [proyecto_id]).then(r => r.rows)
        ]);
    
        // 3. Crear un mapa de los usuarios asignados para búsqueda rápida
        const asignacionesMap = new Map();
        asignaciones.forEach(asig => {
            if (!asignacionesMap.has(asig.actividad_id)) asignacionesMap.set(asig.actividad_id, []);
            asignacionesMap.get(asig.actividad_id).push({
                usuario_id: asig.usuario_id,
                nombre_completo: `${asig.nombre} ${asig.apellido}`
            });
        });
    
        // 4. Ensamblar la jerarquía
        proyecto.objetivos_generales = objetivosGenerales.map(og => ({
            ...og,
            objetivos_especificos: objetivosEspecificos
                .filter(oe => oe.objetivo_general_id === og.id)
                .map(oe => ({
                    ...oe,
                    actividades: actividades
                        .filter(act => act.objetivo_especifico_id === oe.id)
                        .map(act => ({
                            ...act,
                            // Añadimos aquí el array de usuarios y el nombre del primer responsable
                            usuarios_asignados: asignacionesMap.get(act.id) || [],
                            nombre_responsable: (asignacionesMap.get(act.id) || [{ nombre_completo: 'No asignado' }])[0].nombre_completo
                        }))
                }))
        }));
    
        return proyecto;
    }

    /**
     * Lista todas las prioridades disponibles en el sistema.
     */
    async listarPrioridades(params, usuarioSesion) {
        const { rows } = await this.dataAccess.exe('prioridades_listar');
        return rows;
    }

    /**
     * Lista todos los roles de proyecto disponibles en el sistema.
     */
    async listarRolesProyecto(params, usuarioSesion) {
        const { rows } = await this.dataAccess.exe('rolesProyecto_listar');
        return rows;
    }

    /**
     * Lista todos los estados de actividad disponibles.
     */
    async listarEstadosActividad(params, usuarioSesion) {
        const { rows } = await this.dataAccess.exe('estados_actividad_listar');
        return rows;
    }

    async assignUser(params, usuarioSesion) {
        const { actividad_id, usuario_id } = params;
        if (!actividad_id || !usuario_id) throw new Error('Se requiere el ID de la actividad y del usuario.');

        // verifica que la actividad y el usuario a asignar pertenecen al mismo proyecto y a la misma empresa del usuario en sesión.
        const securityCheck = await this.dataAccess.exe('actividades_verificarAsignacionValida',
            [actividad_id, usuario_id, usuarioSesion.empresa_id]
        );

        if (securityCheck.rowCount === 0) {
            throw new Error('Asignación no válida: La actividad no existe, el usuario no pertenece al proyecto, o no tienes permiso.');
        }

        const { rows } = await this.dataAccess.exe('asignaciones_insertar', [actividad_id, usuario_id]);

        const actividadResult = await this.dataAccess.exe('actividades_obtenerPorId', [actividad_id]);
        const mensaje = `Se te ha asignado la actividad: '${actividadResult.rows[0].descripcion}'.`;
        await this.dataAccess.exe('notificaciones_crear',
            [usuario_id, 'NUEVA_ASIGNACION_ACTIVIDAD', mensaje, actividad_id, 'actividad']
        );

        return rows[0];
    }
    
    async actualizarActividad(params, usuarioSesion) {
        const { actividad_id, estado_id, progreso } = params;
        const { id: usuario_id } = usuarioSesion;

        if (!actividad_id || (!estado_id && progreso === undefined)) {
            throw new Error('Se requiere el ID de la actividad y al menos un campo para actualizar.');
        }

        const actividadActualResult = await this.dataAccess.exe('actividades_obtenerPorId', [actividad_id]);
        if (actividadActualResult.rowCount === 0) throw new Error('La actividad no existe.');
        const actividadActual = actividadActualResult.rows[0];

        const nuevoEstadoId = estado_id || actividadActual.estado_actividad_id;
        const nuevoProgreso = progreso !== undefined ? progreso : actividadActual.progreso;

        const { rows, rowCount } = await this.dataAccess.exe('actividades_actualizar', [nuevoEstadoId, nuevoProgreso, actividad_id, usuario_id]);
        if (rowCount === 0) {
            throw new Error('No se pudo actualizar la actividad. Asegúrate de ser miembro del proyecto.');
        }

        if (estado_id) {
            const { rows: asignados } = await this.dataAccess.exe('asignaciones_listarPorActividad', [actividad_id]);
            if (asignados.length > 0) {
                const { rows: estado } = await this.dataAccess.exe('estados_actividad_obtenerPorId', [estado_id]);
                const mensaje = `El estado de la actividad '${rows[0].descripcion}' ha cambiado a: ${estado[0].nombre_estado}.`;
                
                for (const asignado of asignados) {
                    await this.dataAccess.exe('notificaciones_crear',
                        [asignado.usuario_id, 'CAMBIO_ESTADO_ACTIVIDAD', mensaje, actividad_id, 'actividad']
                    );
                }
            }
        }
        
        return rows[0];
    }

    async eliminarMiembro(params, usuarioSesion) {
        const { proyecto_id, usuario_id } = params;
        if (!proyecto_id || !usuario_id) {
            throw new Error('Se requiere el ID del proyecto y el ID del usuario.');
        }
        
        // La consulta segura verifica que el proyecto pertenezca a la empresa del admin
        const { rowCount } = await this.dataAccess.exe('proyecto_usuarios_eliminarMiembro', 
            [proyecto_id, usuario_id, usuarioSesion.empresa_id]
        );
    
        if (rowCount === 0) {
            throw new Error('No se encontró la asignación del miembro o no tienes permiso para eliminarla.');
        }
    
        return { message: 'Miembro eliminado del proyecto exitosamente.' };
    }
}

export default Project;