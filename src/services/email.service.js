import nodemailer from "nodemailer";
import configObject from "../config/config.js";

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: 'torres.federico@gmail.com',
                pass: configObject.gmail_app_passwd
            }
        })
    }


    async sendPurchaseEmail (emailData) {
        try {

            let productsTable = `
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
            `;


            console.log(emailData.products)

            // Recorrer los productos para agregarlos a la tabla
            emailData.products.forEach(product => {

                productsTable += `
                    <tr>
                        <td>${product.product.description}</td>
                        <td>${product.qty}</td>
                        <td>€ ${product.unitPrice.toFixed(2)}</td>
                        <td>€ ${(product.qty * product.unitPrice).toFixed(2)}</td>

                    </tr>
                `;
            });

            productsTable += `
                        <tr>
                            <td colspan=3>Total de la Compra</td>
                            <td> € ${emailData.ammount}</td>
                        </tr>
                    </tbody>
                </table>
            `;



            const mailOptions = {
                from: "CoderMart <torres.federico@gmail.com>",
                to: emailData.purchaser,
                subject: "CoderMart - Detalles de tu pedido",
                html:`
                    <h1>CoderMart - Confirmación de compra </h1>
                    <p>Gracias por tu compra ${emailData.purchaser} </p>
                    <p>El número de tu orden es: ${emailData.code} </p>
                    <p>Detalle de tu compra: </p>
                    ${productsTable}
                `
            }

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("Error al enviar el mail de confirmación de compra");
        }
    }

    async sendResetEmail (email, first_name, token) {
        try {

            const mailOptions = {
                from: "CoderMart <torres.federico@gmail.com>",
                to: email,
                subject: "Restablecimiento de contraseña",
                html:`
                    <h1>Restablecimiento de contraseña </h1>
                    <p>Hola ${first_name}! </p>
                    <p>Pediste restablecer la contraseña,
                    te enviamos el token para que restablezcas tu password 
                    <strong>${token}</strong> </p>
                    <p> Este código expira en 1 hora.</p>
                    <a href="${configObject.base_url}/password"> Restablecer contraseña</a>
                `
            }

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("Error al enviar el mail de recuperación de password");
        }
    }

    async sendNotificationToUser (email, message) {
        try {

            const mailOptions = {
                from: "CoderMart <torres.federico@gmail.com>",
                to: email,
                subject: "Notificación de CoderMart",
                html:`
                    <h1>Notificación de CoderMart: </h1>
                    <p>${message}</p>
                `
            }

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("Error al enviar el mail de notificación");
        }
    }
}

export default EmailManager;