// Importar librerías
const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

// Importar Modelos
require('../models/Vacante');
require('../models/Usuario');

// Conectar a la BD
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

mongoose.connection.on('error', error => {
    console.log(error);
});