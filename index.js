'use strict'

var mongoose = require('mongoose'); //mongoose es una librería que me va a permitir conectar a la bd mongoDB
var app = require('./app.js'); //importamos el modulo app
var port = process.env.PORT || 3999; //toma el puerto del entorno ó sino lo setea en 3999

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser:true })
        .then(()=>{
            console.log('La conexión a la BD de mongo se ha realizado correctamente!!!');

            //Crear el servidor
            app.listen(port, ()=>{
                console.log('El servidor http://localhost:' + port + ' está funcionando!!!');
            })
        })
        .catch(error => console.log(error));
