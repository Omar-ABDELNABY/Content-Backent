const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const logger = require('../logger/logger');

const User = require("../models/user");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);




function validateUser(user){
    const userJoiSchema ={
        _id: Joi.objectId().optional(),
        userName: Joi.string().min(3).max(10).required().regex(/[A-Za-z0-9_ ]*/),
        password: Joi.string().min(5).max(20).required(),
        isAdmin: Joi.boolean()
    };
    return Joi.validate(user, userJoiSchema);
  }

router.get('/', (req, res)=>{
    User.findUsers().then(result => {
        if (!result || result.length === 0)                     // (optional) if empty array return 404 instead
        res.status(404).send(`No objects found`);
        else if (result instanceof Error)
          res.status(400).send(result.message);
        else
          res.send(result);
      });
});

router.get('/me', auth, async (req,res) => {
      const user = await User.findOneUser(req.user._id);
      res.send(user);
});

router.get('/:id', async (req, res)=>{
    const result = await User.findOneUser(req.params.id);
    if (!result || result.length === 0)                     // (optional) if empty array return 404 instead
    res.status(404).send(`object with id: ${req.params.id} was not found`);
    else if (result instanceof Error)
        res.status(400).send(result.message);
    else
        res.send(result);
});

router.post('/register', async (req,res)=>{
    logger.log('info', `register user attempt: ${req.body.userName}`);
    let {error} = validateUser(req.body);                        //Joi validation not necessary here as there is another mongoose schema validation
    if(error) return res.status(400).send(error.details[0].message);
    try{
      let userFound = await User.checkUserExistsByUserName(req.body.userName);
      if(userFound)
        return res.status(400).send("userName taken");
    }
    catch (ex){
      console.log(ex);
    }
    let user = req.body;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password , salt);
    User.addUser(user).then(result => {
      if (result instanceof Error)
        res.status(400).send(result.message);
      else{
        user = new User(user);
        res.send(_.pick(result, ['_id', 'userName']));
      }
    }).catch(err => console.log(err));
});

router.post('/login', (req,res)=>{
    let {error} = validateUser(req.body);                        
    if(error) return res.status(400).send(error.details[0].message);
    User.authenticateUser(req.body).then(result => {
      if (result instanceof Error)
        res.status(400).send(result.message);
      else
        res.status(200).json(result);
    });
});
  

module.exports = router;