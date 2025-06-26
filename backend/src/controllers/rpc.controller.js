import methodRegistry from '../rpc/methodRegistry.js';
import { formatResponse, formatError } from '../utils/response.util.js';

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

    let tienePermiso = false;

    // Métodos públicos que no requieren sesión
    const metodosPublicos = ['invitaciones.validarToken', 'auth.register'];
    if (metodosPublicos.includes(method)) {
        tienePermiso = true;
    }

    // Métodos que sí requieren sesión
    if (usuario && usuario.nombre_rol) {
        switch (method) {
            case 'proyectos.crear':
                if (['Administrador', 'Project Manager'].includes(usuario.nombre_rol)) {
                    tienePermiso = true;
                }
                break;
            case 'proyectos.actualizar': 
                if (['Administrador', 'Project Manager'].includes(usuario.nombre_rol)) {
                    tienePermiso = true;
                }
                break;
            case 'proyectos.archivar': 
                if (usuario.nombre_rol === 'Administrador') {
                    tienePermiso = true;
                }
                break;
            case 'proyectos.listar':
                tienePermiso = true;
                break;
            case 'proyectos.obtenerPorId':
                tienePermiso = true;
                break;
            case 'invitaciones.crear':
                if (usuario.nombre_rol === 'Administrador') {
                    tienePermiso = true;
                }
                break;
            case 'proyectos.agregarMiembro':
                if (['Administrador', 'Project Manager'].includes(usuario.nombre_rol)) {
                    tienePermiso = true;
                }
                break;
            case 'proyectos.listarMiembros':
                tienePermiso = true;
                break;
            case 'proyectos.eliminarMiembro': // <-- NUEVO
                if (['Administrador', 'Project Manager'].includes(usuario.nombre_rol)) {
                    tienePermiso = true;
                }
                break;
        }
    }
    // TODO: En el futuro, esta lógica de switch se reemplazará con una única
    // consulta al mapa de permisos en memoria, como en el diagrama del profesor.

    if (!tienePermiso) {
        const error = new Error('No tienes permiso para ejecutar este método.');
        return res.status(403).json(formatError(tx, error, 'Acceso denegado.'));
    }

    // --- TERMINA LÓGICA DE PERMISOS ---

    try {
        const result = await methodFunction(params, usuario);
        res.status(200).json(formatResponse(tx, result));
    } catch (error) {
        console.error(`Error en el método ${method} (tx: ${tx}):`, error);
        res.status(500).json(formatError(tx, error, 'Error interno al procesar la solicitud.'));
    }
};