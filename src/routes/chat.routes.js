import express from "express";
const router = express.Router();

import checkUserRole from "../middlewares/rolecheck.js";


router.get ("/", checkUserRole(['user']), (req,res) => {
    if(!req.session.login) return res.redirect("/login");
    const session = {
        loggedIn: req.session.login,
        user: req.session.user
    };
    res.render("chat", {session});
});


// Exporto:
export default router;
