'use strict';

var express = require('express');
var multiparty = require('multiparty');
var router = express.Router();

var modulos = require('../components/modulos.js');
var usuarios = require('../components/usuarios.js');
var retroalimentaciones = require('../components/retroalimentaciones.js');

// Para administrador general: lista de retroalimentaciones.
// Para administrador de módulo: sus retroalimentaciones.
router.get('/', function (req, res, next) {

    if (req.session.usuario.idRoles !== 1) {
        res.redirect('/retroalimentacion/' + req.session.usuario.idModulo);
        return;
    }

    modulos.listar(function (err, modulos) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.render('retroalimentaciones', { titulo: 'Retroalimentaciones', usuario: req.session.usuario, modulos: modulos, barraLateral: "retroalimentacion"});
        }
    });
});

// Petición de crear nueva retroalimentación.
router.post('/nuevo', function (req, res, next) {
    var formulario = new multiparty.Form(),
        retroalimentación = {
            'idModulo' : req.session.usuario.idModulo
        };

    // Valida permisos para agregar retroalimentación.
    // Que no cheque tan chacamente.
    if (req.session.usuario.idRoles !== 2) {
        res.send("No tienes permiso para enviar retroalimentación.");
        return;
    }

    // Para leer el archivo.
    formulario.parse(req, function(err, campos, archivos) {
        if (err) {
            console.log(err);
            res.send('Hubo un error al agregar la retroalimentación. Inténtelo más tarde.');
        } else {
            retroalimentación.descripción = campos.descripcion;
            if (archivos.foto[0].size > 0) {
                if (archivos.foto[0].headers['content-type'].match(/^image/)) {
                    retroalimentación.archivo = archivos.foto[0];
                } else {
                    console.log(archivos.foto[0].headers);
                    res.send('La foto de retroalimentación debe ser una imagen.');
					return;
				}
            }

            // Intenta agregar retro.
            retroalimentaciones.agregar(retroalimentación, function(err) {
                if (err) {
                    console.log(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.send('Ya se agregó una retroalimentación para este día.');
                    } else {
                        res.send('Hubo un error al agregar la retroalimentación. Inténtelo más tarde.');
                    }
                } else {
                    res.redirect('/retroalimentacion/' + req.session.usuario.idModulo);
                }
            });
        }
    });
});

// Petición de actualizar retroalimentación del día.
router.post('/actualizar', function (req, res, next) {
    var formulario = new multiparty.Form(),
        retroalimentación = {
            'idModulo' : req.session.usuario.idModulo
        };

    // Valida permisos para actualizar retroalimentación.
    // Que no cheque tan chacamente.
    if (req.session.usuario.idRoles !== 2) {
        res.send("No tienes permiso para actualizar la retroalimentación.");
        return;
    }

    // Para leer el archivo.
    formulario.parse(req, function(err, campos, archivos) {
        if (err) {
            console.log(err);
            res.send('Hubo un error al actualizar la retroalimentación. Inténtelo más tarde.');
        } else {
            retroalimentación.descripción = campos.descripcion;
            if (archivos.foto[0].size > 0) {
                if (archivos.foto[0].headers['content-type'].match(/^image/)) {
                    retroalimentación.archivo = archivos.foto[0];
                } else {
                    console.log(archivos.foto[0].headers);
                    res.send('La foto de retroalimentación debe ser una imagen.');
					return;
				}
            }

            // Intenta agregar retro.
            retroalimentaciones.actualizar(retroalimentación, function(err) {
                if (err) {
                    console.log(err);
                    res.send('Hubo un error al actualizar la retroalimentación. Inténtelo más tarde.');
                } else {
                    res.redirect('/retroalimentacion/' + req.session.usuario.idModulo);
                }
            });
        }
    });
});

// Ver retroalimentaciones del módulo.
router.get('/:id(\\d+)', function (req, res, next) {
    var idModulo = req.params.id;
    modulos.mostrar(idModulo, function (err, modulos) {
        if (err) {
            console.log(err);
            err = new Error('Hubo un error interno.');
            err.status = 500;
            next(err);
            return;
        } else if (!modulos[0]) {
            err = new Error('Not Found');
            err.status = 404;
            next(err);
            return;
        }

        if (req.session.usuario.idRoles !== 1 && req.session.usuario.idModulo !== modulos[0].idModulo) {
            err = new Error('No puedes.');
            err.status = 403;
            next(err);
            return;
        }

        retroalimentaciones.hoy(idModulo, function(err, retroalimentacionHoy) {
            if (err) {
				console.log(err);
			}
            res.render('verretroalimentacion', { titulo: 'Retroalimentaciones', usuario:req.session.usuario, barraLateral: "retroalimentacion", modulo: modulos[0], retroalimentacionHoy: retroalimentacionHoy});
		});
    });
});

router.post('/verRetroalimentacion', function (req, res, next) {
    retroalimentaciones.listarRetroalimentaciones(req.body.modulo, res);
});

module.exports = router;
