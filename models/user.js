const mongoose = require('mongoose');
const logger = require('../logger/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = mongoose.Schema({
  userName: { 
    type: String,
    required: true, 
    minlength: 3, 
    maxlength:10, 
    match: /[A-Za-z0-9_ ]*/ 
    },
    password: { 
      type: String,
      required: true, 
    },
    isAdmin: Boolean
});
User = mongoose.model('user', userSchema, 'users');

async function findUsers(){
  logger.log('info', 'findUsers');
  try{
    return await User.find();
  }
  catch (ex){
    return ex;
  }
}
async function findOneUser(id){
  logger.log('info', `findUsers for id: ${id}`);
  try{
    return await User.findOne({_id: id});
  }
  catch (ex){
    return ex;
  }
}

async function addUser(_user){
  logger.log('info', `addUser: ${JSON.stringify(_user)}`);
  try{
    const user = new User(_user);
    await user.validate();
    let result = await user.save();
  return result;
  }
  catch (ex){
    return ex;
  }
}

async function editUser(id, _user){
  logger.log('info', `editUser id: ${id}, new user ${JSON.stringify(_user)}`);
  // if ( !_user._id || _user._id != id)
  //   return (new Error('unmatched id'));
  try {
    let user = new User(_user);
    await user.validate();
    user = user.toObject();                 // to delete the _id if needed
    delete user._id;
    return await User.findOneAndUpdate({ _id: id }, {$set: user}, {useFindAndModify: false, new: true}); 
  }
  catch (ex){
    return ex;
  }
}

async function deleteUser(id){
  logger.log('info', `deleteUser for id: ${id}`);
  try {
    return await User.findOneAndRemove({ _id: id }, {useFindAndModify: false});
  }
  catch (ex){
    return ex;
  }
}

async function checkUserExistsByUserName (_userName) {
    try{
      let user = await User.findOne({userName: _userName});
      if (user)
        return true;
      return false;
    }
    catch (ex){
      return ex;
    }
}
function generateAuthToken(user){                          //Information Expert Principle
    const token = jwt.sign({_id: user._id, userName: user.userName, isAdmin: user.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}

async function authenticateUser(_user){
    try {
      let user =  await User.findOne({ userName: _user.userName });
      if(!user)
        return false;
      user = new User(user);
      const validPassword = await bcrypt.compare(_user.password , user.password);
      if(validPassword){
        const token = generateAuthToken(user);
        return token;
      }
      return false;
    }
    catch (ex){
      return ex;
    }
}

User.findUsers = findUsers;
User.findOneUser = findOneUser;
User.addUser = addUser;
User.editUser = editUser;
User.deleteUser = deleteUser;
User.checkUserExistsByUserName = checkUserExistsByUserName;
User.userSchema = userSchema;
User.authenticateUser = authenticateUser;
User.generateAuthToken = generateAuthToken;

module.exports = User;


