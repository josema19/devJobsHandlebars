// Importar librerías
const slug = require('slug');
const shortid = require('shortid');
const { validationResult } = require('express-validator');
const multer = require('multer');

// Importar modelos
const Vacante = require('../models/Vacante');

let FILENAME = null;

// Exportar funciones
exports.formNuevaVacante = (req, res) => {
    // Renderizar
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        imagen: req.user.imagen,
        nombre: req.user.nombre
    });
};

exports.agregarVacante = async (req, res) => {
    // Verificar si hay errores
    const errores = validationResult(req);

    if (errores.errors.length > 0) {
        req.flash('error', errores.errors.map(error => error.msg));
        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
    };

    // Definir objeto de valores a insertar
    const input = {
        ...req.body,
        salario: Number(req.body.salario),
        skills: req.body.skills.split(','),
        url: `${slug(req.body.titulo)}-${shortid.generate()}`,
        autor: req.user._id
    };

    // Crear nueva vacante
    const vacante = new Vacante(input);

    // Almacenar en la BD
    try {
        await vacante.save();
        res.redirect(`/vacantes/${vacante.url}`);
    } catch (error) {
        console.log(error);
    };
};

exports.mostrarVacante = async (req, res, next) => {
    // Obtener url y buscar en la bd
    const { url } = req.params;
    const vacante = await Vacante.findOne({ url }).populate('autor').lean();
    if (!vacante) return next();

    console.log(vacante);

    // Renderizar
    res.render('vacante', {
        nombrePagina: vacante.titulo,
        barra: true,
        vacante
    });
};

exports.formEditarVacante = async (req, res, next) => {
    // Obtener url y buscar en la bd
    const { url } = req.params;
    const vacante = await Vacante.findOne({ url }).lean();
    if (!vacante) return next();

    // Renderizar
    res.render('editar-vacante', {
        nombrePagina: `Editar - ${vacante.titulo}`,
        vacante,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
    });
};

exports.editarVacante = async (req, res) => {
    // Verificar si hay errores
    const errores = validationResult(req);

    if (errores.errors.length > 0) {
        req.flash('error', errores.errors.map(error => error.msg));
        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
    };

    // Obtener url
    const { url } = req.params;

    // Modificar información proveniente de req.body
    const input = {
        ...req.body,
        salario: Number(req.body.salario),
        skills: req.body.skills.split(',')
    };

    // Actualizar en la BD
    const vacanteActualizada = await Vacante.findOneAndUpdate(
        { url },
        input,
        { new: true, runValidators: true }
    );

    // Redireccionar
    res.redirect(`/vacantes/${vacanteActualizada.url}`);
};

exports.eliminarVacante = async (req, res) => {
    // Obtener id de la vacante y buscar en la bd
    const { id } = req.params
    const vacante = await Vacante.findById(id);

    // Validar que el usuario autenticado es dueño de la vacante
    if (vacante.autor.equals(req.user._id)) {
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        res.status(403).send('Error al intentar eliminar');
    };
};

exports.subirCV = (req, res, next) => {
    const configuracionMulter = {
        limits: { fileSize: 100000 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '../../public/uploads/cv')
            },
            filename: (req, file, cb) => {
                const extension = file.mimetype.split('/')[1];
                cb(null, `${shortid.generate()}.${extension}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Formato no válido'), false);
            };
        }
    };

    const upload = multer(configuracionMulter).single('cv');

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
            return res.redirect('back');
        } else {
            FILENAME = req.file.filename;
            return next();
        }
    });
};

exports.contactar = async (req, res, next) => {
    // Obtener vacante
    const { url } = req.params;
    const vacante = await Vacante.findOne({ url });
    if (!vacante) return next();

    // Crear objeto con información del nuevo candidato
    const { nombre, email } = req.body
    const nuevoCandidato = {
        nombre,
        email,
        cv: FILENAME
    };

    // Almacenar candidato y guardar en la BD
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // Mensaje y redirección
    FILENAME = null;
    req.flash('correcto', 'Tu información ha sido enviada correctamente');
    res.redirect('/');
};

exports.mostrarCandidatos = async (req, res, next) => {
    // Obtener vacante
    const { id } = req.params;
    const vacante = await Vacante.findById(id).lean();
    if (!vacante) return next();

    // Validar Autor
    if (vacante.autor != req.user._id.toString()) return next();

    // Renderizar
    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    });
};

exports.buscarVacante = async (req, res) => {
    // Buscar Vacantes
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean();

    // Rnederizar
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    });
};