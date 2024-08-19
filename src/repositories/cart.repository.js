import CarritosModel from "../models/carritos.model.js";

class CartRepository {
    async findAll() {
        return await CarritosModel.find().populate("products.product");
    }

    async findById(id) {
        try {
            
            const carrito = await CarritosModel.findById(id).populate("products.product");

            if (!carrito) {
                const error = new Error(`Carrito no encontrado.`);
                error.statusCode = 404;
                throw error;
            }
            return carrito;
        } catch (error) {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            throw error;
        }
    }


    async save(cart) {
        return await cart.save();
    }

    async updateById(id, updateData) {
        return await CarritosModel.updateOne({ _id: id }, updateData);
    }


}

export default CartRepository;