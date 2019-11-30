const logger = require('../logger/logger');

module.exports = function(err, req, res, next){
    logger.log('error', err);
    res.status(500).send('Opps! Something went wrong!!!');
  }