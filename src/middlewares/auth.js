import passport from "passport";


const auth = (req,res,next) => {
    passport.authenticate("github", {scope: ["user:email"]}) , async (req,res) =>{}
    
    next();
}

export default auth;