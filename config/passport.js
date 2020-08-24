// Importar librerías
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

// Importar modelos
const Usuario = require('../models/Usuario');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    // Validar Existencia de usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return done(null, false, {
        message: 'El usuario no existe'
    });

    // Validar password correcto
    const verificarPassword = usuario.compararPassword(password);
    if (!verificarPassword) return done(null, false, {
        message: 'El password es incorrecto'
    });

    // Retornar el usuario
    return done(null, usuario);
}));

// Sirve para el manejo de la sesión del usuario
passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async (id, done) => {
    const usuario = await Usuario.findById(id);
    return done(null, usuario);
});


module.exports = passport;
