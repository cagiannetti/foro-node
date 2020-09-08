'use strict'

var express = require('express');
var UserController = require('../controllers/user'); //cargo el controlador de usuario

var router = express.Router(); //cargo el router de express
var md_auth = require('../middlewares/authenticated'); //cargo el middleware de authenticación

var multipart = require('connect-multiparty'); //cargo el módulo que permite subir archivos, habilita variables superglobales para recibir datos, archivos
var md_upload = multipart({ uploadDir : './uploads/users' }); //creo una superglobal y configuro multipart para que las imágenes de usuario se graben en ese directorio


//Rutas de prueba
router.get('/probando', UserController.probando); //vinculo la ruta /probando con el objeto usercontroller y el método probando del mismo
router.post('/testeando', UserController.testeando);


//Rutas de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update); //agregamos el middleware, cuando llame a la ruta /update primero pasará por el middleware y luego sigue con el usercontroler
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar); //cargo 2 middlewares, utilizo un array
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;
 