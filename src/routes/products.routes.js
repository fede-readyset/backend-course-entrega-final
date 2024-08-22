// Importo express
import express from "express";
const router = express.Router();

import multer from "multer";
//import { uploadProdFile } from "../middlewares/multer.js";


// Importo el Controller de Productos
import ProductController from "../controllers/product.controller.js";
const productController = new ProductController();

// Importo instancia de Multer para cargar las imagenes de los productos
import { uploadProdFile } from "../middlewares/multer.js";

// Defino las rutas
router.get("/", productController.getProducts);
router.get("/:pid",  productController.getProductById);
router.post("/", uploadProdFile.single("image"), productController.addProduct);
router.put("/:pid", uploadProdFile.single("image"), productController.updateProduct);
router.delete("/:pid", productController.deleteProduct);

// Exporto
export default router;