const mongoose = require('mongoose');
const logger = require('../logger/logger');

const sectionSchema = mongoose.Schema({
  title: { 
    type: String,
    trim: true, 
    required: false, 
    // minlength: 2, 
    maxlength:50, 
    // match: /[A-Za-z0-9 ]*/ 
    },
    body: { 
      type: String,
      trim: true, 
      required: false, 
      // minlength: 1, 
      },
      imagePath:{
      type: String,
    },
    order: {
      type: Number
    }
});
Section = mongoose.model('section', sectionSchema, 'sections');

async function findSections(){
  logger.log('info', 'findSections');
  try{
    return await Section.find();
  }
  catch (ex){
    return ex;
  }
}
async function findOneSection(id){
  logger.log('info', `findSections for id: ${id}`);
  try{
    return await Section.findOne({_id: id});
  }
  catch (ex){
    return ex;
  }
}

async function addSection(_section, imageUrl){
  logger.log('info', `addSection attempt: ${JSON.stringify(_section)}`);
  try{
    const section = new Section(_section);
    section.imagePath = imageUrl;
    await section.validate();
    let result = await section.save();
    logger.log('info', `Section Added: ${JSON.stringify(_section)}`);
    return result;
  }
  catch (ex){
    return ex;
  }
}

async function editSection(id, _section, imageUrl){
  logger.log('info', `editSection attempt id: ${id}, new section ${JSON.stringify(_section)}`);
  // if ( !_section._id || _section._id != id)
  //   return (new Error('unmatched id'));
  try {
    let section = new Section(_section);
    section.imagePath = imageUrl;
    await section.validate();
    section = section.toObject();                 // to delete the _id if needed
    delete section._id;
    return await Section.findOneAndUpdate({ _id: id }, {$set: section}, {useFindAndModify: false, new: true}); 
  }
  catch (ex){
    return ex;
  }
}

async function deleteSection(id){
  logger.log('info', `deleteSection for id: ${id}`);
  try {
    return await Section.findOneAndRemove({ _id: id }, {useFindAndModify: false});
  }
  catch (ex){
    return ex;
  }
}

Section.findSections = findSections;
Section.findOneSection = findOneSection;
Section.addSection = addSection;
Section.editSection = editSection;
Section.deleteSection = deleteSection;

module.exports = Section;


