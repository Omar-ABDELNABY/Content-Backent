const User = require("../models/user");
const logger = require ('../logger/logger');

module.exports = async function(){
    const users = await User.findUsers();

    if(users.length === 0){
        logger.log('info', `Seeding Database`);
        User.addUser({
            userName: "admin",
            password: "admin",
            isAdmin: true
        });
    }
}