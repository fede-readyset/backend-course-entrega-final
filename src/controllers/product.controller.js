import ProductService from "../services/product.service.js";

class ProductController {
    constructor() {
        this.productService = new ProductService();

        // Binding methods to the current instance to preserve 'this' context (Esta sección fue agregada por recomendación de ChatGPT:)
        this.getProducts = this.getProducts.bind(this);
        this.getProductById = this.getProductById.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
    }

    async getProducts(req, res) {
        try {
            const products = await this.productService.getProducts(req.query);

            if (products.docs.length > 0) {
                products.prevLink = products.hasPrevPage ? `/api/products/?limit=${products.limit}&page=${products.prevPage}` : null;
                products.nextLink = products.hasNextPage ? `/api/products/?limit=${products.limit}&page=${products.nextPage}` : null;

                res.json({
                    success: true,
                    message: "Listado de productos:",
                    payload: products
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "No hay productos para mostrar"
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Fallo al obtener listado de productos",
                error: error.message
            });
            req.logger.error("Fallo al obtener listado de producto");

        }
    }

    async getProductById(req, res) {
        try {
            const product = await this.productService.getProductById(req.params.pid);
            if (product) {
                res.json({
                    success: true,
                    message: "Producto encontrado con éxito",
                    payload: product
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Producto no encontrado"
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Fallo al obtener producto",
                error: error.message
            });
            req.logger.error("Fallo al obtener producto");

        }
    }

    async addProduct(req, res) {
        try {
            const newProduct = await this.productService.addProduct(req.body);
            res.json({
                success: true,
                message: "Producto agregado con éxito",
                id: newProduct._id
            });

            if (req.io) {
                req.io.emit("UpdateNeeded", true);
            } else {
                req.logger.error("Socket.IO no está definido en req")
            }
        } catch (error) {
            if (error.name ==='ValidationError') {
                res.status(400).json({
                    success: false,
                    message: "Error de validación: " + error.message
                });
            } else {
                req.logger.error("Fallo al agregar producto");
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Fallo al agregar producto",
                        error: error.message
                    });
                }
            }
        }

    }

    async updateProduct(req, res) {
        try {
            const updatedProduct = await this.productService.updateProduct(req.params.pid, req.body);
            if (updatedProduct) {
                res.json({
                    success: true,
                    message: "Producto actualizado con éxito",
                    id: req.params.pid
                });
                try {
                    req.io.emit("UpdateNeeded", true);
                } catch (emitError) {
                    req.logger.error("Error emitting update event", emitError);
                }
            } else {
                res.status(404).json({
                    success: false,
                    message: "No se encontró el producto a actualizar"
                });
            }
        } catch (error) {
            req.logger.error("Fallo al actualizar producto");
            if (!res.headersSent) {

                res.status(500).json({
                    success: false,
                    message: "Fallo al actualizar producto",
                    error: error.message
                });
            }
        }
    }

    async deleteProduct(req, res) {
        try {
            const deletedProduct = await this.productService.deleteProduct(req.params.pid);
            if (deletedProduct) {
                res.status(200).json({
                    success: true,
                    message: "Producto eliminado con éxito",
                    id: req.params.pid
                });
                //req.io.emit("UpdateNeeded", true);
            } else {
                res.status(404).json({
                    success: false,
                    message: "Producto no encontrado"
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Fallo al eliminar producto",
                error: error.message
            });
            req.logger.error("Fallo al eliminar producto");

        }
    }


}

export default ProductController;
