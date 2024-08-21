import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
ticketsSchema.plugin(mongoosePaginate);

const TicketsModel = mongoose.model("ticket", ticketsSchema);

export default TicketsModel;
