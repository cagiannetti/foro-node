'use strict'

/*los métodos en middlewares por lo general tienen 3 parámetros
    - req: request
    -res: respuesta
    -next: función que dice que debe terminar el middleware y seguir con la ejecución normal del controlador que lo invocó
*/
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-el-token-9999';

exports.authenticated = function(req, res, next){
    
    console.log('estás pasando por el middleware!!');    
    
    //Comprobar si llega authorization en la cabecera
    
    if(!req.headers.authorization){ //si no llega campo authorization en el header del request
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de autorización'
        });
    };

    //Obtener y impiar el token y quitar comillas en caso que las tenga
    var token = req.headers.authorization.replace(/['"]+/g, '');
    
    //Decodificar el token, puede haber errores por eso usamis try/catch
    try{
    
        var payload = jwt.decode(token, secret);
        
        //Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){
            
            return res.status(404).send({
                message: 'El token ha expirado'
            });

        }
    
    }catch(ex){
    
        return res.status(404).send({
            message: 'El token no es válido'
        });
    };

  
    //Adjuntar usuario identificado a la request, para tener siempre el usuario identificado en la request y poder acceder a sus propiedades

    req.user = payload; 

    //Pasar a la acción
    next();

};