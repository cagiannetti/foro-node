'use strict'

var mongoose = require('mongoose'); //traemos el objeto mongoose con sus métodos

var Schema = mongoose.Schema; //definimos un esquema

var UserSchema = Schema({ //defino el esquema de usuario, para cuando cree un nuevo usuario se cree un documento adaptado a este formato
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

//eliminar password del objeto de usuario que devolvemos
UserSchema.methods.toJSON = function(){ //es el metodo que utiliza js para convertir la respuesta a json, sobreescribimos algunas cosas
    var obj = this.toObject();
    delete obj.password; //eliminamos la propiedad del objeto antes de devolverla

    return obj;
};


module.exports = mongoose.model('User', UserSchema); //para poder requerirlo desde cualquier archivo y poder crear objetos de usuario con las propiedades del esquema
                                // lowercase y pluralizar el nombre, user dentro de users
                                // users -> documentos (schema)