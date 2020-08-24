// Importar modelos
const Vacante = require('../models/Vacante');

// Exportar funciones
exports.mostrarTrabajos = async (req, res, next) => {
    // Obtener Vacantes
    const vacantes = await Vacante.find().lean();
    if (!vacantes) return next();

    // Renderizar
    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Publica Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    });
};