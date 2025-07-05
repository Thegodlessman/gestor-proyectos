import { crearInvitacion, validarTokenInvitacion } from '../services/invitation.service.js'
import { registrarUsuarioConInvitacion, listarUsuariosVerificadosPorEmpresa } from '../services/user.service.js';
import { obtenerMatrizDePermisos, actualizarPermiso } from '../services/admin.service.js';
import { 
    crearProyecto, 
    listarProyectos, 
    obtenerProyectoPorId,
    actualizarProyecto,
    archivarProyecto,
    listarMiembros,
    agregarMiembro,
    eliminarMiembro
} from '../services/project.service.js';

const methodRegistry = new Map();

methodRegistry.set('auth.register', registrarUsuarioConInvitacion); 

methodRegistry.set('usuarios.listarVerificadosPorEmpresa', listarUsuariosVerificadosPorEmpresa);

methodRegistry.set('invitaciones.crear', crearInvitacion);
methodRegistry.set('invitaciones.validarToken', validarTokenInvitacion);

methodRegistry.set('proyectos.crear', crearProyecto);
methodRegistry.set('proyectos.listar', listarProyectos); 
methodRegistry.set('proyectos.obtenerPorId', obtenerProyectoPorId);
methodRegistry.set('proyectos.actualizar', actualizarProyecto);
methodRegistry.set('proyectos.archivar', archivarProyecto);
methodRegistry.set('proyectos.agregarMiembro', agregarMiembro); 
methodRegistry.set('proyectos.listarMiembros', listarMiembros); 
methodRegistry.set('proyectos.eliminarMiembro', eliminarMiembro);

methodRegistry.set('permisos.obtenerMatriz', obtenerMatrizDePermisos);
methodRegistry.set('permisos.actualizar', actualizarPermiso);

//console.log(methodRegistry)

export default methodRegistry;