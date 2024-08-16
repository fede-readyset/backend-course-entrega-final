import passport from "passport";
import { isValidPassword } from "../utils/hashbcrypt.js";
import { createHash } from "../utils/hashbcrypt.js";
import multer from "multer";


// Tercer practica integradora
import EmailManager from "../services/email.js";
import UsuarioModel from "../models/usuario.model.js";
import generateResetToken from "../utils/tokenreset.js";
const emailManager = new EmailManager();


class UserController {
    async profile(req, res) {
        if (!req.session.login) {
            return res.redirect("login");
        } else {
            
            return res.render("profile", { session:req.session });
        }
    }

    async register(req, res) {

        passport.authenticate("register", { failureRedirect: "/failedregister" }, async (err, user, info) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            if (!user) {
                return res.status(400).send("Credenciales inválidas");
            }
            req.logIn(user, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                req.session.user = {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    role: user.role,
                    cart: user.cart,
                    avatar_url: user.avatar_url
                };
                req.session.login = true;
                res.status(200).json({success:true,message:"Usuario generado con éxito", payload:req.session.user});
                //res.send("<p>Usuario creado con éxito. Redireccionando...</p>         <meta http-equiv='refresh' content='2;url=/profile'>");

            })
        });
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
                    const usuarioEncontrado = await UsuarioModel.findById(user._id); // Asegúrate de que la propiedad sea _id
                    if (usuarioEncontrado) {
                        usuarioEncontrado.last_connection = new Date();
                        await usuarioEncontrado.save();
                    }
                } catch (error) {
                    return res.status(500).json({ success: false, message: "Error actualizando la última conexión" });
                }


                req.session.user = {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    role: user.role,
                    cart: user.cart,
                    avatar_url: user.avatar_url
                };
                req.session.login = true;


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
                return res.status(404).send("Usuario no encontrado");
            }


            let nuevoRol;

            switch (user.role) {
                case "user":
                    // Verifico que el usuario tenga la documentación requerida para ser premium:
                    const requestedDocuments = ["Identificacion", "Comprobante de Domicilio", "Comprobante de estado de cuenta"];
                    const userDocuments = user.documents.map(doc => doc.name);

                    const tieneDocumentacion = requestedDocuments.every(doc => userDocuments.includes(doc));
                    if (!tieneDocumentacion) {
                        return res.status(400).json({success:"false",message:"El usuario no cumple los requisitos para ser 'Premium'. Revisar la documentación requerida.", reqDoc:requestedDocuments});
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
            res.json({success:"true",message:`Rol cambiado con éxito a ${nuevoRol}`,payload:actualizado});

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



}

export default UserController;