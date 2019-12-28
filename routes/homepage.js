const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const multer = require('multer');

const Section = require("../models/section");
const Joi = require('joi');

const MimeTypeMap = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MimeTypeMap[file.mimetype];
    let error = new Error('Invalid Mime Type');
    if(isValid){
      error = null;
    }
    callback(error, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('_');
    const extention = MimeTypeMap[file.mimetype];
    callback(null, `${name}_${Date.now()}.${extention}`);
  }
});

function validateSection(section){
    const sectionJoiSchema ={
        title: [Joi.string().max(50).optional(), Joi.allow(null)],
        body: [Joi.string().optional(), Joi.allow(null)],
    };
    return Joi.validate(section, sectionJoiSchema);
  }

  
router.get('/', (req, res, next)=>{
  Section.findSections().then(result => {
        if (!result || result.length === 0)                     // (optional) if empty array return 404 instead
        res.status(404).send(`No objects found`);
        else if (result instanceof Error)
          res.status(400).send(result.message);
        else
          res.send(result);
      })
      .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  router.get('/:id', (req, res)=>{
    Section.findOneSection(req.params.id).then(result => {
        if (!result || result.length === 0)                     // (optional) if empty array return 404 instead
        res.status(404).send(`object with id: ${req.params.id} was not found`);
        else if (result instanceof Error)
          res.status(400).send(result.message);
        else
          res.send(result);
      })
      .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  
  router.post('/', auth, multer({storage: storage}).single('image'), (req,res)=>{                               //router.post('/', auth, (req,res)=>{
    let {error} = validateSection(req.body);                        //Joi validation not necessary here as there is another mongoose schema validation
    if(error) return res.status(400).send(error.details[0].message);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`; 
    Section.addSection(req.body, imageUrl).then(result => {
      if (result instanceof Error)
        res.status(400).send(result.message);
      else
        res.send(result);
    })
    .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  
  router.put('/:id', auth, multer({storage: storage}).single('image'), (req,res)=>{                // router.put('/:id', [auth,admin] , (req,res)=>{ 
    let {error} = validateSection(req.body);                      // Joi validation not necessary here as there is another mongoose schema validation  
    if(error) return res.status(400).send(error.details[0].message);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`; 
    Section.editSection(req.params.id , req.body, imageUrl).then(result => {
      if (result ===null)
      res.status(404).send(`object with id: ${req.params.id} was not found`);
      else if (result instanceof Error)
        res.status(400).send(result.message);
      else
        res.send(result);
    })
    .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  
  router.delete('/:id', auth, (req, res)=>{
    Section.deleteSection(req.params.id).then(result => {
      if (result ===null)
      res.status(404).send(`object with id: ${req.params.id} was not found`);
      else if (result instanceof Error)
        res.status(400).send(result.message);
      else
        res.send(result);
    })
    .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  
module.exports = router;