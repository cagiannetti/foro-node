'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

    test: function(req, res){
        return res.status(200).send({
            message: 'Hola desde método test en topic controller'
        });
    },

    save: function(req, res){

        //recoger los parámetros por POST
        var params = req.body; //gracias a body pharser convierte la request en objeto js
        //console.log(params);

        //Validar los datos
        try{
             var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err){
            return res.status(200).send({
                status:'error',
                message: 'Faltan datos por enviar'
            });
        };

        if(validate_content && validate_title && validate_lang){
            //Crear el objeto a guardar
            var topic = new Topic();

            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            
            //Guardar el topic
            topic.save((err, topicStored) => {
                //Devolver respuesta
                
                if(err || !topicStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El topic NO se ha guardado',
                        topic: topicStored
                    }); 
                }

                return res.status(200).send({
                    status: 'success',
                    message: 'El topic se ha guardado',
                    topic: topicStored
                });
            });


        }else{
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });
        }


    }

};

module.exports = controller;