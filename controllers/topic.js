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
    },

    getTopicsByUser: function(req, res){
        
        //Conseguir el id del usuario
        var userId = req.params.user;
        
        //Find con la condición de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            };

            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                });
            };

            //Devolver respuesta cuando hay exito
            return res.status(200).send({
                status: 'success',
                message: 'get my topics método',
                topics
            });
        });
    },

    getTopic: function(req, res){

        //Sacar el id del topic de la url
        var topicId = req.params.id;

        //Hacer find por id del topic
        Topic.findById(topicId)
             .populate('user')
             .populate('comments.user')
             .exec((err, topic)=>{

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                };

                if(!topic){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el topic'
                    });
                };
                
                //Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    message: 'método getTopic OK',
                    topic
                });

        });
    },

    update: function(req, res){
        
        //Recoger la id del topic desde la url
        var topicId = req.params.id;    

        //Recoger los datos que llegan desde post
        var params = req.body;
        
        //Validar datos
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

        if(validate_title && validate_content && validate_lang){
            //Montar un JSON con los datos que quiero modificar
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };

            //Find and update por id y por id de usuario (solo el dueño puede modificar) 
            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, {new: true}, (err, topicUpdated) => {
                
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                };

                if(!topicUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ha actualizado el tema'
                    });
                };

                //Devolver respuesta de éxito
                return res.status(200).send({
                    status: 'success',
                    message: 'Se ha actualizado el topic',
                    topic: topicUpdated
                });
            });

        }else{
            return res.status(200).send({
                status:'error',
                message: 'La validación no ha sido correcta'            
            });
        };
    },

    delete: function(req, res){

        //Recoger la id del topic desde la url
        var topicId = req.params.id;
        
        //Recoger datos del usuario que hizo la request
        var user = req.user;

        //Find and delete por topicID y por user
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved)=>{
            
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            };

            if(!topicRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el tema'
                });
            };
            //Devolver respuesta de éxito
            return res.status(200).send({
                status:'success',
                message: 'Topic borrado',
                topic: topicRemoved
            });
        });
    },
    
    search: function(req,res){
        
        // Sacar string a buscar de la url
        var searchStr = req.params.search;

        // Find or
        Topic.find({"$or":[
            {"title": { "$regex": searchStr, "$options": "i"} },
            {"content": { "$regex": searchStr, "$options": "i"} },
            {"code": { "$regex": searchStr, "$options": "i"} },
            {"lang": { "$regex": searchStr, "$options": "i"} }
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics)=>{
            if(err){
                return res.status(500).send({
                    status:'error',
                    message: 'error en la petición'
                });
            }

            if(!topics){
                return res.status(404).send({
                    status:'error',
                    message: 'no hay temas disponibles'
                });
            }

            //Devolver respuesta de éxito
            return res.status(200).send({
                status:'success',
                message: 'método search',
                criteria: req.params.search,
                topics
            });

        });


    }

};

module.exports = controller;