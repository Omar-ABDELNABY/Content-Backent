const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const Section = require("../models/section");
const Joi = require('joi');


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
  
  router.post('/', auth, (req,res)=>{                               //router.post('/', auth, (req,res)=>{
    let {error} = validateSection(req.body);                        //Joi validation not necessary here as there is another mongoose schema validation
    if(error) return res.status(400).send(error.details[0].message);
    Section.addSection(req.body).then(result => {
      if (result instanceof Error)
        res.status(400).send(result.message);
      else
        res.send(result);
    })
    .catch(ex => next(ex));                                   // calling the Global Error Handler that's in app.js
  });
  
  router.put('/:id', auth, (req,res)=>{                // router.put('/:id', [auth,admin] , (req,res)=>{ 
    let {error} = validateSection(req.body);                      // Joi validation not necessary here as there is another mongoose schema validation  
    if(error) return res.status(400).send(error.details[0].message);
    Section.editSection(req.params.id , req.body).then(result => {
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