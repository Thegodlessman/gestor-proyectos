import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { transporter } from '../config/mailer.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    try {
        const queryText = `
            SELECT u.*, p.nombre, p.apellido, r.nombre_rol
            FROM usuarios u
            JOIN perfiles p ON u.id = p.usuario_id
            JOIN roles r ON u.rol_id = r.id 
            WHERE u.email = $1; 
        `;
        const { rows } = await db.query(queryText, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const usuario = rows[0];

        if (!usuario.correo_verificado) {
            return res.status(403).json({ message: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico.' });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Guardamos los nuevos datos en la sesión
        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol_id: usuario.rol_id,
            nombre_rol: usuario.nombre_rol,
            empresa_id: usuario.empresa_id 
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

export const register = async (req, res) => {
    const { nombre, apellido, email, password, nombre_empresa } = req.body;

    if (!nombre || !apellido || !email || !password || !nombre_empresa) {
        return res.status(400).json({ message: 'Todos los campos (nombre, apellido, email, contraseña y nombre de empresa) son requeridos.' });
    }

    // Obtenemos un cliente del pool para manejar la transacción
    const client = await db.getPool().connect();

    try {
        // --- INICIAMOS LA TRANSACCIÓN ---
        await client.query('BEGIN');

        // 1. Verificar si el email ya existe
        const userExists = await client.query('SELECT email FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            throw new Error('El correo electrónico ya está en uso.');
        }

        // 2. Buscar o crear la empresa
        let empresa_id;
        const empresaResult = await client.query('SELECT id FROM empresas WHERE nombre_empresa = $1', [nombre_empresa]);
        if (empresaResult.rows.length > 0) {
            empresa_id = empresaResult.rows[0].id;
        } else {
            const nuevaEmpresaResult = await client.query('INSERT INTO empresas (nombre_empresa) VALUES ($1) RETURNING id', [nombre_empresa]);
            empresa_id = nuevaEmpresaResult.rows[0].id;
        }

        // 3. Obtener el rol por defecto
        const defaultRoleResult = await client.query("SELECT id FROM roles WHERE nombre_rol = 'Miembro de Equipo'");
        if (defaultRoleResult.rows.length === 0) {
            throw new Error("Error de configuración: El rol 'Miembro de Equipo' no existe.");
        }
        const defaultRoleId = defaultRoleResult.rows[0].id;

        // 4. Hashear contraseña y generar token de verificación
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date();
        tokenExpiration.setHours(tokenExpiration.getHours() + 1);

        // 5. Insertar en la tabla 'usuarios'
        const newUserResult = await client.query(
            'INSERT INTO usuarios (email, password_hash, rol_id, empresa_id, token_verificacion, expiracion_token_verificacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [email, passwordHash, defaultRoleId, empresa_id, verificationToken, tokenExpiration]
        );
        const nuevoUsuarioId = newUserResult.rows[0].id;

        // 6. Insertar en la tabla 'perfiles'
        await client.query(
            'INSERT INTO perfiles (usuario_id, nombre, apellido) VALUES ($1, $2, $3)',
            [nuevoUsuarioId, nombre, apellido]
        );

        // --- FINALIZAMOS Y CONFIRMAMOS LA TRANSACCIÓN ---
        await client.query('COMMIT');

        const verificationLink = `http://localhost:5173/verificar-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: `"Gestor de Proyectos" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Verifica tu cuenta de correo electrónico',
            html: `<h2>¡Hola ${nombre}!</h2><p>Gracias por registrarte...</p><a href="${verificationLink}">Verificar mi cuenta</a>`, // Contenido del email igual
        });

        console.log(`Correo de verificación enviado a ${email}`);

        res.status(201).json({
            message: '¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta.'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en el proceso de registro (transacción revertida):', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor.' });
    } finally {
        client.release();
    }
}

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

export const verificarEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Token de verificación no proporcionado.' });
        }

        // Buscamos un usuario con ese token que no haya expirado
        const userResult = await db.query(
            'SELECT * FROM usuarios WHERE token_verificacion = TRIM($1) AND expiracion_token_verificacion > NOW()',
            [token]
        );

        if (userResult.length === 0) {
            return res.status(400).json({ message: 'El enlace de verificación es inválido o ha expirado.' });
        }

        // Verificamos al usuario y limpiamos los campos del token
        await db.query(
            'UPDATE usuarios SET correo_verificado = true, token_verificacion = NULL, expiracion_token_verificacion = NULL WHERE token_verificacion = $1',
            [token]
        );

        res.status(200).json({ message: '¡Tu correo ha sido verificado exitosamente! Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const startPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'El correo es requerido.' });

    try {
        // Obtenemos el usuario y su pregunta de seguridad en una sola consulta
        const query = `
            SELECT u.id, p.pregunta_texto
            FROM usuarios u
            JOIN respuestas_usuario ru ON u.id = ru.usuario_id
            JOIN preguntas_seguridad p ON ru.pregunta_id = p.id
            WHERE u.email = $1;
        `;
        const { rows } = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(200).json({ message: 'Si existe una cuenta con este correo y tiene preguntas configuradas, se procederá con el siguiente paso.' });
        }

        const userData = rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 15); // Token válido por 15 minutos

        await db.query(
            'UPDATE usuarios SET token_reset_password = $1, expiracion_token_reset = $2 WHERE id = $3',
            [resetToken, expiration, userData.id]
        );

        res.status(200).json({
            pregunta_texto: userData.pregunta_texto,
            reset_token: resetToken // Enviamos el token para el siguiente paso
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// FUNCIÓN 2: Verificar la respuesta a la pregunta de seguridad
export const verifySecurityAnswer = async (req, res) => {
    const { reset_token, respuesta } = req.body;
    if (!reset_token || !respuesta) return res.status(400).json({ message: 'Se requiere el token y la respuesta.' });

    try {
        const query = `
            SELECT u.id, ru.respuesta_hash
            FROM usuarios u
            JOIN respuestas_usuario ru ON u.id = ru.usuario_id
            WHERE u.token_reset_password = $1 AND u.expiracion_token_reset > NOW();
        `;
        const { rows } = await db.query(query, [reset_token]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'El token es inválido, ha expirado, o la respuesta es incorrecta.' });
        }

        const { respuesta_hash } = rows[0];
        const isMatch = await bcrypt.compare(respuesta, respuesta_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'El token es inválido, ha expirado, o la respuesta es incorrecta.' });
        }

        // Si la respuesta es correcta, solo devolvemos éxito. 
        res.status(200).json({ success: true, message: 'Respuesta correcta.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// FUNCIÓN 3: Finalizar el reseteo y establecer la nueva contraseña
export const finalizePasswordReset = async (req, res) => {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) return res.status(400).json({ message: 'Se requiere el token y la nueva contraseña.' });

    try {
        // Volvemos a verificar el token para máxima seguridad
        const userResult = await db.query(
            'SELECT id FROM usuarios WHERE token_reset_password = $1 AND expiracion_token_reset > NOW()',
            [reset_token]
        );

        if (userResult.length === 0) {
            return res.status(400).json({ message: 'El token de reseteo es inválido o ha expirado.' });
        }

        const userId = userResult.rows[0].id;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(new_password, salt);

        // Actualizamos la contraseña y limpiamos los tokens de reseteo
        await db.query(
            'UPDATE usuarios SET password_hash = $1, token_reset_password = NULL, expiracion_token_reset = NULL WHERE id = $2',
            [passwordHash, userId]
        );

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};