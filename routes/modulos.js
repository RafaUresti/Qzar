/*jslint
    indent: 4, unparam: true
*/
/* globals require: true, console: true, module: true */
'use strict';

var express = require('express');
var router = express.Router();

var modulos = require('../components/modulos.js');
var cuadritos = require('../components/modulos.js');
var usuarios = require('../components/usuarios.js');
var actividadesAsignadas = require('../components/actividadesAsignadas.js');

// Página principal de módulos
router.get('/', function (req, res, next) {
    if (req.session.usuario.permisos.indexOf("ver modulo") < 0) {
        res.redirect('/modulos/' + req.session.usuario.idModulo);
        return;
    }
    modulos.listar(function (err, modulos) {
        if (err) {
            console.log(err);
        }
        res.render('modulos', { titulo: 'Módulos', modulos: modulos, usuario: req.session.usuario, barraLateral: 'modulos' });
    });
});

var desplegarCuadritos = function (req, res, next) {
    modulos.desplegar(function (err, cuadritos) {
        if (err) {
            console.log(err);
            return;
        }
        res.render('modulos', { titulo: 'Módulos', modulos: modulos, usuario: req.session.usuario, barraLateral: 'modulos' });    
    });
}

// Petición de crear nuevo módulo.
// La respuesta se manda por texto plano (es una petición AJAX).
router.post('/nuevo', function (req, res, next) {
    var moduloNuevo = {
        "nombre": req.body.nombre,
        "numeroModulo": req.body.numero
    };

    // Valida permisos para crear módulo.
    if (req.session.usuario.permisos.indexOf("crear modulo") < 0) {
        res.send("No tienes permiso para hacer esta acción.");
        return;
    }

    // Verifica que el nombre y el número de módulo no sean vacíos.
    if (moduloNuevo.nombre.match(/^\s*$/) || !moduloNuevo.numeroModulo.match(/^\d{1,3}$/)) {
        res.send('Hubo un error: Verifique que el nombre no sea vacío y el número sea de 3 dígitos.');
        return;
    }

    // Intenta crear módulo.
    modulos.crear(moduloNuevo, function (err, idModulo) {
        // Si hubo error, regresa al formulario de nuevo módulo con el mensaje de error correspondiente.
        if (err) {
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.send('Un módulo con este nombre o con este número ya existe.');
            } else {
                res.send('Hubo un error al crear el nuevo módulo. Inténtelo más tarde.');
            }

        } else {
            // Se manda como string para que no lo interprete como HTTP status.
            res.send("" + idModulo);
        }
    });
});

// Página ver modulo
router.get('/:id(\\d+)', function (req, res, next) {
    var idModulo = req.params.id;
     
    modulos.mostrar(idModulo, function (err, modulos) {
        if (err) {
            console.log(err);
        } else if (!modulos[0]) {
            err = new Error();
            err.status = 404;
            next(err);
            return;
        }

        if (req.session.usuario.permisos.indexOf("ver modulo") < 0 && req.session.usuario.idModulo !== modulos[0].idModulo) {
            err = new Error();
            err.status = 403;
            next(err);
            return;
        }

        var alto = [];
        var ancho = [];
        while (modulos[0].alto > 0) {
            alto.push(modulos[0].alto);
            modulos[0].alto--;
        }
        while (modulos[0].ancho > 0) {
            ancho.push(modulos[0].ancho);
            modulos[0].ancho--;
        }
        //modulos[0].ancho = ancho;
        //modulos[0].alto = alto;
        cuadritos.desplegar(idModulo, function (err, cuadritos) {
            if (err) {
                console.log(err);
				err = new Error();
				err.status = 500;
				next(err);
            }
            else {
                actividadesAsignadas.actividadesPosibles(function (errActividad, actividades) {
                    console.log("Actividades en controlador");
                    console.log(actividades);
                    if (errActividad) {
                        console.log("Err Actividades: " + errActividad);
						err = new Error();
						err.status = 500;
						next(err);
                    } else {
                        actividadesAsignadas.sectoresPosibles(idModulo, function (errSectores, sectores) {
                            if (errSectores) {
                                console.log("Err Sectores: " + errSectores);
								err = new Error();
								err.status = 500;
								next(err);
                            } else {
                                actividadesAsignadas.listarCategorias(function (errSectores, categorias) {
                                    if (errSectores) {
                                        console.log("Err Categorias: " + errSectores);
										err = new Error();
										err.status = 500;
										next(err);
                                    } else {
                                        res.render('vermodulos', { titulo: 'Módulo ', modulo: modulos[0], usuario: req.session.usuario, barraLateral: 'modulos', alto: alto, ancho: ancho, cuadritos: cuadritos, actividades: actividades, sectores: sectores, categorias: categorias});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});


// Manda respuesta por texto plano.
router.post('/:id(\\d+)/actualizar', function (req, res, next) {

    var moduloActualizado = {
        "idModulo": req.params.id,
        "nombre": req.body.nombre,
        "numeroModulo": req.body.numero
    };

    // Valida permisos para actualizar módulo.
    if (req.session.usuario.permisos.indexOf("modificar modulo") < 0) {
        res.send("No tienes permiso para actualizar módulo.");
        return;
    }

    // Verifica que el nombre y el número de módulo no sean vacíos.
    if (moduloActualizado.nombre.match(/^\s*$/) || !moduloActualizado.numeroModulo.match(/^\d{1,3}$/)) {
        res.send('Hubo un error: Verifique que el nombre no sea vacío y el número sea de 3 dígitos.');
        return;
    }

    // Intenta actualizar módulo.
    modulos.actualizar(moduloActualizado, function (err) {
        if (err) {
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.send('Un módulo con este nombre o con este número ya existe.');
            } else {
                res.send('Hubo un error al actualizar el módulo. Inténtelo más tarde.');
            }

        } else {
            res.send('Correcto');
        }
    });
});

//eliminar modulo
router.get('/eliminar/:id(\\d+)', function (req, res, next) {
    var idModulo = req.params.id;

    // Valida permisos para eliminar módulo.
    if (req.session.usuario.permisos.indexOf("eliminar modulo") < 0) {
        res.sendStatus(403);
        return;
    }

    modulos.eliminar(idModulo, function (err, modulos) {
        res.redirect('/modulos');
    });
});

router.post('/itinerario', function (req, res, next) {
	
    actividadesAsignadas.listarActividadesAsignadas(req.body.modulo, res, function(rows) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    });
});

module.exports = router;
