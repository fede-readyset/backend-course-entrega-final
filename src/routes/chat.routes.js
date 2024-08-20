import express from "express";
const router = express.Router();

import checkUserRole from "../middlewares/rolecheck.js";


router.get ("/", checkUserRole(['user','premium']), (req,res) => {
    if(!req.session.login) return res.redirect("/login");

    const session = req.session;
    res.render("chat", {session});
});


// Exporto:
export default router;
