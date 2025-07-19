import crypto from 'crypto';
import { transporter } from '../config/mailer.js';

class Invitation {
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
    }

    /**
     * Crea y envía una invitación a un nuevo usuario.
     */
    async crear(params, usuarioSesion) {
        const { email: emailAInvitar } = params;
        const { empresa_id, nombre, apellido } = usuarioSesion;

        if (!empresa_id) {
            throw new Error('No tienes permiso o no perteneces a ninguna empresa.');
        }
        
        // Antes de insertar, eliminamos cualquier invitación previa para este email en esta empresa.
        await this.dataAccess.exe('invitaciones_eliminarPorEmail', [empresa_id, emailAInvitar]);

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date();
        expiracion.setDate(expiracion.getDate() + 7);

        const { rows } = await this.dataAccess.exe('invitaciones_crear', [empresa_id, emailAInvitar, token, expiracion]);
        
        const invitationLink = `http://localhost:5173/register?invite_token=${token}`;
        await transporter.sendMail({
            from: `"Gestor de Proyectos" <${process.env.EMAIL_FROM}>`,
            to: emailAInvitar,
            subject: `¡Has sido invitado a unirte a Gestor de Proyectos!`,
            html: `<h2>¡Hola!</h2><p>Has sido invitado por ${nombre} ${apellido} para unirte a su equipo.</p><p>Para crear tu cuenta, haz clic en el siguiente enlace:</p><a href="${invitationLink}" target="_blank">Aceptar Invitación y Registrarse</a>`,
        });

        console.log(`Correo de invitación enviado a ${emailAInvitar}`);
        return { message: `Invitación enviada exitosamente a ${emailAInvitar}.` };
    }

    /**
     * Valida un token de invitación.
     */
    async validarToken(params) {
        const { token } = params;
        if (!token) {
            throw new Error('El token de invitación es requerido.');
        }

        const { rows } = await this.dataAccess.exe('invitaciones_buscarActiva', [token]);
        if (rows.length === 0) {
            throw new Error('Este enlace de invitación no es válido o ya ha expirado.');
        }
        console.log("SI")
        return { email: rows[0].email };
    }
}

export default Invitation;