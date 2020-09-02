'use strict'

var express = require('express');
var UserController = require('../controllers/user'); //cargo el controlador de usuario

var router = express.Router(); //cargo el router de express

//Rutas de prueba
router.get('/probando', UserController.probando); //vinculo la ruta /probando con el objeto usercontroller y el método probando del mismo
router.post('/testeando', UserController.testeando);


//Rutas de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);

module.exports = router;
 