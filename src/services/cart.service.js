import CartRepository from "../repositories/cart.repository.js";
import ProductRepository from "../repositories/product.repository.js";
import TicketsModel from "../models/tickets.model.js";
import CarritosModel from "../models/carritos.model.js";
import { logger } from '../middlewares/errors/index.js';
import EmailManager from "./email.service.js";
const emailManager = new EmailManager();


export class CartService {
    constructor() {
        this.cartRepository = new CartRepository();
        this.productRepository = new ProductRepository();
    }

    async getCarts(limit) {
        const carts = await this.cartRepository.findAll();
        return limit ? carts.slice(0, limit) : carts;
    }

    async getCartById(id) {
        return await this.cartRepository.findById(id);
    }

    // async createCart(products) {
    async createCart() {
        const newCart = new CarritosModel();
        return await this.cartRepository.save(newCart);
    }

    async addProductToCart(cartId, productId, buyerEmail) {

        // Me traigo el carrito buscado del repository
        const cart = await CarritosModel.findById(cartId);
        if (!cart) throw new Error("Carrito inexistente");

        // Me traigo el producto buscado del repository
        const product = await this.productRepository.findById(productId);
        if (!product) throw new Error("Producto inexistente");
        
        // Validación extra para que productos propios no se agreguen al carrito
        if(product.owner===buyerEmail) throw new Error("No se puede agregar al carrito productos propios")

        // Busco si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(p => String(p.product) === productId);

        // Defino la cantidad final (si ya está sumo 1 a la qty, si no está lo agrego)
        let qty = 1;
        if (productIndex !== -1) {
            qty = cart.products[productIndex].qty += qty;
        } else {
            cart.products.push({ product, qty });
        }

        cart.markModified('products');

        return await cart.save();
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await CarritosModel.findById(cartId);
        if (!cart) throw new Error("Carrito inexistente");

        const productIndex = cart.products.findIndex(p => String(p.product) === productId);
        if (productIndex !== -1) {
            cart.products.splice(productIndex, 1);
        } else {
            throw new Error("Producto inexistente en el carrito");
        }

        cart.markModified('products');
        return await this.cartRepository.save(cart);
    }

    async emptyCart(cartId) {
        // Busca el carrito por ID para verificar si existe
        const cart = await CarritosModel.findById(cartId);
        if (!cart) throw new Error("Carrito inexistente");
    
        // Vacía los productos del carrito
        return await this.cartRepository.updateById(cartId, { $set: { products: [] } });
    }

    async changeProducts(cartId, updatedProducts) {
        const cart = await this.cartRepository.findById(cartId);
        if (!cart) throw new Error("Carrito inexistente");


        // Itero sobre los productos que se desean actualizar
        for (const updatedProduct of updatedProducts) {
            // Busco el producto en el carrito
            const cartProduct = cart.products.find(p => p.product._id.toString() === updatedProduct.product._id);

            if (cartProduct) {
                // Actualizo la cantidad si el producto está en el carrito
                cartProduct.qty = updatedProduct.qty;
            } else {
                // Devuelvo un error si el producto no está en el carrito
                throw new Error(`Producto ${updatedProduct.product._id} no encontrado en el carrito.`);
            }
        }

        return await this.cartRepository.save(cart);
    }


    async calculateTotal(id) {
        try {
            const carrito = await CarritosModel.findById(id).populate("products.product").lean();

            let total = 0;
            carrito.products.forEach(product => {
                total += product.qty * product.product.price
            })
            return total.toFixed(2);

        } catch (error) {
            throw new Error(error)
        }
    }

    async countProducts(cartId) {
        try {
            const cart = await this.cartRepository.findById(cartId);
            if (!cart) throw new Error("Carrito inexistente");
            let qty=cart.products.reduce((total,product) => total+product.qty,0);
            return qty;
        } catch (error) {
            return 0;
        }
        
    }

    async confirmPurchase(cartId, purchaser) {
        // Verifico que exista el carrito y devuelvo error si no existe
        const cart = await this.cartRepository.findById(cartId);
        if (!cart) throw new Error("Carrito inexistente");

        const availableProducts = [], unavailableProducts = [];
        let ammount = 0;

        // Validar stock de los items del carrito
        cart.products.forEach(producto => {
            if (producto.qty <= producto.product.stock) {
                producto.unitPrice = producto.product.price;
                availableProducts.push(producto);
                ammount += producto.qty * producto.product.price;
            } else {
                unavailableProducts.push(producto);
            }
        })


        // Si hay al menos un producto disponible para la compra, creo un ticket nuevo usando el modelo y completo los datos
        if (availableProducts.length > 0) {

            const ticket = new TicketsModel();
            ticket.products = availableProducts;
            ticket.ammount = ammount;
            ticket.purchase_datetime = Date.now();
            ticket.purchaser = purchaser;
            ticket.code = Math.random().toString(36).slice(2, 12); // genero un random


            // Guardo el ticket
            const result = await ticket.save();
            if (result) {
                // Actualizo el carrito dejando sólo los productos sin stock
                await this.cartRepository.updateById(cartId, { $set: { products: unavailableProducts } });

                const emailData={
                    purchaser: ticket.purchaser,
                    ammount: ticket.ammount,
                    code: ticket.code,
                    products: availableProducts,
                }
                
                // Actualizo stock del inventario         
                availableProducts.forEach(async producto => {
                    producto.product.stock -= producto.qty;
                    await this.productRepository.updateById(producto.product._id,  producto.product );
                })

                // Intento enviar el email de confirmación de la compra
                try {
                    await emailManager.sendPurchaseEmail(emailData);
                } catch (error) {
                    logger.error("Error al enviar el email de confirmación de compra: ",error)
                }


                return { result };
            } else {
                throw new Error("No se pudo generar el ticket de compra. Error interno.")
            }
        }

    }
}

export default CartService;