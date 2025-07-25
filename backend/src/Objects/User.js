import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { transporter } from '../config/mailer.js';

class User {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    /**
     * Registra un nuevo usuario usando un token de invitación válido.
     */
    async registrarConInvitacion(params) {
        const { nombre, apellido, password, token_invitacion } = params;

        if (!nombre || !apellido || !password || !token_invitacion) {
            throw new Error('Todos los campos son requeridos para el registro.');
        }

        const client = await this.dataAccess.getClient();
        try {
            await client.query('BEGIN');

            const inviteResult = await client.query(this.dataAccess.queries['invitaciones_buscarActiva'], [token_invitacion]);
            if (inviteResult.rowCount === 0) {
                throw new Error('El token de invitación es inválido, ha expirado o ya fue utilizado.');
            }
            const { email, empresa_id } = inviteResult.rows[0];

            const userExists = await client.query(this.dataAccess.queries['usuarios_buscarPorEmail'], [email]);
            if (userExists.rowCount > 0) {
                throw new Error('Este correo electrónico ya ha sido registrado.');
            }

            const defaultRoleResult = await client.query(this.dataAccess.queries['roles_buscarMiembroDeEquipo']);
            const defaultRoleId = defaultRoleResult.rows[0].id;

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            const emailTokenExpiration = new Date();
            emailTokenExpiration.setHours(emailTokenExpiration.getHours() + 1);

            const newUserResult = await client.query(this.dataAccess.queries['usuarios_crear'], [email, passwordHash, defaultRoleId, empresa_id, emailVerificationToken, emailTokenExpiration]);
            const nuevoUsuarioId = newUserResult.rows[0].id;

            await client.query(this.dataAccess.queries['perfiles_crear'], [nuevoUsuarioId, nombre, apellido]);
            await client.query(this.dataAccess.queries['invitaciones_marcarComoUsada'], [token_invitacion]);

            await client.query('COMMIT');

            const verificationLink = `http://localhost:5173/verificar-email?token=${emailVerificationToken}`;
            await transporter.sendMail({
                from: `"Gestor de Proyectos" <${process.env.EMAIL_FROM}>`,
                to: email, subject: 'Verifica tu cuenta de correo electrónico',
                html: `<h2>¡Bienvenido ${nombre}!</h2><p>Tu cuenta ha sido creada. Por favor, haz clic en el siguiente enlace para verificar tu correo:</p><a href="${verificationLink}">Verificar mi cuenta</a>`,
            });

            return { message: '¡Registro exitoso! Revisa tu correo para verificar tu cuenta.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Lista todos los usuarios verificados de la empresa del usuario en sesión.
     */
    async listarVerificadosPorEmpresa(params, usuarioSesion) {
        const { empresa_id } = usuarioSesion;
        const { rows } = await this.dataAccess.exe('usuarios_listarVerificadosPorEmpresa', [empresa_id]);
        return rows;
    }

    async actualizarPerfil(params, usuarioSesion) {
        const { nombre, apellido } = params;
        const { id: usuario_id } = usuarioSesion;
    
        if (!nombre || !apellido) {
            throw new Error('El nombre y el apellido son requeridos.');
        }
    
        const { rows } = await this.dataAccess.exe('perfiles_actualizarNombre', 
            [nombre, apellido, usuario_id]
        );
    
        return rows[0];
    }
}

export default User;