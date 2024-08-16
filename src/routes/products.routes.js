// Importo express
import express from "express";
const router = express.Router();

// Importo el Controller de Productos
import ProductController from "../controllers/product.controller.js";
const productController = new ProductController();

// Defino las rutas
 
// Desafío 8
router.get("/", productController.getProducts);
router.post("/", productController.addProduct);
router.get("/:pid", productController.getProductById);
router.put("/:pid", productController.updateProduct);
router.delete("/:pid", productController.deleteProduct);

// Exporto
export default router;