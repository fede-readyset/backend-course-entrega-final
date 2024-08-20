import express from "express";
import passport from "passport";

import UserController from "../controllers/user.controller.js";
const userController = new UserController;
import checkUserRole from "../middlewares/rolecheck.js";


const router = express.Router();
import upload from "../middlewares/multer.js";

router.get("/", userController.listUsers);
router.get("/profile", userController.profile);
router.get("/failedregister", userController.failedRegister);
router.get("/github", userController.loginWithGitHub);
router.post("/login", userController.login);
router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.post("/:uid/documents", upload.fields([{ name: "document" }, { name: "products" }, { name: "profile" }]), userController.uploadDocuments);
router.put("/:uid", userController.editUser);
router.put("/premium/:uid", userController.changePremiumRole);router.delete('/delete-inactive',  userController.deleteInactive);
router.delete('/delete-inactive',  userController.deleteInactive);
router.delete('/:uid', checkUserRole(['admin']), userController.deleteUser);




// VERSION PARA register en passport-local
router.post("/", passport.authenticate("register", {
    failureRedirect: "/failedregister"
}), async (req, res) => {

    if (!req.user) {
        return res.status(400).send("Credenciales inválidas")
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role,
        cart: req.user.cart,
        avatar_url: req.user.avatar_url
    }
    req.session.login = true;

    res.status(200).json({success:true,message:"Usuario creado con éxito.",payload:req.session.user});
})

router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password, age, role, cart, avatar_url } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "El usuario ya existe." });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario
        const newUser = new User({
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

        // Responder con éxito sin iniciar sesión
        res.status(201).json({ success: true, message: "Usuario creado con éxito.", payload: newUser });

    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});


export default router;



