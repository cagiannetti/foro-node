'use strict'

var mongoose = require('mongoose'); //mongoose es una librería que me va a permitir conectar a la bd mongoDB

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser:true })
        .then(()=>{
            console.log('La conexión a la BD de mongo se ha realizado correctamente!!!');
        })
        .catch(error => console.log(error));
