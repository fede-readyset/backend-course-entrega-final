import winston from "winston";

// traemos del configObject: node_env
import configObject from "../config/config.js";

const niveles = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
}

// Logger para desarrollo:
const loggerDesarrollo = winston.createLogger({
    levels: niveles,
    transports: [
        new winston.transports.Console({
            level:"debug"
        })
    ]
})

// Logger para producción
const loggerProduccion = winston.createLogger({
    levels: niveles,
    transports: [
        new winston.transports.File({
            filename: "./errors.log",
            level: "error"
        })
    ]
})
// Determinar que logger usar según variable de entorno
const logger = configObject.node_env === "produccion" ? loggerProduccion : loggerDesarrollo;

// Creamos el middleware
const addLogger = (req,res,next) =>{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`)
    next();
}

export default addLogger;
