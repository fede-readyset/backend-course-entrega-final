import { Server } from "socket.io";
import ProductosModel from "../models/productos.model.js";
import MensajesModel from "../models/mensajes.model.js";

class SocketService {
    constructor(httpServer) {
        this.io = new Server(httpServer);
        this.initializeSocketEvents();
    }

    initializeSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Nuevo usuario conectado");

            socket.on("Request", async () => {
                const products = await ProductosModel.find().lean();
                socket.emit("Productos", products);
            });


            socket.on("init", async (data) => {
                const messagesLogs = await MensajesModel.find().lean();
                this.io.emit("messagesLogs", messagesLogs);

            });

            socket.on("message", async (data) => {
                const newMessage = new MensajesModel({
                    user: data.user,
                    message: data.message
                });

                try {
                    await newMessage.save();
                    console.log("Mensaje de chat recibido");

                    const messagesLogs = await MensajesModel.find().lean();
                    this.io.emit("messagesLogs", messagesLogs);
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }

    
}

export default SocketService;
