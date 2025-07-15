export const handleRequest = (req, res, securityInstance) => {
    const { objectName, methodName, tx } = req.body;
    const usuario = req.session.usuario;
    const fullMethodName = `${objectName.toLowerCase()}.${methodName}`;

    const publicMethods = ['invitaciones.validarToken', 'auth.register'];
    if (publicMethods.includes(fullMethodName)) {
        return securityInstance.executeMethod(req, res);
    }
    
    if (usuario && securityInstance.getPermission(usuario.rol_id, fullMethodName)) {
        return securityInstance.executeMethod(req, res);
    } else {
        const error = new Error('No tienes permiso para ejecutar este método.');
        return res.status(403).json({ tx, status: 'FORBIDDEN', typeMsg: 'error', shortMsg: 'Acceso denegado.', longMsg: error.message, data: {} });
    }
};