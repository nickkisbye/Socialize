module.exports = {
    authMiddleware: (req, res, next) => {
        if(!req.session.user) return res.redirect('/');
        next();
    },
    frontpageRedirect: (req, res, next) => {
        if(req.session.user) return res.redirect('/dashboard');
        next();
    }
}