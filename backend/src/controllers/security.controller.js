import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Devuelve la lista de todas las preguntas de seguridad disponibles
export const getSecurityQuestions = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, pregunta_texto FROM preguntas_seguridad ORDER BY pregunta_texto');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las preguntas de seguridad.' });
    }
};

// Guarda la pregunta y respuesta de un usuario
export const setSecurityAnswer = async (req, res) => {
    const { pregunta_id, respuesta } = req.body;
    const usuario_id = req.session.usuario.id; // Obtenemos el ID del usuario de la sesión

    if (!pregunta_id || !respuesta) {
        return res.status(400).json({ message: 'Se requiere la pregunta y la respuesta.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const respuestaHash = await bcrypt.hash(respuesta, salt);

        // Usamos ON CONFLICT para actualizar si ya existe, o insertar si es nueva
        const query = `
            INSERT INTO respuestas_usuario (usuario_id, pregunta_id, respuesta_hash)
            VALUES ($1, $2, $3)
            ON CONFLICT (usuario_id, pregunta_id) 
            DO UPDATE SET respuesta_hash = $3;
        `;

        await db.query(query, [usuario_id, pregunta_id, respuestaHash]);
        res.status(201).json({ message: 'Respuesta de seguridad guardada exitosamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar la respuesta de seguridad.' });
    }
};