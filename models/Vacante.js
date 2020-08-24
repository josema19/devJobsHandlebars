// Importar librería
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const VacanteSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        required: 'La ubicación es obligatoria',
        trim: true
    },
    salario: {
        type: Number,
        default: 0
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true,
        trim: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuario',
        required: 'El autor es obligatorio'
    }
});

// Crear Índice
VacanteSchema.index({ titulo: 'text' });

module.exports = mongoose.model('Vacante', VacanteSchema);