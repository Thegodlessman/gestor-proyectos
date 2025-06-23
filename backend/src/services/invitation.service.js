import db from '../config/db.js';
import crypto from 'crypto';
import { transporter } from '../config/mailer.js';

export const crearInvitacion = async (params, usuarioSesion) => {
    const { email: emailAInvitar } = params;
    
    // El usuario que invita debe estar en una sesión y pertenecer a una empresa
    if (!usuarioSesion || !usuarioSesion.empresa_id) {
        throw new Error('No tienes permiso o no perteneces a ninguna empresa.');
    }

    // Si ya hay una invitacion se elimina para crear una nuevas
    await db.query(`
        DELETE FROM invitaciones 
        WHERE empresa_id = $1 
        AND email = $2 
        AND fue_usado = false`, 
        [usuarioSesion.empresa_id, emailAInvitar]);

    // Generar token y expiración
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + 7); // La invitación es válida por 7 días

    // Guardar la invitación en la base de datos
    const query = `
        INSERT INTO invitaciones (empresa_id, email, token_invitacion, expiracion_token)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const { rows } = await db.query(query, [usuarioSesion.empresa_id, emailAInvitar, token, expiracion]);
    
    // Enviar el correo de invitación
    const invitationLink = `http://localhost:5173/register?invite_token=${token}`;
    await transporter.sendMail({
        from: `"Gestor de Proyectos" <${process.env.EMAIL_FROM}>`,
        to: emailAInvitar,
        subject: `¡Has sido invitado a unirte a Gestor de Proyectos!`,
        html: `
            <h2>¡Hola!</h2>
            <p>Has sido invitado por ${usuarioSesion.nombre} ${usuarioSesion.apellido} para unirte a su equipo en Gestor de Proyectos.</p>
            <p>Para crear tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${invitationLink}" target="_blank">Aceptar Invitación y Registrarse</a>
            <p>Este enlace expirará en 7 días.</p>
        `,
    });

    console.log(`Correo de invitación enviado a ${emailAInvitar}`);
    return { message: `Invitación enviada exitosamente a ${emailAInvitar}.`, invitation: rows[0] };
};

export const validarTokenInvitacion = async (params) => {
    const { token } = params;
    if (!token) {
        throw new Error('El token de invitación es requerido.');
    }

    // Buscamos una invitación que coincida, que no haya sido usada y que no haya expirado.
    const query = `
        SELECT email, empresa_id 
        FROM invitaciones 
        WHERE token_invitacion = $1 AND fue_usado = false AND expiracion_token > NOW()
    `;
    
    const { rows } = await db.query(query, [token]);

    if (rows.length === 0) {
        throw new Error('Este enlace de invitación no es válido o ya ha expirado.');
    }

    // Si el token es válido, devolvemos el email asociado para que el frontend pueda usarlo.
    return { email: rows[0].email };
};