import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        const queryText = 'SELECT id, nombre_completo, email, password_hash, rol_id FROM usuarios WHERE email = $1';
        const { rows } = await db.query(queryText, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const usuario = rows[0];
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre_completo,
            email: usuario.email,
            rol_id: usuario.rol_id,
        };

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            usuario: req.session.usuario 
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'No se pudo cerrar la sesión.' });
        }
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    });
};

export const verificarSesion = (req, res) => {
    if (req.session && req.session.usuario) {
        // Hay una sesión activa, devolvemos los datos del usuario
        res.status(200).json({
            logueado: true,
            usuario: req.session.usuario
        });
    } else {
        // No hay sesión
        res.status(401).json({
            logueado: false,
            message: 'No hay una sesión activa.'
        });
    }
};