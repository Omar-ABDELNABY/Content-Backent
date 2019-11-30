module.exports = function(req, res, next){
    const user = req.user;
    if(user.isAdmin)
        return next();
    res.status(403).send('Access denied');
}