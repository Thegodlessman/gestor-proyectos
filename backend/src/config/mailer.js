import nodemailer from 'nodemailer';

// Función para crear una cuenta de prueba en Ethereal
export const createTestAccount = async () => {
    const testAccount = await nodemailer.createTestAccount();
    console.log("****************************************************");
    console.log("Cuenta de Ethereal para pruebas de email creada:");
    console.log("Usuario:", testAccount.user);
    console.log("Contraseña:", testAccount.pass);
    console.log("****************************************************");
    return testAccount;
};

export const createTransporter = (auth) => {
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: auth.user,
            pass: auth.pass,
        },
    });
};