const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


//Modelo de COMMENTS
const CommentSchema = Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  content: String

});

//En caso de exportar comentario
//const Comment = mongoose.model('Comment', CommentSchema);

const CategorySchema = Schema({
  name: String,
});

//Modelo de Release
const ReleaseSchema = Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  start_date: {
    type: Date,
    require: true,
  },
  category: CategorySchema,
  url_check: {
    type: String,
    require: true,
    trim: true,
  },
  url_site: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  status: {                                            
    type: String,
    enum: ['PROCESSING', 'ACCEPTED', 'REFUSED'],
    default: 'PROCESSING',
  },
  reason: {
    type: String,
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  comments: [CommentSchema]
});

ReleaseSchema.plugin(mongoosePaginate);

const Release = mongoose.model('Release', ReleaseSchema)
const Category = mongoose.model('Category', CategorySchema);

module.exports = {Release, Category};


