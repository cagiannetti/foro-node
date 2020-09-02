'use strict'

var validator =  require ('validator'); //creo un objeto validator, cargo la librería validator con varios métodos de validación
var bcrypt = require('bcrypt-nodejs'); //cargamos la librería bcrypt para cifrar la password
var User = require('../models/user'); //requiero el modelo de usuario para poder crear nuevos usuarios
var jwt = require('../services/jwt'); //requiero el servicio que creamos para generar token

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



    }

};


module.exports = controller;