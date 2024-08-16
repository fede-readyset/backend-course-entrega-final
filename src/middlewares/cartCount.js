import CartService from '../services/cart.service.js';
const cartService = new CartService();

export default async function cartCountMiddleware(req, res, next) {
    try {
        if (req.session && req.session.user) {
            const cartCount = await cartService.countProducts(req.session.user.cart);
            req.session.cartCount = cartCount;
        } else {
            req.session.cartCount = 0;
        }
    } catch (error) {
        console.warn("Error contando los ítems en el carrito, no se pudo encontrar el carrito.",error);
        req.session.cartCount = 0;
    }
    next();
}
