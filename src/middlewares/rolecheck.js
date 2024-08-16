const checkUserRole = (allowedRoles) => (req,res,next) => {
    if (!req.session || !req.session.user) {
        req.session.error="Acceso denegado. Sesión no activa"
        return res.redirect('/login');
    }
    
    const userRole = req.session.user.role;

    if (userRole) {
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            req.session.error="Acceso denegado. Sesión no activa"
            return res.redirect('/accessdenied');
        }
    } else {
        req.session.error="Acceso denegado. Sesión no activa"
        return res.redirect('/accessdenied');
    }
}

export default checkUserRole;