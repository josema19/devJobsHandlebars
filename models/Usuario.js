// Importar librería
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.Promise = global.Promise;

const UsuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

UsuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    };
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

UsuarioSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Ese correo ya está registrado');
    } else {
        next(error);
    };
})

UsuarioSchema.methods = {
    compararPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuario', UsuarioSchema);