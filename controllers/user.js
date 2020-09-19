'use strict'

var validator =  require ('validator'); //creo un objeto validator, cargo la librería validator con varios métodos de validación
var bcrypt = require('bcrypt-nodejs'); //cargamos la librería bcrypt para cifrar la password
var fs = require('fs'); //librería de nodejs que permite trabajar con el sistema de archivos
var path = require ('path'); //librería de nodejs
var User = require('../models/user'); //requiero el modelo de usuario para poder crear nuevos usuarios
var jwt = require('../services/jwt'); //requiero el servicio que creamos para generar token
const { exists } = require('../models/user');

var controller = {
    
    probando: function(req, res){
        return res.status(200).send({
            message: 'Soy el método probando'
        });
    },

    testeando: function(req, res){
        return res.status(200).send({
            message: 'Soy el método testeando'
        });
    },

    save: function(req, res){
        //Recoger los parámetros de la petición
        var params = req.body;

        //Validar los datos (con la dependencia validator, dará true / false cuando se cumplan ó no)
        var validate_name = !validator.isEmpty(params.name);
        var validate_surname = !validator.isEmpty(params.surname);
        var validate_email = !validator.isEmpty(params.email) &&  validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);
            //console.log(validate_name, validate_surname, validate_email, validate_password);
        
        if(validate_name && validate_surname && validate_email && validate_password){
            //Crear el objeto de usuario
            var user = new User();
            
            //Rellenar el objeto de usuario, el email lo convierto a minuscilas, la pass la haremos con cifrado
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.password = null;
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si el usuario existe
            User.findOne({email:user.email}, (err, issetUser)=>{
                if(err){
                    return res.status(500).send({
                    message: 'error al comprobar duplicidad de usuario'
                    });
                }

                if(!issetUser){
                    //Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        
                        //guardar el usuario
                        user.save((err, userStored)=>{
                            if(err){
                                return res.status(500).send({
                                message: 'error al guardar el usuario'
                                });
                            }

                            if(!userStored){
                                return res.status(400).send({
                                message: 'El usuario no se ha guardado'
                                });
                            }
                            // Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored,
                                message: 'El usuario se ha guardado correctamente'
                                });
                        }); //close save
                    }); //close bcrypt

                    
                }else{
                    return res.status(200).send({
                        message: 'El usuario ya está registrado'

                    });
                }
            });
            
        }else{
           //Devolver respuesta de error
            return res.status(200).send({
                message: 'Validación de datos de usuario incorrecto, intentalo de nuevo'
            });
        }

    },

    login: function(req, res){
        //Recoger parámetros de la petición
        var params = req.body;

        //Validar datos que nos llegan
        var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = !validator.isEmpty(params.password);

        if(!validate_email || !validate_password){  //comprobación de guarda, si entra acá envía un return y no sigue
            return res.status(200).send({
                message: 'Los datos son incorrectos, envialos bien'
            });
        };

        //Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user)=>{
            
            if(err){
                return res.status(500).send({
                    message: 'Error al intentar identificarse'
                });
            };

            if(!user){
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            };

            //si lo encuentra, comprobar la contraseña (coincidencia email / password con bcrypt)
            bcrypt.compare(params.password, user.password, (err, check)=>{ //compara las password enviadas con la de la bd devuelve dos banderas err y check, para evaluar si hay coincidencias
            
                //si es correcto
                if(check){
                    
                    //Ggenerar token de jwt y devolverlo
                    
                    if(params.gettoken){ //si me llega un parametro gettoken, devuelvo el token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //Limpiar el objeto user antes de devolverlo (eliminar datos que no quiero enviarle por ej. la pass encriptada)
                        user.password = undefined;

                        //Devolver los datos
                        return res.status(200).send({
                            status: 'success',
                            message: 'Login correcto',
                            user: user
                        });
                    }

                }else{
                    return res.status(200).send({
                        message: 'Las credenciales no son correctas'
                    });
                };

            });

        });
    },

    update: function (req, res){

        //Recoger datos del usuario
        var params = req.body;
            //console.log(params);

        //Validar los datos (con la dependencia validator, dará true / false cuando se cumplan ó no)
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) &&  validator.isEmail(params.email);
            //console.log(validate_name, validate_surname, validate_email);
        }catch(err){
            return res.status(400).send({
                status: 'error',
                message: 'Error en los datos recibidos'
            });
        }
        
        //Eliminar propiedades que no vamos a actualizar
        delete params.password;
        
        var userId = req.user.sub;
        //console.log(req.user);

        //Comprobar si el email es único
        if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, user)=>{ //busca si el email ya existe
            
                if(err){
                    return res.status(500).send({
                        message: 'Error al intentar identificarse'
                    });
                };
    
                if(user && user.email == params.email){ //para evitar que se dupliquen mails
                    return res.status(200).send({
                        message: 'El mail no puede ser modificado, ya existe'
                    });
                }else{
                    //Buscar y actualizar documento
                    User.findByIdAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated)=>{ //(condicion, datos a actualizar, opciones, callbak)
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar el usuario'
                            });
                        }

                        if(!userUpdated){
                            return res.status(500).send({
                                status: 'error',
                                message: 'No se pudo actualizar el usuario'
                            });
                        }

                        //Devolver respuesta de exito
                        return res.status(200).send({
                            status: 'success',
                            message: 'Se actualizó el usuario',
                            user: userUpdated
                        });
                    }); 
                };
            });
        }else{
            //Buscar y actualizar documento
            User.findByIdAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated)=>{ //(condicion, datos a actualizar, opciones, callbak)
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    });
                }

                if(!userUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se pudo actualizar el usuario'
                    });
                }

                //Devolver respuesta de exito
                return res.status(200).send({
                    status: 'success',
                    message: 'Se actualizó el usuario',
                    user: userUpdated
                });
            }); 
        };
    },

    uploadAvatar: function(req, res){
        //configurar módulo multiparty (middleware) para habilitar la subida de archivos, routes/user.js

        //Recoger el archivo de la petición
        var file_name = 'Avatar no subido...';
        
        //console.log(req.files); //la propiedad files contiene la imagene enviada

        //if(!req.files.file0){
        if(isEmpty(req.files)){
            return res.status(404).send({
               status: 'error',
               message: file_name
            });
        }
        
        //Conseguir el nombre/extensión del archivo subido
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\'); //segmentamos el path para poder aislar el nombre de la imagen. Advertencia: en linux ó mac debería ser var file_split = file_path.split('/');
        var file_name = file_split[2]; //obtenemos el nombre del archivo

        var ext_split = file_name.split('\.'); 
        var file_ext = ext_split[1]; //conseguir la extensión

        //Comprobar extensión (solo imagen), si no es válida borrar el archivo subido, utilizamos la librería fs
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err)=>{
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es válida',
                    se_borra: file_path
                });
            });
        }else{
            //Sacar el id del usuario identificado
            var userId = req.user.sub;
            
            //Buscar y actualizar documento en BD
            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated) => {
            
                if(err || !userUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: 'error al guardar la imagen del usuario'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    file_path,
                    file_split,
                    file_name,
                    file_ext,
                    user: userUpdated
                });
            });

        }


    },

    avatar: function(req, res){ //función reemplazada a la de victor robles
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;
        fs.access(pathFile, fs.constants.W_OK, (err) => {
            if(!err){
            return res.sendFile(path.resolve(pathFile));
            }else{
            return res.status(404).send({
                message: 'La imagen no existe'
            });
            }
        });
    },

    getUsers: function(req, res){
        User.find().exec((err, users)=>{ //metodo de mongoose
            if(err || !users){
                return res.status(404).send({
                    status : 'error',
                    message: 'no hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;
        User.findById(userId).exec((err, user)=>{
            if(err || !user){
                return res.status(404).send({
                    status : 'error',
                    message: 'no existe el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }

};


//función local para comprobar si un objeto viene vacío, lo hice porque no funcionaba el método de Víctor Robles
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = controller;