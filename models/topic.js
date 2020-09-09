'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2'); //módulo de paginación
var Schema = mongoose.Schema;

//Modelo de COMMENTS
var CommentSchema = Schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'}
});

var Comment = mongoose.model('Comment', CommentSchema);


//Cada uno de los temas que se añadan al foro tendrán un esquema como el que sigue, tendrán subdocumentos comments con el esquema commentSchema
var TopicSchema = Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'},
    comments: [CommentSchema]
});

//Añadirle un pluggin de paginación al modelo, para devolver resultados paginado
TopicSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Topic', TopicSchema);