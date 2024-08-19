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




// VERSION PARA passport-local
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
    // res.send("<p>Usuario creado con éxito. Redireccionando...</p><meta http-equiv='refresh' content='2;url=/api/users/profile'>");
    res.status(200).json({success:true,message:"Usuario creado con éxito.",payload:req.session.user});
})




export default router;



