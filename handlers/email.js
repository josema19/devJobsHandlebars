// Importar librerías
const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

// Definir Función encargada de enviar correos
exports.enviar = async (opciones) => {
    // Destructuración
    const { usuario: { email }, subject, resetUrl, archivo } = opciones;

    // Definir Transporte
    let transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass,
        },
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extname: '.handlebars',
            layoutsDir: 'views/emails/',
            defaultLayout: `${archivo}`
        },
        viewPath: __dirname + '/../views/emails',
        extName: '.handlebars'
    }));

    // Definir Opciones
    let mailOptions = {
        from: 'devJobs <no-reply@devjobs.com>',
        to: email,
        subject: subject,
        template: archivo,
        context: {
            resetUrl
        }
    };

    // Enviar Correo
    let info = await transporter.sendMail(mailOptions);
};
