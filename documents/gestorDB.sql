-- Función de Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION fn_actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla: Roles (Roles generales del sistema)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_rol VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_roles
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id UUID NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_rol
        FOREIGN KEY(rol_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);
CREATE TRIGGER trg_actualizar_fecha_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Estados_Proyecto
CREATE TABLE estados_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_estado VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_estados_proyecto
BEFORE UPDATE ON estados_proyecto
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Prioridades
CREATE TABLE prioridades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_prioridad VARCHAR(50) UNIQUE NOT NULL,
    nivel INT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_prioridades
BEFORE UPDATE ON prioridades
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Proyectos
CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_proyecto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    fecha_fin_real DATE,
    estado_proyecto_id UUID NOT NULL,
    usuario_creador_id UUID NOT NULL,
    prioridad_id UUID,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_estado_proyecto
        FOREIGN KEY(estado_proyecto_id)
        REFERENCES estados_proyecto(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_creador
        FOREIGN KEY(usuario_creador_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_prioridad_proyecto
        FOREIGN KEY(prioridad_id)
        REFERENCES prioridades(id)
        ON DELETE SET NULL
);
CREATE TRIGGER trg_actualizar_fecha_proyectos
BEFORE UPDATE ON proyectos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Objetivos_Generales
CREATE TABLE objetivos_generales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion TEXT NOT NULL,
    proyecto_id UUID NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_proyecto_objetivo_general
        FOREIGN KEY(proyecto_id)
        REFERENCES proyectos(id)
        ON DELETE CASCADE
);
CREATE TRIGGER trg_actualizar_fecha_objetivos_generales
BEFORE UPDATE ON objetivos_generales
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Objetivos_Especificos
CREATE TABLE objetivos_especificos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion TEXT NOT NULL,
    objetivo_general_id UUID NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_objetivo_general_especifico
        FOREIGN KEY(objetivo_general_id)
        REFERENCES objetivos_generales(id)
        ON DELETE CASCADE
);
CREATE TRIGGER trg_actualizar_fecha_objetivos_especificos
BEFORE UPDATE ON objetivos_especificos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Estados_Actividad
CREATE TABLE estados_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_estado VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_estados_actividad
BEFORE UPDATE ON estados_actividad
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Actividades
CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion TEXT NOT NULL,
    objetivo_especifico_id UUID,
    proyecto_id UUID NOT NULL,
    estado_actividad_id UUID NOT NULL,
    prioridad_id UUID NOT NULL,
    fecha_inicio_estimada DATE,
    fecha_fin_estimada DATE NOT NULL,
    fecha_inicio_real DATE,
    fecha_fin_real DATE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_objetivo_especifico_actividad
        FOREIGN KEY(objetivo_especifico_id)
        REFERENCES objetivos_especificos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_proyecto_actividad
        FOREIGN KEY(proyecto_id)
        REFERENCES proyectos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_estado_actividad
        FOREIGN KEY(estado_actividad_id)
        REFERENCES estados_actividad(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_prioridad_actividad
        FOREIGN KEY(prioridad_id)
        REFERENCES prioridades(id)
        ON DELETE RESTRICT
);
CREATE TRIGGER trg_actualizar_fecha_actividades
BEFORE UPDATE ON actividades
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Asignaciones_Actividades
CREATE TABLE asignaciones_actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    fecha_asignacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_actividad_asignacion
        FOREIGN KEY(actividad_id)
        REFERENCES actividades(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_asignacion
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,
    UNIQUE (actividad_id, usuario_id)
);

-- TABLA: Roles_Proyecto
CREATE TABLE roles_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_rol_proyecto VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_roles_proyecto
BEFORE UPDATE ON roles_proyecto
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Proyecto_Usuarios 
CREATE TABLE proyecto_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    rol_proyecto_id UUID NOT NULL, 
    fecha_incorporacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_proyecto_miembro
        FOREIGN KEY(proyecto_id)
        REFERENCES proyectos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_miembro
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rol_proyecto_miembro 
        FOREIGN KEY(rol_proyecto_id)
        REFERENCES roles_proyecto(id)
        ON DELETE RESTRICT,
    UNIQUE (proyecto_id, usuario_id) -- Un rol por usuario en un proyecto
);


-- NUEVA TABLA: Tipos_Notificacion
CREATE TABLE tipos_notificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_tipo VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'NUEVA_TAREA', 'TAREA_VENCE_PRONTO'
    descripcion_plantilla TEXT NOT NULL, -- Plantilla del mensaje, ej: "La tarea '{nombre_tarea}' ha sido asignada."
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_tipos_notificacion
BEFORE UPDATE ON tipos_notificacion
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    tipo_notificacion_id UUID NOT NULL,
    mensaje TEXT NOT NULL, -- Este mensaje se generaría a partir de la plantilla y los datos específicos
    referencia_id UUID,
    entidad_referencia VARCHAR(100),
    leida BOOLEAN DEFAULT FALSE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- Para marcar como leída, etc.
    CONSTRAINT fk_usuario_notificacion
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tipo_notificacion 
        FOREIGN KEY(tipo_notificacion_id)
        REFERENCES tipos_notificacion(id)
        ON DELETE RESTRICT
);
CREATE TRIGGER trg_actualizar_fecha_notificaciones
BEFORE UPDATE ON notificaciones
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();


-- Tablas para el Sistema de Permisos

-- Tabla: Modulos
CREATE TABLE modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_modulo VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_modulos
BEFORE UPDATE ON modulos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Opciones
CREATE TABLE opciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_opcion VARCHAR(100) UNIQUE NOT NULL,
    modulo_id UUID NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_modulo_opcion
        FOREIGN KEY(modulo_id)
        REFERENCES modulos(id)
        ON DELETE CASCADE
);
CREATE TRIGGER trg_actualizar_fecha_opciones
BEFORE UPDATE ON opciones
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Permisos
CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_permiso VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER trg_actualizar_fecha_permisos
BEFORE UPDATE ON permisos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Tabla: Rol_Permisos
CREATE TABLE rol_permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    rol_id UUID NOT NULL,
    opcion_id UUID NOT NULL,
    permiso_id UUID NOT NULL,
    habilitado BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY(rol_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rol_permiso_opcion
        FOREIGN KEY(opcion_id)
        REFERENCES opciones(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY(permiso_id)
        REFERENCES permisos(id)
        ON DELETE CASCADE,
    UNIQUE (rol_id, opcion_id, permiso_id)
);
CREATE TRIGGER trg_actualizar_fecha_rol_permisos
BEFORE UPDATE ON rol_permisos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_modificacion();

-- Índices adicionales
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_proyectos_nombre ON proyectos(nombre_proyecto);
CREATE INDEX idx_actividades_proyecto_id ON actividades(proyecto_id);
CREATE INDEX idx_notificaciones_usuario_id_leida ON notificaciones(usuario_id, leida);