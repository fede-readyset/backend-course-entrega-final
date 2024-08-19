// Importo express
import express from "express";
const router = express.Router();

// Importo el Controller de Carritos
import { CartController }  from "../controllers/cart.controller.js";
const cartController = new CartController();

import checkUserRole from "../middlewares/rolecheck.js";


// Defino las rutas 
router.get("/", cartController.getCart);
router.get("/:cid", cartController.getCartById);
router.post("/:cid/product/:pid", checkUserRole(['user', 'premium']), cartController.addProductToCart);
router.delete("/:cid/product/:pid", checkUserRole(['user','premium']), cartController.removeProductFromCart);
router.delete("/:cid", cartController.emptyCart);
router.put("/:cid",cartController.changeProducts);
router.get("/:cid/purchase",cartController.confirmPurchase);
router.post("/", async (req, res) => {
    const result = await cartController.addCart();
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

// Exporto
export default router;



