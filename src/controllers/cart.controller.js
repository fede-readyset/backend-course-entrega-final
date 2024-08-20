import { CartService } from "../services/cart.service.js";

export class CartController {
    constructor() {
        this.cartService = new CartService();

        // Binding methods to the current instance to preserve 'this' context (Esta sección fue agregada por recomendación de ChatGPT:)
        this.getCart = this.getCart.bind(this);
        this.getCartById = this.getCartById.bind(this);
        this.addCart = this.addCart.bind(this);
        this.addProductToCart = this.addProductToCart.bind(this);
        this.removeProductFromCart = this.removeProductFromCart.bind(this);
        this.changeProducts = this.changeProducts.bind(this);
        this.emptyCart = this.emptyCart.bind(this);
        this.confirmPurchase = this.confirmPurchase.bind(this);
    }

    async getCart(req, res) {
        const limit = req.query.limit;
        try {
            const carts = await this.cartService.getCarts(limit);
            res.status(200).json({
                success: true,
                message: "Listado de carritos:",
                payload: carts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Fallo al obtener listado de carritos",
                error: error.message
            });
            req.logger.error("Fallo al finalizar la compra. Error interno del servidor.");
        }
    }

    async getCartById(req, res) {
        const cid = req.params.cid;
        try {
            const cart = await this.cartService.getCartById(cid);
            res.status(200).json({
                success: true,
                message: "Carrito encontrado con éxito",
                payload: cart
            });
        } catch (error) {
            if (error.statusCode === 404) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                    payload: cid
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error del servidor al buscar carrito especificado",
                    error: error.message
                });
                req.logger.error("Error del servidor al buscar carrito especificado", error);
            }
        }
    }


    async addCart() {
        try {
            const cart = await this.cartService.createCart();
            return {
                success: true,
                message: "Carrito creado con éxito.",
                payload: cart
            };
        } catch (error) {
            console.error("Fallo al crear el carrito, error interno del servidor:", error.message);
            return {
                success: false,
                message: "Fallo al crear el carrito, error interno del servidor.",
                error: error.message
            };
        }
    }



    async addProductToCart(req, res) {
        const { cid, pid } = req.params;
        const buyerEmail = req.session.user.email;
        try {
            await this.cartService.addProductToCart(cid, pid, buyerEmail);
            res.status(200).json({
                success: true,
                message: "Producto añadido al carrito correctamente",
                cid: cid,
                pid: pid
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error del servidor. Fallo al agregar el producto al carrito",
                error: error.message
            });
            req.logger.error("Error del servidor. Fallo al agregar el producto al carrito");
        }
    }

    async removeProductFromCart(req, res) {
        const { cid, pid } = req.params;
        try {
            await this.cartService.removeProductFromCart(cid, pid);
            res.status(200).json({
                success: true,
                message: "Producto eliminado del carrito correctamente",
                cid: cid,
                pid: pid
            });
        } catch (error) {

            if (error.message === "Carrito inexistente" || error.message === "Producto inexistente en el carrito") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                    cid: cid,
                    pid: pid
                });
            } else {
                // Para otros errores, devuelve un estado 500
                res.status(500).json({
                    success: false,
                    message: "Fallo al eliminar el producto del carrito",
                    error: error.message
                });
                req.logger.error("Fallo al eliminar el producto del carrito", error);
            }
        }
    }

    async emptyCart(req, res) {
        const cid = req.params.cid;
        try {
            await this.cartService.emptyCart(cid);
            res.status(200).json({
                success: true,
                message: "Carrito vaciado correctamente",
                cid: cid
            });
        } catch (error) {
            if (error.message === "Carrito inexistente") {
                res.status(404).json({
                    success: false,
                    message: error.message,
                    cid: cid
                });
            } else {
                // Para otros errores, devuelve un estado 500
                res.status(500).json({
                    success: false,
                    message: "Error interno. Fallo al vaciar el carrito",
                    error: error.message
                });
                req.logger.error("Error interno. Fallo al vaciar el carrito", error);
            }
        }
    }

    async changeProducts(req, res) {
        const cid = req.params.cid;
        const newProducts = req.body;

        try {
            await this.cartService.changeProducts(cid, newProducts);
            res.status(200).json({
                success: true,
                message: "Carrito actualizado.",
                cid: cid
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Fallo al actualizar el carrito. Error interno del servidor.",
                error: error.message
            });
            req.logger.error("Error interno. Fallo al actualizar los productos en el carrito");
        }
    }



    async confirmPurchase(req, res) {
        const cid = req.params.cid;
        const purchaser = req.session.user.email;
        try {
            const result = await this.cartService.confirmPurchase(cid, purchaser);

            // Aviso que hubo cambios en el stock para RealTime Products
            req.io.emit("UpdateNeeded", true);
            
            // Respuesta OK
            res.status(200).json({
                success: true,
                message: "Ticket generado correctamente.",
                cid: cid,
                result: result
            });

        } catch (error) {
            // Logueo la falla
            req.logger.error("Fallo al finalizar la compra. Error interno del servidor.",error);
            
            // Devuelvo error interno
            res.status(500).json({
                success: false,
                message: "Fallo al finalizar la compra. Error interno del servidor.",
                error: error.message
            });

        }
    }
}
