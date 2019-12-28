const homepage = require('./routes/homepage');
const users = require('./routes/users');
const error = require('./middleware/error')
const logger = require ('./logger/logger');
const config = require('config');
const mongoose = require("mongoose");
const seedDatabase = require('./Seed Database/seedDatabase');
const express = require("express");
const app = express();

const connectionString = config.get('connectionString');

mongoose.connect(connectionString, {useNewUrlParser:true})
  .then(() => {
    logger.log('info', `Connected to database: ${connectionString}`);
    seedDatabase();
  })
  .catch((err) => {
    logger.log('error', `Connection failed to: ${connectionString}`);
    logger.log('error', err);
  });

app.use(express.json());

app.use('/images', express.static('images'));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    next();
  });

app.use('/api/auth', users);
app.use('/api/homepage', homepage);

app.use(error);






module.exports = app;