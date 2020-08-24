// Importar librerías
const { validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

// Importar modelos
const Usuario = require('../models/Usuario');

let FILENAME = null;

// Exportar funciones
exports.subirImagen = (req, res, next) => {
    const configuracionMulter = {
        limits: { fileSize: 100000 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '../../public/uploads/perfiles')
            },
            filename: (req, file, cb) => {
                const extension = file.mimetype.split('/')[1];
                cb(null, `${shortid.generate()}.${extension}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if ((file.mimetype === 'image/jpeg') || (file.mimetype === 'image/png')) {
                cb(null, true);
            } else {
                cb(new Error('Formato no válido'), false);
            };
        }
    };

    const upload = multer(configuracionMulter).single('imagen');

    // Definir configuración de multer
    upload(req, res, error => {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100KB');
                } else {
                    req.flash('error', error.message);
                };
            } else {
                req.flash('error', error.message);
            };
            return res.redirect('/administracion');
        } else {
            FILENAME = req.file.filename;
            return next();
        }
    });
};

exports.formCrearCuenta = (_, res) => {
    // Renderizar
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, sólo debes crear una cuenta'
    });
};

exports.crearUsuario = async (req, res) => {
    // Verificar si hay errores
    const errores = validationResult(req);

    if (errores.errors.length > 0) {
        req.flash('error', errores.errors.map(error => error.msg));
        return res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, sólo debes crear una cuenta',
            mensajes: req.flash()
        });
    };

    // Crear Usuario
    const usuario = new Usuario(req.body);

    // Guardar en la BD
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    };
};

exports.formIniciarSesion = (req, res) => {
    // Renderizar
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión devJobs',
    })
};

exports.formEditarPerfil = (req, res) => {
    // Renderizar
    res.render('editar-perfil', {
        nombrePagina: 'Editar tu perfil en devJobs',
        nombre: req.user.nombre,
        email: req.user.email,
        imagen: req.user.imagen,
        cerrarSesion: true,
    });
};

exports.editarPerfil = async (req, res) => {
    // Verificar si hay errores
    const errores = validationResult(req);

    if (errores.errors.length > 0) {
        req.flash('error', errores.errors.map(error => error.msg));
        return res.render('editar-perfil', {
            nombrePagina: 'Editar tu perfil en devJobs',
            nombre: req.user.nombre,
            email: req.user.email,
            imagen: req.user.imagen,
            cerrarSesion: true,
            mensajes: req.flash()
        });
    };

    // Obtener usuario
    const usuario = await Usuario.findById(req.user._id);

    // Reescribir campos
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.password) {
        usuario.password = req.body.password
    };
    if (FILENAME) {
        usuario.imagen = FILENAME;
        FILENAME = null;
    };
    // Guardar en la BD
    await usuario.save();

    // Emitir mensaje y Redireccionar
    req.flash('correcto', 'Cambios guardados correctamente');
    res.redirect('/administracion');
};