'use strict'

var mongoose = require('mongoose');
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

module.exports = mongoose.model('Topic', TopicSchema);