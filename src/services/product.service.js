import ProductRepository from "../repositories/product.repository.js";
import ProductosModel from "../models/productos.model.js";


export default class ProductService {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    async getProducts(query) {
        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const filter = {};
        if (query.cat) filter.category = query.cat;
        if (query.stock) filter.stock = query.stock;

        let sort = "_id";
        if (query.sort === "asc") sort = "price";
        if (query.sort === "desc") sort = "-price";

        return await this.productRepository.find(filter, { limit, page, sort });
    }

    async getProductById(id) {
        return await this.productRepository.findById(id);
    }

    async addProduct(productData) {
        const newProduct = new ProductosModel(productData);
        return await this.productRepository.save(newProduct);
    }

    async updateProduct(id, updatedData) {
        return await this.productRepository.updateById(id, updatedData);
    }

    async deleteProduct(id) {
        return await this.productRepository.deleteById(id);
    }
}