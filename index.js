// Importar librerías
const express = require('express');
const router = require('./routes');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const coockieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('./config/passport');
const createError = require('http-errors');
require('./config/db');
require('dotenv').config({ path: 'variables.env' });

// Definir Servidor
const app = express();

// Habilitar BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Habilitar Handlebars
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

// Definir Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Guardar Sesión
app.use(coockieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ url: process.env.DATABASE })
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y Flash Message
app.use(flash());

// Añadir Middlewares
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
})

// Definir Rutas
app.use('/', router());

// Definir 404 errores
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'))
});

// Administrar errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

// Permitir asignación del puerto
const host = '0.0.0.0';
const port = process.env.PORT;

// Correr Servidor
app.listen(port, host, () => {
    console.log('El servidor está funcionando');
});