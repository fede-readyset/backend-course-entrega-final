import passport from "passport";
import { isValidPassword } from "../utils/hashbcrypt.js";
import { createHash } from "../utils/hashbcrypt.js";
import multer from "multer";


// Tercer practica integradora
import EmailManager from "../services/email.service.js";
import UsuarioModel from "../models/usuario.model.js";
import CartModel from "../models/carritos.model.js";
import generateResetToken from "../utils/tokenreset.js";
const emailManager = new EmailManager();

import UserService from "../services/user.service.js";
const userService = new UserService();

class UserController {
    async profile(req, res) {
        if (!req.session.login) {
            return res.redirect("/login");
        } else {
            return res.render("profile", { session: req.session });
        }
    }
    async registerUser(req, res) {
        try {
            const { first_name, last_name, email, password, age, role, cart, avatar_url } = req.body;
            //const isAdmin = req.body.isAdmin || false;

            // Solo verificar si el usuario ya existe si es un registro de admin
            //if (isAdmin) {
                const existingUser = await UsuarioModel.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ success: false, message: "El usuario ya existe." });
                }

                // Hashear la contraseña
                const hashedPassword = await createHash(password);

                // Crear un nuevo usuario
                const newUser = new UsuarioModel({
                    first_name,
                    last_name,
                    email,
                    password: hashedPassword,
                    age,
                    role,
                    cart,
                    avatar_url
                });

                // Guardar el usuario en la base de datos
                await newUser.save();

                // Responder con éxito sin iniciar sesión (para admin)
                return res.status(201).json({ success: true, message: "Usuario creado con éxito.", payload: newUser });
            //}

            // Si no es admin, se asume que passport ya manejó la creación del usuario
            return res.status(201).json({ success: true, message: "Usuario registrado y logueado con éxito.", payload: req.session.user });

        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor." });
        }
    }


    failedRegister(req, res) {
        res.send("Registro fallido");
        req.logger.error("Registro fallido")
    }


    async login(req, res, next) {
        passport.authenticate("login", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).json({ success: false, message: "Credenciales inválidas" });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }

                try {
                    const userFound = await UsuarioModel.findById(user._id);
                    if (userFound) {
                        userFound.last_connection = new Date();
                        await userFound.save();
                    }
                    req.session.user = {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        age: user.age,
                        role: user.role,
                        cart: user.cart,
                        avatar_url: user.avatar_url,
                        _id: user._id,
                        last_connection: userFound.last_connection
                    };
                    req.session.login = true;

                } catch (error) {
                    return res.status(500).json({ success: false, message: "Error actualizando la última conexión" });
                }

                return res.status(200).json({
                    success: true,
                    message: "Login exitoso",
                    redirectUrl: "/api/users/profile"
                });
            });
        })(req, res, next);
    }

    async loginWithGitHub(req, res, next) {

        passport.authenticate("github", { scope: ["user:email"] }, async (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).json({ success: false, message: "No se pudo autenticar con GitHub" });
            }

            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }

                // Actualizar la última conexión del usuario
                try {
                    const usuarioEncontrado = await UsuarioModel.findById(user._id);
                    if (usuarioEncontrado) {
                        usuarioEncontrado.last_connection = new Date();
                        await usuarioEncontrado.save();
                    }
                } catch (error) {
                    return res.status(500).json({ success: false, message: "Error actualizando la última conexión" });
                }


                req.session.login = true;
                return res.status(200).json({
                    success: true,
                    message: "Autenticación con GitHub exitosa",
                    redirectUrl: "/api/users/profile"
                });
            });
        })(req, res, next);
    }



    // Tercer integradora:

    async requestPasswordReset(req, res) {
        const { email } = req.body;

        try {
            // Busco al usuario por email
            const user = await UsuarioModel.findOne({ email });
            if (!user) {
                // Si no hay usuario tiro error y termina
                return res.status(404).send("Usuario no encontrado");
            }

            // Si hay usuario genero un token
            const token = generateResetToken();

            // Le agrego el token al usuario
            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000) // 1 hora
            }
            await user.save();

            // Mando el email
            await emailManager.sendResetEmail(email, user.first_name, token);

            // Redirect a confirmación
            res.redirect("/confirmacion-envio");

        } catch (error) {
            res.status(500).send("Error interno del servidor")
        }
    }


    async resetPassword(req, res) {
        const { email, password, token } = req.body;

        try {
            // Busco al usuario por email
            const user = await UsuarioModel.findOne({ email });
            if (!user) {
                // Si no hay usuario tiro error y termina
                return res.render("changepass", { error: "Usuario no encontrado" });
            }

            // Verifico si hay token y si es correcto
            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token != token) {
                return res.render("resetpass", { error: "Token incorrecto" });
            }

            // Verifico que el token no haya expirado
            const now = new Date();
            if (now > resetToken.expire) {
                return res.render("resetpass", { error: "El token ya no es válido" })
            }

            // Verifico que la contraseña nueva no sea igual a la anterior
            if (isValidPassword(password, user)) {
                return res.render("changepass", { error: "La nueva contraseña no puede ser igual a la anterior" });
            }

            // Actualizo contraseña
            user.password = createHash(password);

            // Marco el token como usado
            user.resetToken = undefined;

            // Guardo los cambios
            await user.save();

            // Redirijo al login
            return res.redirect("/login");

        } catch (error) {
            res.status(500).render("resetpass", { error: `Error interno del servidor: ${error}` });
        }
    }


    // Cambiar rol del usuario
    async changePremiumRole(req, res) {
        const { uid } = req.params;
        try {
            // Busco el usuario
            const user = await UsuarioModel.findById(uid);
            if (!user) {
                return res.status(404).json({ success: "false", message: "Usuario no encontrado" });
            }

            let nuevoRol;

            switch (user.role) {
                case "user":
                    // Verifico que el usuario tenga la documentación requerida para ser premium:
                    const requestedDocuments = ["Identificacion", "Comprobante de Domicilio", "Comprobante de estado de cuenta"];
                    const userDocuments = user.documents.map(doc => doc.name);

                    const tieneDocumentacion = requestedDocuments.every(doc => userDocuments.includes(doc));
                    if (!tieneDocumentacion) {
                        return res.status(400).json({ success: "false", message: "El usuario no cumple los requisitos para ser 'Premium'. Revisar la documentación requerida.", reqDoc: requestedDocuments });
                    }
                    nuevoRol = "premium";
                    break;
                case "premium":
                    nuevoRol = "user";
                    break;
                case "admin":
                    return res.status(400).json({ success: "false", message: "No se puede cambiar de rol a un usuario 'Admin'." })
            }

            const actualizado = await UsuarioModel.findByIdAndUpdate(uid, { role: nuevoRol });
            res.status(200).json({ success: "true", message: `Rol cambiado con éxito a ${nuevoRol}`, payload: actualizado });

        } catch (error) {
            res.status(500).json({ success: "false", message: "Error en el servidor", error: error });
        }
    }


    // Desafio Complementario 3
    async uploadDocuments(req, res, next) {
        const { uid } = req.params;
        const uploadedDocuments = req.files;
        try {
            const user = await UsuarioModel.findById(uid);
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            // Procesar y actualizar documentos
            if (uploadedDocuments) {
                const documents = [];

                // Función para eliminar la extensión del nombre del archivo
                const removeFileExtension = (filename) => filename.replace(/\.[^/.]+$/, "");
                const cleanPath = path => path.replace(/^src\/public\//, '');


                if (uploadedDocuments.document) {
                    documents.push(...uploadedDocuments.document.map(doc => ({
                        name: removeFileExtension(doc.originalname),
                        reference: cleanPath(doc.path)
                    })));
                }

                if (uploadedDocuments.products) {
                    documents.push(...uploadedDocuments.products.map(doc => ({
                        name: removeFileExtension(doc.originalname),
                        reference: cleanPath(doc.path)
                    })));
                }

                if (uploadedDocuments.profile) {
                    documents.push(...uploadedDocuments.profile.map(doc => ({
                        name: removeFileExtension(doc.originalname),
                        reference: cleanPath(doc.path)
                    })));
                }

                user.documents = user.documents.concat(documents);
            }

            // Guardar cambios
            await user.save();

            res.status(200).send("Documentos cargados exitosamente");
        } catch (error) {
            console.log(error);
            res.status(500).send("Error interno del servidor, los mosquitos serán cada vez más grandes");
        }

    }

    async deleteUser(req, res) {
        const { uid } = req.params;
        try {
            // Busco el usuario para asegurarme de que existe antes de eliminarlo
            const user = await UsuarioModel.findById(uid);
            if (!user) {
                return res.status(404).json({ success: false, message: "Usuario no encontrado" });
            }

            // Eliminar el carrito asociado usando el ID almacenado en el usuario
            if (user.cart) {
                await CartModel.findByIdAndDelete(user.cart);
            }

            // Eliminar el usuario
            await UsuarioModel.findByIdAndDelete(uid);

            // Envía una respuesta exitosa
            return res.status(200).json({ success: true, message: "Usuario eliminado con éxito" });
        } catch (error) {
            // Manejo de errores en caso de fallos en el servidor o la base de datos
            return res.status(500).json({ success: false, message: "Error en el servidor al intentar eliminar al usuario", error: error.message });
        }
    }


    async deleteInactive(req, res) {
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - 2);

            // Encuentro los usuarios inactivos y guardo los IDs de sus carritos
            const inactiveUsers = await UsuarioModel.find({ last_connection: { $lt: dateThreshold } }, 'cart email');
            const cartIds = inactiveUsers.map(user => user.cart).filter(cart => cart != null);
            const emails = inactiveUsers.map(user => user.email);


            // Elimino los carritos asociados
            if (cartIds.length > 0) {
                await CartModel.deleteMany({
                    _id: { $in: cartIds }
                });
            }

            // Mando el email avisandole a cada user
            for (const email of emails) {
                await emailManager.sendNotificationToUser(email, `
                Tu usuario de CoderMart ${email}, fue eliminado por inactividad. <br>
                No te preocupes, puedes volver a registrarte cuando quieras!
                Te esperamos!  
                `);
            };
            

            const result = await UsuarioModel.deleteMany({
                last_connection: { $lt: dateThreshold }
            });
            
            if (result.deletedCount > 0) {
                res.status(200).json({ success: true, message: `Se eliminaron ${result.deletedCount} usuarios inactivos.` });
            } else {
                res.status(404).json({ success: false, message: 'No se encontraron usuarios inactivos para eliminar.' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error al eliminar usuarios inactivos.', error: error.message });
        }
    }

    // Listar usuarios
    async listUsers(req, res) {
        try {
            res.status(200).json(
                (await userService.getAllUsers()).map(user => {
                    const { age, cart, password, __v, resetToken, documents, last_connection, _id, ...safeUser } = user._doc || user.toObject();
                    return safeUser;
                })
            );
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error al listar usuarios', error: error.message })
        }

    }

    // Editar un usuario
    async editUser(req, res) {
        try {
            const { uid } = req.params;
            const updatedUser = await userService.updateUserById(uid,req.body);

            res.status(200).json({"success":true, "message": "Usuario modificado con exito", "payload": updatedUser});
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error al modificar usuario', error: error.message })

        }
    }


}

export default UserController;