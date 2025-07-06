import { listarPrioridades } from '../services/utility.service.js';

/**
 * Maneja la petición para obtener la lista de todas las prioridades.
 */
export const getPrioridades = async (req, res) => {
    try {
        const prioridades = await listarPrioridades();
        res.status(200).json(prioridades);
    } catch (error) {
        console.error("Error al obtener las prioridades:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};