import mongoose from "mongoose";

const ticketsSchema = new mongoose.Schema({
    code: {
        type:String,
        unique:true,
        required:false
    },
    purchase_datetime: {
        type: Date,
        required: true
    }, 
    ammount: Number,
    purchaser: String,
    products: [{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product"
        },
        qty: Number,
        unitPrice: Number
    }]
})

const TicketsModel = mongoose.model("ticket", ticketsSchema);

export default TicketsModel;
