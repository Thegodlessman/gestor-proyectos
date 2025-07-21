import { formatError } from '../utils/response.util.js';

export const handleRequest = (req, res, securityInstance) => { 
    const { objectName, methodName, tx } = req.body;
    const usuario = req.session.usuario;
    const fullMethodName = `${objectName.toLowerCase()}.${methodName.toLowerCase()}`;
    
    const publicMethods = ['invitation.validartoken', 'user.registrarconinvitacion'];
    if (publicMethods.includes(fullMethodName)) {
        return securityInstance.executeMethod(req, res);
    }

    if (usuario && securityInstance.getPermission(usuario.rol_id, fullMethodName)) {
        return securityInstance.executeMethod(req, res);
    } else {
        const error = new Error('No tienes permiso para ejecutar este método o tu sesión ha expirado.');
        return res.status(403).json(formatError(tx, error, 'Acceso denegado.'));
    }
};