import express from "express";
import checkUserRole from "../middlewares/rolecheck.js";

import ViewsController from "../controllers/view.controller.js";
const viewsController = new ViewsController();

import ProductosModel from "../models/productos.model.js";
import CarritosModel from "../models/carritos.model.js";
import bodyParser from "body-parser";
import multer from "multer";
import CustomError from "../services/errors/CustomError.js";
import generateErrorInfo from "../services/errors/info.js";
import EErrors from "../services/errors/info.js";
import cartCountMiddleware from "../middlewares/cartCount.js";

const router = express.Router();

// Configuro middleware para actualizar el header
router.use(cartCountMiddleware);


// Función para generar el nuevo nombre del archivo
// Tomo la extensión original, pero cambio el nombre utilizando el código del producto para identificar el archivo
function generateFileName(req, file, callback) {
    const articleCode = req.body.code; 
    const originalFileName = file.originalname;
    const extension = originalFileName.split('.').pop();
    const newFileName = `${articleCode}.${extension}`;
    callback(null, newFileName);
}

// Configuro multer para subir los thumbnails
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/img");        //Carpeta donde se guardan las imagenes
    },
    filename: generateFileName // Usar la función generateFileName para definir el nombre del archivo
})

// Middlewares
router.use(express.json());
router.use(express.urlencoded({extended:true}));
router.use(bodyParser.urlencoded({ extended: true }));


////////////
// RUTAS:
router.get("/", viewsController.renderProducts);
router.get("/carts/:cid?", checkUserRole(['user','premium']), viewsController.renderCart);
router.get("/realtimeproducts", checkUserRole(['admin','premium']), viewsController.renderRealTimeProducts);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/newproduct", checkUserRole(['admin','premium']), viewsController.renderProductForm);
router.get("/editproduct/:pid?", checkUserRole(['admin','premium']), viewsController.renderProductForm);
router.get("/accessdenied", viewsController.renderAccessDenied);
router.get("/mockingproducts", viewsController.mockingProducts);
router.get("/users", checkUserRole(['admin']),viewsController.renderUsers);
router.get("/edituser/:uid",viewsController.editUser);
router.post("/saveproduct/:pid", multer({storage}).single("image"), viewsController.saveProduct);


// Ruta para testear el logger Desafio 9
router.get("/loggertest", (req, res) => {
    req.logger.http("Mensaje HTTP");
    req.logger.info("Mensaje INFO");
    req.logger.warning("Mensaje WARN");
    req.logger.error("Mensaje ERROR");
    res.send("Logs Generados")

})


// Tercer integradora:
router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderCambioPassword);
router.get("/confirmacion-envio", viewsController.renderConfirmacion);


// Exporto
export default router;

