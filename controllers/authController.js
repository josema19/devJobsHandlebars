// Importar librerías
const passport = require('passport');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

// Importar modelos
const Vacante = require('../models/Vacante');
const Usuario = require('../models/Usuario');

// Exportar funciones
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

exports.verificarUsuario = (req, res, next) => {
    // Revisar usuario
    if (req.isAuthenticated()) {
        return next();
    };

    // Redireccionar
    res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {
    // Consultar vacantes del usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean()

    // Renderizar
    res.render('administracion', {
        nombrePagina: 'Panel de Administación',
        tagline: 'Crea y Administra tus vacnantes desde aquí',
        vacantes,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
};

exports.cerrarSesion = (req, res) => {
    // Cerrar sesión
    req.logout();

    // Enviar mensaje y redireccionar
    req.flash('correcto', 'Se ha cerrado la sesión correctamente');
    return res.redirect('/iniciar-sesion');
};

exports.formRestablecerPassword = (req, res) => {
    // Renderizar
    res.render('restablecer-password', {
        nombrePagina: 'Restablece tu password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    });
};

exports.enviarToken = async (req, res) => {
    // Verificar usuario
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    };

    // Generar token, fecha de expiración y guardar en la BD
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;
    await usuario.save();

    // Generar url
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    // Enviar correo
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Mostrar mensaje y redireccionar
    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion');
};

exports.restablecerPassword = async (req, res) => {
    // Obtener usuario
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if (!usuario) {
        req.flash('error', 'El formulario ya no es válido, intentan de nuevo');
        return res.redirect('/restablecer-password');
    };

    // Renderizar
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    });
};

exports.guardarPassword = async (req, res) => {
    // Obtener usuario
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if (!usuario) {
        req.flash('error', 'El formulario ya no es válido, intentan de nuevo');
        return res.redirect('/restablecer-password');
    };

    // Guardar en la BD
    usuario.password = req.body.password;
    usuario.token = null;
    usuario.expira = null;
    await usuario.save();

    // Mensaje y redirección
    req.flash('correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion');


}