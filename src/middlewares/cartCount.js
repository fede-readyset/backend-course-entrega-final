import CartService from '../services/cart.service.js';
const cartService = new CartService();

export default async function cartCountMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        const cartCount = await cartService.countProducts(req.session.user.cart);
        req.session.cartCount = cartCount;
    } else {
        req.session.cartCount = 0;
    }
    next();
}