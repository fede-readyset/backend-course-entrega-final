import ProductosModel from "../models/productos.model.js";

 class ProductRepository {
    async find(filter, options) {
        return await ProductosModel.paginate(filter, options);
    }

    async findById(id) {
        return await ProductosModel.findById(id);
    }

    async save(product) {
        return await product.save();
    }

    async updateById(id, updateData) {
        return await ProductosModel.findByIdAndUpdate(id, updateData);
    }

    async deleteById(id) {
        return await ProductosModel.findByIdAndDelete(id);
    }
}

export default ProductRepository;