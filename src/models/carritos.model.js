import mongoose, { mongo } from "mongoose";

const carritosSchema = new mongoose.Schema({
    products: [{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product"
        },
        qty: Number
    }]
});

// Middleware PRE de MongoDB
// carritosSchema.pre("findOne",function(next) {
//     this.populate("products.product");
//     next();
// })


const CarritosModel = mongoose.model("carts", carritosSchema);

export default CarritosModel;
