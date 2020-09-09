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
            topic.user = req.user.sub;
            
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
        };
    },

    getTopics: function(req,res){

        //Cargar la librería de paginación en el modelo de topics

        //Recoger la página actual
        if( !req.params.page || req.params.page=="0" || req.params.page==0 || req.params.page == null || req.params.page == undefined){
            var page=1;
        }else{
            var page = parseInt(req.params.page); //convertimos a número la cadena que indica la página y la asignamos
        }; 
        

        /* Indicar opciones de paginación pag actual
        - sort: campo de orden 1 ó -1 ascendente ó descendente
        - populate: sirve para ir a buscar los datos del usuario a la otra colección a través del id que está almacenado, tal como si fuera una relación
        - limit: cantidad de topics por página 
        - page: página actual*/
        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };


        //Find paginado
        Topic.paginate({}, options, (err, topics) => {
            
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            };

            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics'
                });
            }
            
            //Devolver resultado (topics, total de topics, total de páginas)
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages,
                page
            });    
        });



    }

};

module.exports = controller;