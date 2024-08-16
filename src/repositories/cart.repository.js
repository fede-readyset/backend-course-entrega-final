import CarritosModel from "../models/carritos.model.js";

class CartRepository {
    async findAll() {
        return await CarritosModel.find().populate("products.product");
    }

    async findById(id) {
        try {
            
            const carrito = await CarritosModel.findById(id).populate("products.product").lean();

            if (!carrito) {
                // Lanza un error con un tipo específico o un mensaje que puedes identificar
                const error = new Error(`Carrito no encontrado.`);
                error.statusCode = 404;  // Añade un código de estado específico
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