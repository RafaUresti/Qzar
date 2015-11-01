/*jslint
    indent: 4, unparam: true
*/
'use strict';

var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
var moment = require('moment-timezone');

var actividadesAsignadas = require('./actividadesAsignadas.js');
var credenciales = require('../database/credencialesbd.json');

function agregarRetroalimentacion(retro, callback) {
    // El archivo tiene como nombre el idModulo y la fecha.
    var hoy = moment().tz('America/Mexico_City').format('YYYY-MM-DD'),
        bd = mysql.createConnection(credenciales),
        sql = "INSERT INTO Retroalimentaciones(fecha, idModulos, descripcion, contenidoMultimedia) VALUES(?,?,?,?);",
        nombreArchivo,
        params;

	// Confirma las actividades que se completaron.
	for (var actividad in retro) {
		// Un parámetro se identifica como actividad porque su nombre es un numéro (el id de la actividad asignada).
		if (actividad.match(/^\d+$/)) {
			actividadesAsignadas.confirmar(actividad, function(err) {
				console.log(err);
			});
		}
	}

    if (retro.archivo) {
        nombreArchivo = retro.idModulo + '_' + hoy + path.extname(retro.archivo.originalFilename);
    }
    params = [hoy, retro.idModulo, retro.descripcion, nombreArchivo];

    bd.connect();

    // Prepara consulta y la ejecuta.
    sql = mysql.format(sql, params);
    bd.query(sql, function (err, resultado) {
        if (err) {
            bd.end();
            return callback(err);
        }
        bd.end();
        
        // Si subió foto intenta guardarla.
        if (!retro.archivo) {
            return callback(null, resultado.insertId);
        } else {
            fs.readFile(retro.archivo.path, function (err, contenidoArchivo) {
                if (err) {
                    return callback(err);
                }

                fs.writeFile("./public/images/retros/" + nombreArchivo, contenidoArchivo, function (err) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    return callback(null, resultado.insertId);
                });
            });
		}
    });
}

function actualizarRetroalimentacion(retro, callback) {
    // El archivo tiene como nombre el idModulo y la fecha.
    var hoy = moment().tz('America/Mexico_City').format('YYYY-MM-DD'),
        bd = mysql.createConnection(credenciales),
        sql = "UPDATE Retroalimentaciones SET descripcion = ? WHERE fecha = ? AND idModulos = ?;",
        nombreArchivo,
        params;

	// Confirma las actividades que se completaron.
    actividadesAsignadas.cancelarConfirmacionesHoy(retro.idModulo, function(err) {
		if (err) {
			console.log(err);
		}
	});
	for (var actividad in retro) {
		// Un parámetro se identifica como actividad porque su nombre es un numéro (el id de la actividad asignada).
		if (actividad.match(/^\d+$/)) {
			actividadesAsignadas.confirmar(actividad, function(err) {
				console.log(err);
			});
		}
	}

    // Para saber si también debe reemplazar la foto o no.
    if (retro.archivo) {
        sql = "UPDATE Retroalimentaciones SET descripcion = ?, contenidoMultimedia = ? WHERE fecha = ? AND idModulos = ?;";
        nombreArchivo = retro.idModulo + '_' + hoy + path.extname(retro.archivo.originalFilename);
        params = [retro.descripcion, nombreArchivo, hoy, retro.idModulo];
    } else {
        params = [retro.descripcion, hoy, retro.idModulo];
	}

    bd.connect();

    // Prepara consulta y la ejecuta.
    sql = mysql.format(sql, params);
    bd.query(sql, function (err, resultado) {
        if (err) {
            bd.end();
            return callback(err);
        }
        bd.end();
        
        // Si subió foto intenta guardarla.
        if (!retro.archivo) {
            return callback(null, resultado.insertId);
        } else {
            fs.readFile(retro.archivo.path, function (err, contenidoArchivo) {
                if (err) {
                    return callback(err);
                }

                fs.writeFile("./public/images/retros/" + nombreArchivo, contenidoArchivo, function (err) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    return callback(null, resultado.insertId);
                });
            });
		}
    });
}

var listarRetroalimentaciones = function (idModulo, res) {
  var connection = mysql.createConnection(credenciales);
  connection.connect(function (err) {
    if (!err) {
      console.log("Database is connected ... \n");
      connection.query("select ret.fecha as date, ret.descripcion as descripcion, ret.contenidoMultimedia as ruta FROM Retroalimentaciones as ret WHERE ret.idModulos = " + idModulo, function (err, rows) {
        if (!err) {
          console.log(rows);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(rows));
          return;
        }
        console.log(err);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify([]));
        return;
      });
      connection.end();
    } else {
      console.log("Error connecting database ... \n");
    }
  });
};

function verRetroalimentacionHoy(idModulo, callback) {

    var hoy = moment().tz('America/Mexico_City').format('YYYY-MM-DD'),
        bd = mysql.createConnection(credenciales),
        sql = "SELECT * from Retroalimentaciones WHERE fecha = ? AND idModulos = ?;",
        params = [hoy, idModulo];

    bd.connect();

    // Prepara consulta y la ejecuta.
    sql = mysql.format(sql, params);
    bd.query(sql, function (err, resultado) {
        if (err) {
            bd.end();
            return callback(err);
        }
        bd.end();
		return callback(null, resultado[0]);
	});
}

module.exports = {
  'agregar' : agregarRetroalimentacion,
  'actualizar' : actualizarRetroalimentacion,
  'hoy' : verRetroalimentacionHoy,
  'listarRetroalimentaciones': listarRetroalimentaciones
};
