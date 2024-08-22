import express from "express";
import checkUserRole from "../middlewares/rolecheck.js";

import ViewsController from "../controllers/view.controller.js";
const viewsController = new ViewsController();

import ProductosModel from "../models/productos.model.js";
import CarritosModel from "../models/carritos.model.js";
import bodyParser from "body-parser";
//import multer from "multer";
import CustomError from "../services/errors/CustomError.js";
import generateErrorInfo from "../services/errors/info.js";
import EErrors from "../services/errors/info.js";
import cartCountMiddleware from "../middlewares/cartCount.js";

const router = express.Router();

// Configuro middleware para actualizar el header
router.use(cartCountMiddleware);



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
router.get("/sales", checkUserRole(['admin']),viewsController.renderSales);

// Tercer integradora:
router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderCambioPassword);
router.get("/confirmacion-envio", viewsController.renderConfirmacion);

// Ruta para testear el logger Desafio 9
router.get("/loggertest", (req, res) => {
    req.logger.http("Mensaje HTTP");
    req.logger.info("Mensaje INFO");
    req.logger.warning("Mensaje WARN");
    req.logger.error("Mensaje ERROR");
    res.send("Logs Generados")
})

// Exporto
export default router;

