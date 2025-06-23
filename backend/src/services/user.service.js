import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { transporter } from '../config/mailer.js';

export const registrarUsuarioConInvitacion = async (params) => {
    const { nombre, apellido, password, token_invitacion } = params;

    if (!nombre || !apellido || !password || !token_invitacion) {
        throw new Error('Todos los campos son requeridos para el registro.');
    }

    const client = await db.getPool().connect();

    try {
        await client.query('BEGIN');

        // 1. Validar la invitación de nuevo dentro de la transacción para máxima seguridad
        const inviteQuery = `
            SELECT email, empresa_id FROM invitaciones
            WHERE token_invitacion = $1 AND fue_usado = false AND expiracion_token > NOW()
            FOR UPDATE;
        `;
        const inviteResult = await client.query(inviteQuery, [token_invitacion]);
        if (inviteResult.rows.length === 0) {
            throw new Error('El token de invitación es inválido, ha expirado o ya fue utilizado.');
        }

        const { email, empresa_id } = inviteResult.rows[0];

        // 2. Verificar que el email no haya sido registrado mientras la invitación estaba activa
        const userExists = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            throw new Error('Este correo electrónico ya ha sido registrado.');
        }

        // 3. Obtener rol por defecto, hashear contraseña, generar token de verificación de correo
        const defaultRoleResult = await client.query(`
            SELECT id 
            FROM roles 
            WHERE nombre_rol = 'Miembro de Equipo'`);
        const defaultRoleId = defaultRoleResult.rows[0].id;
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailTokenExpiration = new Date();
        emailTokenExpiration.setHours(emailTokenExpiration.getHours() + 1);

        // 4. Crear el nuevo usuario
        const newUserResult = await client.query(
            'INSERT INTO usuarios (email, password_hash, rol_id, empresa_id, token_verificacion, expiracion_token_verificacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [email, passwordHash, defaultRoleId, empresa_id, emailVerificationToken, emailTokenExpiration]
        );
        const nuevoUsuarioId = newUserResult.rows[0].id;

        // 5. Crear su perfil
        await client.query(
            'INSERT INTO perfiles (usuario_id, nombre, apellido) VALUES ($1, $2, $3)',
            [nuevoUsuarioId, nombre, apellido]
        );

        // 6. Marcar la invitación como usada
        await client.query('UPDATE invitaciones SET fue_usado = true WHERE token_invitacion = $1', [token_invitacion]);

        await client.query('COMMIT');

        // 7. Enviar correo de verificación (fuera de la transacción)
        const verificationLink = `http://localhost:5173/verificar-email?token=${emailVerificationToken}`;
        await transporter.sendMail({
            from: `"Gestor de Proyectos" <${process.env.EMAIL_FROM}>`,
            to: email, subject: 'Verifica tu cuenta de correo electrónico',
            html: `<h2>¡Bienvenido ${nombre}!</h2><p>Tu cuenta ha sido creada. Por favor, haz clic en el siguiente enlace para verificar tu correo:</p><a href="${verificationLink}">Verificar mi cuenta</a>`,
        });

        return { message: '¡Registro exitoso! Revisa tu correo para verificar tu cuenta y poder iniciar sesión.' };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error; 
    } finally {
        client.release();
    }
};