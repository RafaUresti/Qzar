var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var credenciales = require('../database/credencialesbd.json');
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function crearModulo(nombre, codigo, callback) {
	var bd = mysql.createConnection(credenciales);
	bd.connect();
	/*
	var sql2="SELECT nombre FROM modulos where nombre = ?";
	var params2 = [nombre];
	sql2 = mysql.format(sql2, params2);
	bd.query(sql2, function(err, data) {
		if(err) {
			bd.end();
			return callback(err);
		} else {
			//console.log(data.legth);
			if(data.length > 0)
			{
				//console.log('El modulo ya existe');
				return callback('El modulo ya existe');
			}
		}
	});
	*/
	

	// Prepara consulta y la ejecuta.
	// POR HACER:
	//	Que el usuario no esté jarcodeado.
	//	Que haga las validaciones.
	var sql = 'INSERT INTO Modulos(usuarioAdministrador, nombre, numeroModulo) VALUES(2,?,?);';
	var params = [nombre, codigo];
	sql = mysql.format(sql, params);
	bd.query(sql, function(err) {
		if(err) {
			bd.end();
			return callback(err);
		} else {
			bd.end();
			return callback(null);
		}
	});
}

module.exports = {
	'crear' : crearModulo
};
