// Importar librerías
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const homeController = require('../controllers/homeController');
const vacanteController = require('../controllers/vacanteController');
const usuarioController = require('../controllers/usuarioController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/',
        homeController.mostrarTrabajos
    );

    // Crear Vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacanteController.formNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        [
            body('titulo', 'Agrega un título a la vacante').notEmpty().escape(),
            body('empresa', 'Agrega el nombre de la empresa').notEmpty().escape(),
            body('ubicacion', 'Agrega la ubicación de la vacante').notEmpty().escape(),
            body('salario').escape(),
            body('contrato', 'Selecciona el tipo de contrato').notEmpty().escape(),
            body('skills', 'Elige al menos una habilidad para esta vacante').notEmpty().escape(),
        ],
        vacanteController.agregarVacante
    );

    // Mostrar Vacante
    router.get('/vacantes/:url',
        vacanteController.mostrarVacante
    )

    // Editar Vacante
    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacanteController.formEditarVacante
    );
    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        [
            body('titulo', 'Agrega un título a la vacante').notEmpty().escape(),
            body('empresa', 'Agrega el nombre de la empresa').notEmpty().escape(),
            body('ubicacion', 'Agrega la ubicación de la vacante').notEmpty().escape(),
            body('salario').escape(),
            body('contrato', 'Selecciona el tipo de contrato').notEmpty().escape(),
            body('skills', 'Elige al menos una habilidad para esta vacante').notEmpty().escape(),
        ],
        vacanteController.editarVacante
    );

    // Eliminar Vacante
    router.delete('/vacantes/eliminar/:id',
        vacanteController.eliminarVacante
    );

    router.post('/vacantes/:url',
        vacanteController.subirCV,
        vacanteController.contactar
    );

    // Crear Cuentas
    router.get('/crear-cuenta',
        usuarioController.formCrearCuenta
    );
    router.post('/crear-cuenta',
        [
            body('nombre', 'El nombre es obligatorio').not().isEmpty().escape(),
            body('email', 'El email debe ser válido').isEmail().normalizeEmail(),
            body('password', 'El password no puede ser vacío').not().isEmpty().escape(),
            body('confirmar', 'Confirmar password no puede ser vacío').not().isEmpty().escape(),
            body('confirmar', 'Los passwords son diferentes').not().equals('password')
        ],
        usuarioController.crearUsuario
    );

    // Autenticar Usuarios
    router.get('/iniciar-sesion',
        usuarioController.formIniciarSesion
    );
    router.post('/iniciar-sesion',
        authController.autenticarUsuario
    );

    // Cerrar Sesíon
    router.get('/cerrar-sesion',
        authController.cerrarSesion
    );

    // Resetear Password (emails)
    router.get('/restablecer-password',
        authController.formRestablecerPassword
    );
    router.post('/restablecer-password',
        authController.enviarToken
    );

    // Resetear Password (Guardar BD)
    router.get('/restablecer-password/:token',
        authController.restablecerPassword
    );
    router.post('/restablecer-password/:token',
        authController.guardarPassword
    );

    // Panel de Administración
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuarioController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        // [
        //     body('nombre', 'El nombre es obligatorio').notEmpty().escape(),
        //     body('email', 'El email debe ser válido').isEmail().normalizeEmail(),
        //     body('password').escape(),
        // ],
        usuarioController.subirImagen,
        usuarioController.editarPerfil
    );

    // Candidatos por vacante
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacanteController.mostrarCandidatos
    );

    // Buscador de Vacantes
    router.post('/buscador',
        vacanteController.buscarVacante
    );

    return router;
};