import multer from 'multer';
import { guardarImagenPerfil, obtenerImagenPerfil } from '../services/profile.service.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
}).single('profileImage'); // El campo en el formulario se debe llamar 'profileImage'

export const uploadProfileImage = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error al subir el archivo.', error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ningún archivo.' });
        }

        try {
            const usuarioId = req.session.usuario.id;
            const imagenBuffer = req.file.buffer;
            const mimetype = req.file.mimetype;

            await guardarImagenPerfil(usuarioId, imagenBuffer, mimetype);
            res.status(200).json({ message: 'Imagen de perfil actualizada exitosamente.' });
        } catch (error) {
            res.status(500).json({ message: 'Error al guardar la imagen en la base de datos.' });
        }
    });
};

export const getProfileImage = async (req, res) => {
    try {
        const usuarioId = req.params.userId || req.session.usuario.id;
        const imagen = await obtenerImagenPerfil(usuarioId);

        res.setHeader('Content-Type', imagen.mimetype);
        res.send(imagen.buffer);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};