import { crearInvitacion, validarTokenInvitacion } from '../services/invitation.service.js'
import { registrarUsuarioConInvitacion } from '../services/user.service.js';
import { 
    crearProyecto, 
    listarProyectos, 
    obtenerProyectoPorId,
    actualizarProyecto,
    archivarProyecto
} from '../services/project.service.js';

const methodRegistry = new Map();

methodRegistry.set('auth.register', registrarUsuarioConInvitacion); 

methodRegistry.set('invitaciones.crear', crearInvitacion);
methodRegistry.set('invitaciones.validarToken', validarTokenInvitacion);

methodRegistry.set('proyectos.crear', crearProyecto);
methodRegistry.set('proyectos.listar', listarProyectos); 
methodRegistry.set('proyectos.obtenerPorId', obtenerProyectoPorId);
methodRegistry.set('proyectos.actualizar', actualizarProyecto);
methodRegistry.set('proyectos.archivar', archivarProyecto);

export default methodRegistry;