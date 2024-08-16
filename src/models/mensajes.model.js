import mongoose from "mongoose";

const mensajesSchema = new mongoose.Schema({
    user: String,
    message: String
});



const MensajesModel = mongoose.model("messages", mensajesSchema);

export default MensajesModel;
