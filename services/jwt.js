'use strict'

var jwt = require('jwt-simple'); //para generar token   
var moment = require('moment'); //para generar fechas

exports.createToken = function(user){

    //creamos un payload, un objeto que contiene info del usuario y fechas de expiración y creación con el cual se generará el token
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwt.encode(payload, 'clave-secreta-para-generar-el-token-9999'); //genera el token en base al objeto payload y agregando una clave secreta para mayor seguridad aún

};