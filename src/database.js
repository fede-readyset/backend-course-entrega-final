import mongoose, { mongo } from "mongoose";
import configObject from "./config/config.js";


mongoose.connect(configObject.mongo_url)
    .then ( () => console.log("Conectado a MongoDB"))
    .catch ( (error) => console.log("Conexión fallida a MongoDB", error))

