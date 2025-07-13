import { formatResponse, formatError } from '../utils/response.util.js';
import { canExecute } from '../services/security.service.js';
import dataAccess from '../data/DataAccess.js';

export const handleRpcRequest = async (req, res) => {
    // Ahora recibimos 'objectName' y 'methodName'
    const { objectName, methodName, params, tx } = req.body; 
    const usuario = req.session.usuario;

    if (!objectName || !methodName || !tx) {
        const error = new Error('Los campos objectName, methodName y tx son requeridos.');
        return res.status(400).json(formatError(tx || 'unknown', error, error.message));
    }

    // Creamos el nombre completo del método para usarlo en la verificación de permisos.
    const fullMethodName = `${objectName.toLowerCase()}.${methodName}`;

    // --- LÓGICA DE PERMISOS REAL Y ACTUALIZADA ---
    const metodosPublicos = ['invitaciones.validarToken', 'auth.register'];
    let tienePermiso = metodosPublicos.includes(fullMethodName);

    // Si no es público, verificamos los permisos del usuario logueado.
    if (!tienePermiso && usuario) {
        tienePermiso = canExecute(usuario.rol_id, fullMethodName);
    }
    
  
    // --- FIN DE LA LÓGICA DE PERMISOS ---

    try {
        // --- LÓGICA DINÁMICA DE CARGA DE BUSINESS OBJECTS (BO) ---
        // 1. Importar dinámicamente el archivo del BO (ej. 'Project.js')
        const boPath = `../Objects/${objectName}.js`;
        const { default: BOClass } = await import(boPath);

        // 2. Crear una instancia del BO, inyectando el DataAccess
        const boInstance = new BOClass(dataAccess);

        // 3. Verificar si el método (ej. 'crear') existe en la instancia
        if (typeof boInstance[methodName] !== 'function') {
            throw new Error(`El método '${methodName}' no existe en el objeto '${objectName}'.`);
        }

        // 4. Ejecutar el método y obtener el resultado
        const result = await boInstance[methodName](params, usuario);
        
        res.status(200).json(formatResponse(tx, result));

    } catch (error) {
        // Manejo de errores, incluyendo si el archivo del BO no se encuentra
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            const err = new Error(`El objeto de negocio '${objectName}' no existe.`);
            return res.status(404).json(formatError(tx, err, err.message));
        }
        console.error(`Error en el método ${fullMethodName} (tx: ${tx}):`, error);
        res.status(500).json(formatError(tx, error, 'Error interno al procesar la solicitud.'));
    }
};