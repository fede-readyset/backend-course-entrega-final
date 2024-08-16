// Importo librerías 
import express from "express";
import exphbs from "express-handlebars";
import Handlebars from 'handlebars';
import MongoStore from "connect-mongo";
import session from "express-session";
// import cookieParser from 'cookie-parser';
import configObject from "./config/config.js";


// Importo conexión con database
import "./database.js";

// Importo passport e inicializo las estrategias
import passport from "passport";
import initializePassport from "./config/passport.config.js";

// Importo manejador de errores:
import errorHandler from "./middlewares/errors/index.js";

// Importo logger:
import addLogger from "./utils/logger.js";

// Importo Swagger para documentación:
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from "swagger-ui-express";
import specs from "./config/swagger.config.js";


// Defino variables e instancio clases
const PUERTO = configObject.port;
const app = express();



// Importo las rutas
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import viewsRouter from "./routes/views.routes.js";
import chatRouter from "./routes/chat.routes.js";
import usersRouter from "./routes/user.routes.js";
import sessionsRouter from "./routes/session.routes.js";


// Configuro Middlewares
import auth from "./middlewares/auth.js";
app.use("/", auth);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: configObject.mongo_url,
        ttl: 3600
    })
}))
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler);
app.use(addLogger);

// Registro el helper `eq`
Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});
// Helper or: para evaluar si al menos una de las dos condiciones es verdadera
Handlebars.registerHelper('or', function (a, b) {
    return a || b;
});

// Helper and: para evaluar si al menos una de las dos condiciones es verdadera
Handlebars.registerHelper('and', function (a, b) {
    return a && b;
});


// Configuro express-handlebars
const hbs = exphbs.create({
    handlebars: Handlebars
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Configuro Rutas
app.use("/", viewsRouter);
app.use("/chat", chatRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));


app.use(errorHandler);

// Listener
const httpServer = app.listen(PUERTO, () => {

    console.log(`Escuchando en el http://localhost:${PUERTO}`);
});



// Inicializo el servicio de socket.io
import SocketService from "./services/socket.service.js";
const socketService = new SocketService(httpServer);

// Middleware para inyectar io en req
/* app.use((req, res, next) => {
    req.io = io;
    next();
}); */


