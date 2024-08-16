import express from "express";
import passport from "passport";
import { isValidPassword } from "../utils/hashbcrypt.js";

const router = express.Router();



router.get("/faillogin", async (req,res) =>{
    res.send("Fallo al autenticar!");
})


router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), async(req,res) =>{
    // La estrategia github retorna el usuario, lo agregamos a la sesión
    req.session.user = req.user;
    req.session.login = true;

    res.redirect("/api/users/profile");
})

// Logout:
router.get("/logout", (req,res) => {
    if(req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
});


// Current:
router.get("/current", (req,res) => {
    res.send(req.session.user);    
})


export default router;