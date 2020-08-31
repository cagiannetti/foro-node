'use strict'

//Requires, cargamos módulos
var express = require('express');
var bodyParser = require('body-parser'); //trabaja con peticiones http


//Ejecutar express
var app = express();

//Cargar archivos de rutas

//Middlewares
app.use(bodyParser.urlencoded({extended: false})); //config basica 
app.use(bodyParser.json()); //convierte una petición en un objeto json para poder trabajar en los controladores

//CORS

//Reescribir rutas

//Rutas / métodos de prueba
    app.get('/prueba', (req, res)=>{
        return res.status(200).send("<h1>Hola desde backend con node método GET</h1>"); //devuelve un string
        
        /*return res.status(200).send({ //devuelve un json
            nombre: 'Claudio Giannetti',
            message:'hola mundo desde el backend con node soy un método GET'
        });*/
    });

    app.post('/prueba', (req, res)=>{
        
        return res.status(200).send({ //devuelve un json
            nombre: 'Claudio Giannetti',
            message:'hola mundo desde el backend con node soy un método POST'
        });
    });

//Exportar módulo
module.exports = app; //para poder crear el servidor desde cualquier otro archivo