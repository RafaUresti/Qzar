/* globals require: true, module: true, console: true*/
'use strict';

var mysql = require('mysql');
var credenciales = require('../database/credencialesbd.json');
var conexion = mysql.createConnection(credenciales);

var __validarCredenciales = function (nombreUsuario, contrasenia, callback) {
    conexion.connect();
    var consulta = 'SELECT `nombre`,`contrasena` FROM `Usuarios` WHERE `nombre` = ? AND `contrasena` = ?;';
    var valores = [nombreUsuario, contrasenia];
    consulta = mysql.format(consulta, valores);
    conexion.query(consulta, function (err, renglones) {
        conexion.end();
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        if (renglones.length === 0) {
            callback(new Error('Usuario y/o contraseña incorrectos.'));
        } else {
            callback(null, true);
        }
    });
};

var __cargarUsuario = function (nombreUsuario, callback) {
    conexion.connect();
    var consulta = 'SELECT `nombre`, `idRoles`, `idModulo`, `activo` FROM `Usuarios` WHERE `nombre` = ?;';
    var valores = [nombreUsuario];
    consulta = mysql.format(consulta, valores);
    conexion.query(consulta, function (err, renglones){
        conexion.end();
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        if (renglones.length === 0) {
            callback(new Error('Usuario no existe.'));
            return;
        }
        var usuario = {};
        usuario.nombre = renglones[0].nombre;
        usuario.activo = renglones[0].activo;
        usuario.idRoles = renglones[0].idRoles;
        usuario.idModulo = renglones[0].idModulo;
        callback(null, usuario);
    });
};

var abrirSesion = function (req, res, callback) {
    var nombreUsuario = req.body.nombreUsuario;
    var contrasenia = req.body.contrasenia;

    if (req.session.usuario) {
        callback(new Error('La sesión ya cuenta con un usuario.'));
        return;
    }

    __validarCredenciales(nombreUsuario, contrasenia, function (err) {
        if (err) {
            callback(err);
            return;
        }

        __cargarUsuario(nombreUsuario, function (err, usuario) {
            if (err) {
                callback(err);
                return;
            }

            req.session.usuario = usuario;
            callback(null, usuario);
        });
    });
};

var cerrarSesion = function (req) {
    req.session.destroy();
    return true;
};

module.exports = {
    'abrirSesion' : abrirSesion,
    'cerrarSesion' : cerrarSesion
};
