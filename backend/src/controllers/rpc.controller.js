import methodRegistry from '../rpc/methodRegistry.js';
import { formatResponse, formatError } from '../utils/response.util.js';
import { canExecute } from '../services/security.service.js'; 

export const handleRpcRequest = async (req, res) => {
    const { method, params, tx } = req.body;
    const usuario = req.session.usuario; // Obtenemos el usuario de la sesión

    if (!method || !tx) {
        const error = new Error('El método y el tx_id son requeridos.');
        return res.status(400).json(formatError(tx || 'unknown', error, error.message));
    }

    const methodFunction = methodRegistry.get(method);
    if (!methodFunction) {
        const error = new Error(`Método '${method}' no encontrado.`);
        return res.status(404).json(formatError(tx, error, error.message));
    }

    // Métodos públicos que no necesitan validación de permisos
    const metodosPublicos = ['invitaciones.validarToken', 'auth.register'];

    let tienePermiso = metodosPublicos.includes(method);

    // Si no es un método público, verificamos los permisos del usuario logueado
    if (!tienePermiso && usuario) {
        tienePermiso = canExecute(usuario.rol_id, method);
    }

    if (!tienePermiso) {
        const error = new Error('No tienes permiso para ejecutar este método.');
        return res.status(403).json(formatError(tx, error, 'Acceso denegado.'));
    }

    try {
        const result = await methodFunction(params, usuario);
        res.status(200).json(formatResponse(tx, result));
    } catch (error) {
        console.error(`Error en el método ${method} (tx: ${tx}):`, error);
        res.status(500).json(formatError(tx, error, 'Error interno al procesar la solicitud.'));
    }
};