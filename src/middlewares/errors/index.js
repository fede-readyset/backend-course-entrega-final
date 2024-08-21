import EErrors from "../../services/errors/info.js";
import winston from "winston";

// Config de Winston para loggear errores
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({filename:'errors.log'})
    ]
})

export {logger};

export default (error, req, res, next) => {
    logger.error(error);

    let statusCode;
    let errorMessage;

    switch (error.code) {
        case EErrors.INVALID_TYPES_ERROR:
            statusCode = 400;
            errorMessage = error.name || "Invalid data type provided";
            break;
        case EErrors.MISSING_DATA_ERROR:
            statusCode = 400;
            errorMessage = error.message || "Missing required data";
            break;
        case EErrors.AUTHENTICATION_ERROR:
            statusCode = 401;
            errorMessage = error.message || "Authentication failed";
            break;
        default:
            statusCode = 500;
            errorMessage = "Unhandled error";
    }

    res.status(statusCode).send({
        status:"error",
        error: errorMessage,
        details: error.cause || null
    });
};