import dataAccess from '../data/DataAccess.js';

export const guardarImagenPerfil = async (usuarioId, imagenBuffer, mimetype) => {
    await dataAccess.exe('perfiles_actualizarImagen', [imagenBuffer, mimetype, usuarioId]);
};

export const obtenerImagenPerfil = async (usuarioId) => {
    const { rows } = await dataAccess.exe('perfiles_obtenerImagen', [usuarioId]);
    if (rows.length === 0 || !rows[0].imagen_perfil) {
        throw new Error('Imagen de perfil no encontrada.');
    }
    return { buffer: rows[0].imagen_perfil, mimetype: rows[0].imagen_mimetype };
};