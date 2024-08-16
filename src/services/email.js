import nodemailer from "nodemailer";

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: 'torres.federico@gmail.com',
                pass: 'bjglkdsinhhbdsgw' // PENDIENTE: agregar a .env
            }
        })
    }


    async sendPurchaseEmail (email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Coder Test <torres.federico@gmail.com>",
                to: email,
                subject: "Confirmación de tu compra",
                html:`
                    <h1>Confirmación de compra </h1>
                    <p>Gracias por tu compra, ${first_name} </p>
                    <p>Número de tu orden: ${ticket} </p>
                `
            }

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("Error al enviar el mail");
        }
    }

    async sendResetEmail (email, first_name, token) {
        try {
            const mailOptions = {
                from: "Coder Test <torres.federico@gmail.com>",
                to: email,
                subject: "Restablecimiento de contraseña",
                html:`
                    <h1>Restablecimiento de contraseña </h1>
                    <p>Hola ${first_name}! </p>
                    <p>Pediste restablecer la contraseña,
                    te enviamos el token para que restablezcas tu password 
                    <strong>${token}</strong> </p>
                    <p> Este código expira en 1 hora.</p>
                    <a href="http://localhost:8080/password"> Restablecer contraseña</a>
                `
            }

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("Error al enviar el mail");
        }
    }
}

export default EmailManager;