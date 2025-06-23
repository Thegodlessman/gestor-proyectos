import { crearInvitacion, validarTokenInvitacion } from '../services/invitation.service.js'
import { registrarUsuarioConInvitacion } from '../services/user.service.js';

const methodRegistry = new Map();

methodRegistry.set('invitaciones.crear', crearInvitacion);
methodRegistry.set('invitaciones.validarToken', validarTokenInvitacion);
methodRegistry.set('auth.register', registrarUsuarioConInvitacion); 


export default methodRegistry;