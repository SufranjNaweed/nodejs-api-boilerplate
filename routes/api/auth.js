const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");

const User = require('../../models/User');

// @route   POST api/auth
// @desc    Authentificate user & generate token
// @access  Public
router.post('/',
    [
        check('email', 'Please include a valide email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res
                    .status(400)
                    .json({errors : errors.array()});
        }
        const {email, password} = req.body;
        try{
            // See if user exists
            let user = await User.findOne({email});
            
            if(!user){
                return res
                        .status(400)
                        .json({errors : [{msg : "Invalide credentials"}]});
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res
                        .status(400)
                        .json({errors : [{msg : 'Invalid credentials'}]});
            }
  
            // return jsonwebtoken
            const payload = {
                user : {
                    id : user.id
                }
            }
            jwt.sign(
                // payload
                payload,
                // secret
                config.get('jwtSecret'),
                // expire in
                {expiresIn : 36000},
                (err, token) => {
                    // error handle
                    if(err) throw err;
                    // send token
                    res.json({token :  token, user_id : user.id})
                }
            );
        }
        catch(err){
            console.error(err);
            return res
                    .status(500)
                    .send('server error');
        }
    }
);

module.exports  = router;