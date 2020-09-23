'use strict'

var validator = require('validator'); // importamos librería validator

var Topic = require('../models/topic'); //importamos el modelo de topic


var controller = {

    add: function(req, res){
        
        //Recoger el id del topic de la url
        var topicId = req.params.topicId;
        // console.log (req.params);
        // console.log (req.body);

        //Find por id del topic
        Topic.findById(topicId).exec((err, topic)=>{

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }

            //Comprobar objeto usuario y validar datos  
            if(req.body.content){

                //Validar datos
                try{
                    var validate_content = !validator.isEmpty(req.body.content);
                }catch(err){
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                };

                if(validate_content){
                    
                    //creamos un objeto
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };

                    //En la propiedad comments del objeto resultante hacer un push, para añadir un objeto dentro de un array
                    topic.comments.push(comment); //añade un subdocumento a la propiedad comment del topic que irá a parar a la bd

                    //Guardar el topic completo
                    topic.save((err)=>{

                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        }

                        //Hacer find por id del topic para popular usuarios etc
                        Topic.findById(topic._id)
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

                    });

                }else{

                    return res.status(200).send({
                        message: 'No se han validado los datos de comentario'
                    });
                }

            }else{  //agregado por clau
                return res.status(200).send({
                    message: 'no enviaste el contenido' 
                });
            }

        });

    },

    update: function(req, res){

        //Conseguir id de comentario que llega por url
        var commentId = req.params.commentId;

        //Recoger datos
        var params = req.body;

        //Validar datos
        try{
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                message: 'No has comentado nada'
            });
        };

        if(validate_content){

            //Find and Update de subdocumento
            Topic.findOneAndUpdate( //buscar y actualizar el comentario deseado, solo si el usuario es el dueño
                {"comments._id": commentId, "user": req.user.sub},
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                {new: true},
                (err, topicUpdated)=>{
                    
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }
        
                    if(!topicUpdated){
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el tema, ó no tienes permiso para actualizarlo'
                        });
                    }
                    
                    //Devolver mensaje de éxito
                    return res.status(200).send({
                        status: 'success',
                        message: 'se ha actualizado el comentario',
                        topic: topicUpdated
                    });
                }
            );

        }

    },

    delete: function(req, res){

        // Sacar el id del topic y del comentario a borrar de la url
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el topic
        Topic.findById(topicId, (err, topic) => {
            
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }

            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);

            // Borrar el comentario
            if(comment){
                comment.remove();

                // Guardar el topic
                topic.save((err)=>{
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }

                        //Hacer find por id del topic para popular usuarios etc
                        Topic.findById(topic._id)
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
                });

            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el comentario'
                });
            }

        });



    }

};


module.exports = controller; //exporto el objeto con sus métodos controller para utilizarlo en otros lugares