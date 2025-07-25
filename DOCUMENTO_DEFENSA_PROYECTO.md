# GESTOR DE PROYECTOS - DOCUMENTO DE DEFENSA TÉCNICA

## ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Backend](#estructura-del-backend)
5. [Estructura del Frontend](#estructura-del-frontend)
6. [Base de Datos](#base-de-datos)
7. [API y Comunicación](#api-y-comunicación)
8. [Sistema de Seguridad](#sistema-de-seguridad)
9. [Funcionalidades Principales](#funcionalidades-principales)
10. [Flujo de Datos](#flujo-de-datos)
11. [Patrones de Diseño](#patrones-de-diseño)
12. [Escalabilidad y Rendimiento](#escalabilidad-y-rendimiento)
13. [Conclusiones](#conclusiones)

---

## RESUMEN EJECUTIVO

**Proyectify** es una aplicación web completa de gestión de proyectos desarrollada con arquitectura cliente-servidor moderna. El sistema permite a las empresas gestionar proyectos, equipos, actividades y seguimiento de progreso de manera eficiente y colaborativa.

### Características Principales:
- **Gestión Multi-empresa**: Cada empresa tiene su propio espacio aislado
- **Sistema de Roles**: Administradores, Líderes de Proyecto y Colaboradores
- **Gestión Completa de Proyectos**: Desde creación hasta seguimiento detallado
- **Notificaciones en Tiempo Real**: Sistema de alertas y actualizaciones
- **Interfaz Moderna**: UI/UX intuitiva con componentes responsivos
- **Seguridad Robusta**: Autenticación, autorización y validación de permisos

---

## ARQUITECTURA DEL SISTEMA

### Arquitectura General
```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    TCP/IP    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄──────────► │                 │
│    FRONTEND     │                  │     BACKEND     │              │   POSTGRESQL    │
│   (React SPA)   │                  │  (Node.js API)  │              │    DATABASE     │
│                 │                  │                 │              │                 │
└─────────────────┘                  └─────────────────┘              └─────────────────┘
```

### Patrón Arquitectónico
- **Frontend**: Single Page Application (SPA) con React
- **Backend**: API RESTful con patrón RPC personalizado
- **Base de Datos**: PostgreSQL con diseño relacional normalizado
- **Comunicación**: HTTP/HTTPS con JSON como formato de intercambio

---

## TECNOLOGÍAS UTILIZADAS

### Backend (Node.js)
```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js v5.1.0",
  "database": "PostgreSQL con driver pg v8.16.0",
  "authentication": "express-session + bcryptjs",
  "security": "jsonwebtoken, cors",
  "email": "nodemailer v7.0.3",
  "file_upload": "multer v2.0.2",
  "scheduling": "node-cron v4.2.1"
}
```

### Frontend (React)
```json
{
  "framework": "React v19.1.0",
  "build_tool": "Vite v6.3.5",
  "routing": "React Router DOM v7.6.2",
  "ui_library": "PrimeReact v10.9.6",
  "styling": "PrimeFlex + PrimeIcons + Bootstrap",
  "charts": "Chart.js v4.5.0 + ApexCharts",
  "state_management": "React Context API"
}
```

### Base de Datos
```sql
-- PostgreSQL 14+
-- Características utilizadas:
-- - Transacciones ACID
-- - Constraints y Foreign Keys
-- - Índices optimizados
-- - Stored procedures (funciones)
-- - Triggers para auditoría
```

---

## ESTRUCTURA DEL BACKEND

### Organización de Directorios
```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Email)
│   ├── controllers/     # Controladores de rutas
│   ├── data/           # Acceso a datos y queries
│   ├── jobs/           # Tareas programadas (cron jobs)
│   ├── middleware/     # Middlewares de autenticación
│   ├── Objects/        # Business Objects (Lógica de negocio)
│   ├── routes/         # Definición de rutas
│   ├── security/       # Sistema de permisos
│   ├── services/       # Servicios auxiliares
│   └── utils/          # Utilidades y helpers
├── index.js            # Punto de entrada
├── package.json        # Dependencias
└── .env               # Variables de entorno
```

### Patrón de Capas
1. **Capa de Presentación**: Routes + Controllers
2. **Capa de Lógica de Negocio**: Business Objects
3. **Capa de Acceso a Datos**: DataAccess + PostgreSQL
4. **Capa de Seguridad**: Security + Middleware

### Business Objects (Objetos de Negocio)
```javascript
// Ejemplo: Project.js
class Project {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }
    
    async crear(params, usuarioSesion) { /* Lógica de creación */ }
    async listar(params, usuarioSesion) { /* Lógica de listado */ }
    async actualizar(params, usuarioSesion) { /* Lógica de actualización */ }
    // ... más métodos
}
```

### Sistema de Acceso a Datos
```javascript
// DataAccess.js - Patrón Singleton
class DataAccess {
    constructor() {
        this.pool = new Pool({ /* config PostgreSQL */ });
        this.queries = JSON.parse(fs.readFileSync('querys.json'));
    }
    
    async exe(queryName, params) {
        const queryString = this.queries[queryName];
        return await this.pool.query(queryString, params);
    }
}
```

---

## ESTRUCTURA DEL FRONTEND

### Organización de Directorios
```
frontend/src/
├── components/         # Componentes reutilizables
│   ├── GanttChart.jsx     # Gráfico de Gantt
│   ├── NotificationBell.jsx # Campana de notificaciones
│   ├── ProfileImage.jsx    # Imagen de perfil
│   └── ProtectedRoute.jsx  # Rutas protegidas
├── context/           # Context API para estado global
│   └── AuthContext.jsx    # Contexto de autenticación
├── layouts/           # Layouts de la aplicación
│   └── AppLayout.jsx      # Layout principal
├── pages/             # Páginas/Vistas principales
│   ├── Dashboard.jsx      # Panel principal
│   ├── ProjectsPage.jsx   # Lista de proyectos
│   ├── ProjectDetailPage.jsx # Detalle de proyecto
│   ├── Login.jsx          # Página de login
│   └── Register.jsx       # Página de registro
├── services/          # Servicios de API
│   └── api.js            # Cliente HTTP
├── App.jsx            # Componente raíz
└── main.jsx           # Punto de entrada
```

### Patrón de Componentes
```jsx
// Ejemplo de estructura de componente
const ProjectsPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    
    useEffect(() => {
        loadProjects();
    }, []);
    
    const loadProjects = async () => {
        const data = await rpcCall('Project', 'listar');
        setProjects(data);
    };
    
    return (
        <div className="projects-container">
            {/* JSX del componente */}
        </div>
    );
};
```

### Gestión de Estado
- **Estado Local**: useState, useEffect para componentes
- **Estado Global**: Context API para autenticación
- **Estado del Servidor**: Llamadas directas a API con re-fetch

---

## BASE DE DATOS

### Modelo de Datos Principal
```sql
-- Entidades Principales
usuarios (id, email, password_hash, rol_id, empresa_id, ...)
perfiles (usuario_id, nombre, apellido, imagen_perfil, ...)
empresas (id, nombre_empresa, ...)
proyectos (id, nombre_proyecto, descripcion, fecha_inicio, ...)
actividades (id, proyecto_id, descripcion, fecha_inicio_estimada, ...)

-- Relaciones Many-to-Many
proyecto_usuarios (proyecto_id, usuario_id, rol_proyecto_id)
asignaciones_actividades (actividad_id, usuario_id)

-- Catálogos
roles (id, nombre_rol)
estados_proyecto (id, nombre_estado)
estados_actividad (id, nombre_estado)
prioridades (id, nombre_prioridad)
```

### Diseño Relacional
```
EMPRESAS (1) ──── (N) USUARIOS (1) ──── (1) PERFILES
    │                   │
    │                   │ (N)
    │                   │
    └── (N) PROYECTOS ──┴── (M:N) PROYECTO_USUARIOS
            │
            │ (1:N)
            │
        ACTIVIDADES (M:N) ──── ASIGNACIONES_ACTIVIDADES
```

### Características de la BD
- **Integridad Referencial**: Foreign Keys en todas las relaciones
- **Normalización**: 3FN aplicada consistentemente
- **Índices**: Optimización en campos de búsqueda frecuente
- **Constraints**: Validaciones a nivel de base de datos
- **Transacciones**: ACID compliance para operaciones críticas

---

## API Y COMUNICACIÓN

### Patrón RPC Personalizado
El sistema utiliza un patrón RPC (Remote Procedure Call) personalizado sobre HTTP:

```javascript
// Estructura de llamada RPC
POST /toProcess
{
    "objectName": "Project",
    "methodName": "crear",
    "params": { /* parámetros del método */ },
    "tx": "uuid-transaction-id"
}

// Respuesta estándar
{
    "success": true,
    "data": { /* resultado del método */ },
    "tx": "uuid-transaction-id"
}
```

### Endpoints Principales
```javascript
// Autenticación
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/logout
GET  /api/auth/verificar

// RPC Principal
POST /toProcess

// Seguridad
GET  /security/questions
POST /security/answers

// Perfil
GET  /api/profile/image
POST /api/profile/image
```

### Cliente HTTP (Frontend)
```javascript
// api.js - Cliente HTTP centralizado
export const rpcCall = (objectName, methodName, params = {}) => {
    const tx = uuidv4();
    
    return fetchApi('/toProcess', {
        method: 'POST',
        body: JSON.stringify({ objectName, methodName, params, tx }),
    });
};
```

---

## SISTEMA DE SEGURIDAD

### Arquitectura de Seguridad Multi-Capa

#### 1. Autenticación
```javascript
// Basada en sesiones con express-session
app.use(session({
    store: new PgStore({ pool: dataAccess.pool }),
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));
```

#### 2. Autorización Basada en Roles
```sql
-- Matriz de permisos
rol_permisos (rol_id, opcion_id, permiso_id, habilitado)
roles (id, nombre_rol) -- Admin, Líder, Colaborador
opciones (id, nombre_opcion, modulo_id) -- Proyectos, Usuarios, etc.
permisos (id, nombre_permiso) -- Crear, Leer, Actualizar, Eliminar
```

#### 3. Sistema de Permisos en Memoria
```javascript
class Security {
    constructor() {
        this.permissionMap = new Map(); // Cache de permisos
    }
    
    async loadAllPermissions() {
        // Carga matriz de permisos en memoria al iniciar
        const { rows } = await dataAccess.exe('seguridad_obtenerMatrizPermisos');
        this.permissionMap.clear();
        
        for (const rule of rows) {
            const key = `${rule.rol_id}-${rule.nombre_metodo.toLowerCase()}`;
            this.permissionMap.set(key, true);
        }
    }
    
    getPermission(rol_id, fullMethodName) {
        const key = `${rol_id}-${fullMethodName}`;
        return this.permissionMap.has(key);
    }
}
```

#### 4. Middleware de Autenticación
```javascript
// auth.middleware.js
export const requireAuth = (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    next();
};
```

#### 5. Validación de Permisos por Método
```javascript
// Cada llamada RPC valida permisos automáticamente
async executeMethod(req, res) {
    const { objectName, methodName } = req.body;
    const usuario = req.session.usuario;
    const fullMethodName = `${objectName.toLowerCase()}.${methodName}`;
    
    // Validación de permisos
    if (!this.getPermission(usuario.rol_id, fullMethodName)) {
        return res.status(403).json({ message: 'Sin permisos' });
    }
    
    // Ejecutar método...
}
```

### Seguridad de Datos
- **Aislamiento por Empresa**: Todas las consultas filtran por empresa_id
- **Validación de Entrada**: Sanitización en todos los endpoints
- **Transacciones**: Operaciones críticas en transacciones ACID
- **Hashing de Contraseñas**: bcryptjs con salt rounds

---

## FUNCIONALIDADES PRINCIPALES

### 1. Gestión de Usuarios y Empresas
```javascript
// Registro con invitación
async registrarConInvitacion(params) {
    // 1. Validar token de invitación
    // 2. Crear usuario con hash de contraseña
    // 3. Crear perfil asociado
    // 4. Enviar email de verificación
    // 5. Marcar invitación como usada
}
```

### 2. Gestión de Proyectos
```javascript
// Creación de proyecto con transacción
async crear(params, usuarioSesion) {
    const client = await this.dataAccess.getClient();
    try {
        await client.query('BEGIN');
        
        // 1. Crear proyecto
        const nuevoProyecto = await client.query(/* INSERT proyecto */);
        
        // 2. Asignar creador como líder
        await client.query(/* INSERT proyecto_usuarios */);
        
        // 3. Agregar miembros adicionales
        for (const miembro of miembros) {
            await client.query(/* INSERT miembro */);
        }
        
        await client.query('COMMIT');
        return nuevoProyecto;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}
```

### 3. Sistema de Actividades
```javascript
// Jerarquía: Proyecto → Objetivos Generales → Objetivos Específicos → Actividades
async obtenerJerarquia(params, usuarioSesion) {
    // 1. Obtener proyecto base
    // 2. Cargar objetivos generales
    // 3. Cargar objetivos específicos
    // 4. Cargar actividades con asignaciones
    // 5. Ensamblar estructura jerárquica
}
```

### 4. Sistema de Notificaciones
```javascript
// Notificaciones automáticas en eventos clave
await this.dataAccess.exe('notificaciones_crear', [
    usuario_id, 
    'NUEVA_ASIGNACION_PROYECTO', 
    mensaje, 
    proyecto_id, 
    'proyecto'
]);
```

### 5. Reportes y Visualización
- **Gráfico de Gantt**: Visualización temporal de actividades
- **Dashboard**: Métricas y KPIs del proyecto
- **Progreso**: Seguimiento de avance por actividad

---

## FLUJO DE DATOS

### Flujo de Autenticación
```
1. Usuario → Login Form → POST /api/auth/login
2. Backend → Validar credenciales → Crear sesión
3. Backend → Respuesta con datos de usuario
4. Frontend → Actualizar AuthContext → Redirigir a Dashboard
```

### Flujo de Operación RPC
```
1. Frontend → rpcCall('Project', 'crear', params)
2. API → POST /toProcess → Security.executeMethod()
3. Security → Validar permisos → Cargar Business Object
4. Business Object → Ejecutar lógica → DataAccess.exe()
5. DataAccess → Query PostgreSQL → Retornar resultado
6. Backend → Formatear respuesta → JSON response
7. Frontend → Procesar datos → Actualizar UI
```

### Flujo de Datos en Tiempo Real
```
1. Acción del Usuario → Actualización en BD
2. Trigger/Job → Crear notificación
3. Frontend → Polling/Refresh → Mostrar notificación
```

---

## PATRONES DE DISEÑO

### 1. Singleton (DataAccess)
```javascript
class DataAccess {
    constructor() {
        if (DataAccess.instance) {
            return DataAccess.instance;
        }
        // Inicialización...
        DataAccess.instance = this;
    }
}
```

### 2. Factory Pattern (Business Objects)
```javascript
// Security.js carga dinámicamente los Business Objects
const { default: BOClass } = await import(`../Objects/${objectName}.js`);
const boInstance = new BOClass(dataAccess);
```

### 3. Repository Pattern (DataAccess)
```javascript
// Abstrae el acceso a datos con queries nombradas
async exe(queryName, params) {
    const queryString = this.queries[queryName];
    return await this.pool.query(queryString, params);
}
```

### 4. MVC Pattern
- **Model**: Business Objects + DataAccess
- **View**: React Components
- **Controller**: Express Routes + Controllers

### 5. Context Pattern (React)
```javascript
// AuthContext para estado global de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## ESCALABILIDAD Y RENDIMIENTO

### Optimizaciones Implementadas

#### 1. Base de Datos
- **Connection Pooling**: Pool de conexiones PostgreSQL
- **Índices Optimizados**: En campos de búsqueda frecuente
- **Queries Preparadas**: Prevención de SQL injection y mejor rendimiento
- **Transacciones Eficientes**: Minimizar tiempo de bloqueo

#### 2. Backend
- **Cache de Permisos**: Matriz de seguridad en memoria
- **Instancias Cacheadas**: Business Objects reutilizados
- **Queries Nombradas**: JSON centralizado para consultas
- **Middleware Eficiente**: Validaciones tempranas

#### 3. Frontend
- **Code Splitting**: Carga bajo demanda con React.lazy
- **Memoización**: React.memo para componentes pesados
- **Optimistic Updates**: UI responsiva antes de confirmación
- **Bundle Optimization**: Vite para builds optimizados

### Consideraciones de Escalabilidad

#### Horizontal Scaling
- **Stateless Backend**: Sesiones en PostgreSQL, no en memoria
- **Load Balancer Ready**: Sin dependencias de servidor específico
- **Database Sharding**: Posible partición por empresa_id

#### Vertical Scaling
- **Resource Monitoring**: Métricas de CPU, memoria, DB
- **Query Optimization**: Análisis de planes de ejecución
- **Caching Strategy**: Redis para datos frecuentes (futuro)

---

## CONCLUSIONES

### Fortalezas del Sistema

1. **Arquitectura Sólida**: Separación clara de responsabilidades
2. **Seguridad Robusta**: Multi-capa con roles y permisos granulares
3. **Escalabilidad**: Diseño preparado para crecimiento
4. **Mantenibilidad**: Código organizado y documentado
5. **Experiencia de Usuario**: Interfaz moderna e intuitiva
6. **Integridad de Datos**: Transacciones ACID y validaciones

### Tecnologías Clave Justificadas

- **PostgreSQL**: Robustez, ACID, relaciones complejas
- **Node.js + Express**: Ecosistema maduro, rendimiento, JavaScript full-stack
- **React**: Componentes reutilizables, ecosistema rico, comunidad activa
- **PrimeReact**: Componentes empresariales, consistencia visual

### Casos de Uso Cubiertos

1. **Gestión Multi-empresa**: Aislamiento completo de datos
2. **Colaboración en Equipo**: Roles, permisos, notificaciones
3. **Seguimiento de Proyectos**: Desde planificación hasta ejecución
4. **Reportes y Métricas**: Visualización de progreso y KPIs
5. **Administración**: Gestión de usuarios, permisos y configuración

### Futuras Mejoras

1. **WebSockets**: Notificaciones en tiempo real
2. **API REST**: Complementar RPC con REST estándar
3. **Microservicios**: Separación por dominios de negocio
4. **Cache Distribuido**: Redis para mejor rendimiento
5. **Monitoreo**: Logging estructurado y métricas
6. **Testing**: Cobertura de pruebas automatizadas

---

**Este documento técnico demuestra la solidez arquitectónica, la implementación cuidadosa y el potencial de escalabilidad del sistema Gestor de Proyectos, evidenciando un desarrollo profesional y bien estructurado.**