export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next(); 
    }
    res.status(401).json({ message: 'No autorizado. Debes iniciar sesión.' });
};