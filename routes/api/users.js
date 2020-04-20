const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_SECRET;
const {check, validationResult }   = require('express-validator');

const  User = require('../../models/User');

// @route   GET api/users
// @desc    Get all profile
// @access  Private
router.get('/', auth, async(req, res)=> {
    try{
        const user = await User.find().populate('user', ['name', 'avatar'])
        return res.json(user);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/:user_id
// @desc    Get a user data
// @access  Private
router.get('/:user_id', auth, async(req, res) => {
    try{
        const user = await User.findById(req.params.user_id);
        if (!user){
            return res.status(400).json({msg : "There is no user "});
        }
        return res.status(200).json(user);
    }
    catch(err){
        console.log(err);
        if(err.kind = "ObjectId"){
            return res
                    .status(400)
                    .json({msg : 'There is no user'});
        }
        res.status(500).send('Server Error');
    }
})

// @route   POST api/users
// @desc    Create/Register user
// @access  Public
router.post('/',
    [
        check('username', 'username  is require').not().isEmpty(),
        check('email', 'Please include a valide email').isEmail(),
        check('password', 'Please enter a password with 8 or more than eight characters').isLength({min : 8})
    ],
    async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()){
            return res
                    .status(400)
                    .json({errors : errors.array()});
        }
        const {username, email, password} = req.body;
        console.log(username, email, password)
        try{
            // See if user exists
            let user = await User.findOne({email});
            if(user){
                return res
                        .status(400)
                        .json({errors : [{msg : 'User already exist'}]});
            }
            // Get users gravatar
            const avatar = gravatar.url(email, {
                // s = size
                s : '200',
                // r = pg -> rating (all public)
                r :  'pg',
                // d
                d : 'mm'
            });

            user = new User({
                username,
                email,
                password,
                avatar
            });

            // Encryt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            // Return jsonwebtoken
            const payload = {
                user : {
                    id : user.id
                }
            }

            jwt.sign(
                // payload
                payload,
                // secret
                JWT_TOKEN,
                // expire in
                {expiresIn : 36000},
                (err, token) => {
                    // error handle
                    if (err) throw err;
                    // send token
                    return res
                            .status(200)
                            .json({token});
                }
            )
        }
        catch(err){
            console.error(err);
            return res
                    .status(500)
                    .send('server error')
        }
    }
)

// @route   DELETE api/user/:user_id
// @desc    Delete a user with and id
// @access  Private
router.delete('/:user_id', auth, async(req, res) => {
    try{
        await User.findOneAndRemove({_id :req.params.user_id});
        res
            .status(200)
            .json({msg : "user deleted"});
    }
    catch(err){
        console.log(err);
        res
            .status(500)
            .send('Server Error');
    }
});

// @route   PUT api/user/:user_id
// @desc    Update a user data
// @access  Private
router.put('/:user_id', auth, async(req, res)=> {
    try{
        const query = req.body      // body from the form
        const userId = req.params.user_id; // id from the  url
        //  delete query['id'] if you send your user_id trought the form

        await User
                    .findByIdAndUpdate(userId, query, {new: true})  // Request 
                    .then(user => {
                        // if success
                        res
                            .status(200)
                            .json(user)
                    })
                    .catch(err => {
                        console.log(err);
                        res
                            .status(500)
                            .json({
                                msg: 'update faild'
                            })
                    })
    }
    catch(err){
        console.log(err);
        res
            .status(500)
            .send("Server Error");
    }
});

module.exports  = router;