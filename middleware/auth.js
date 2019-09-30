const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    // Get Token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token){
        return res.status(401).json({
           msg : 'No Token authorization denied' 
        });
    }
    // if there is a token, verify it
    try{
        const decode = jwt.verify(token, config.get('jwtSecret'));
        req.user = decode.user;
        next();
    }
    // if incorrect token
    catch(err){
        return res.status(401).json({
            msg : 'token isn\'t valide'
        });
    }
}