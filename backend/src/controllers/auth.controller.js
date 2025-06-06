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

export const register = async (req, res) => {
    const { nombre_completo, email, password } = req.body;

    if (!nombre_completo || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos (nombre, email, contraseña) son requeridos.' });
    }

    try {
        const userExistsQuery = 'SELECT email FROM usuarios WHERE email = $1';
        const existingUser = await db.query(userExistsQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' }); // 409 Conflict
        }

        const defaultRoleQuery = "SELECT id FROM roles WHERE nombre_rol = 'Miembro de Equipo'";
        const roleResult = await db.query(defaultRoleQuery);

        if (roleResult.rows.length === 0) {
            console.error("Error crítico: El rol por defecto 'Miembro de Equipo' no se encuentra en la base de datos.");
            return res.status(500).json({ message: 'Error de configuración del servidor.' });
        }
        const defaultRoleId = roleResult.rows[0].id;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const insertUserQuery = `
        INSERT INTO usuarios (nombre_completo, email, password_hash, rol_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre_completo, email, rol_id
      `;
        const newUserResult = await db.query(insertUserQuery, [nombre_completo, email, passwordHash, defaultRoleId]);
        const nuevoUsuario = newUserResult.rows[0];

        req.session.usuario = {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre_completo,
            email: nuevoUsuario.email,
            rol_id: nuevoUsuario.rol_id,
        };

        res.status(201).json({
            message: 'Usuario registrado e sesión iniciada exitosamente.',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}