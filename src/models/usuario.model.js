import mongoose from "mongoose";

const usuariosSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart"
    },
    role: {
        type: String,
        enum: ["admin", "premium", "user"],
        default: "user",
        required: false
    },
    avatar_url: String,
    resetToken: {
        token: String,
        expire: Date
    },
    documents: [{
        name: String,
        reference: String
    }],
    last_connection: {
        type: Date,
        default: Date.now
    }


})


const UsuarioModel = mongoose.model("usuarios", usuariosSchema);

export default UsuarioModel;