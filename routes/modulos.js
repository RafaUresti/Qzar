/* globals require: true, console: true, module: true */
'use strict';

var express = require('express');
var router = express.Router();

var modulos = require('../components/modulos.js');
var usuarios = require('../components/usuarios.js');
var asignaciones = require('../components/asignaciones.js');

// Página principal de módulos
router.get('/', function (req, res, next) {
    if (req.session.usuario.idRoles !== 1) {
        res.redirect('/modulos/' + req.session.usuario.idModulo);
        return;
    }
    modulos.listar(function (err, modulos) {
        if (err) {
            console.log(err);
        }
		// Revisar si es necesaria esta consulta.
        usuarios.listarAdminsGenerales(function (err, usuarios) {
            if (err) {
                console.log(err);
            }
            res.render('modulos', { titulo: 'Módulos', modulos: modulos, usuario: req.session.usuario, listaAdmins: usuarios, barraLateral: 'modulos' });
        });
    });
});

var desplegarCuadritos = function (req, res, next) {
    modulos.desplegar(function (err, cuadritos) {
        if (err) {
            console.log(err);
            return;
        }
        res.render('modulos', { titulo: 'Módulos', modulos: modulos, usuario: req.session.usuario, listaAdmins: usuarios, barraLateral: 'modulos' });    
    });
}

// Petición de crear nuevo módulo.
router.post('/nuevo', function (req, res, next) {
    var moduloNuevo = {
        "nombre": req.body.nombre,
        "numeroModulo": req.body.numero,
        "usuarioAdministrador": req.body.admin
    };

    // Valida permisos para crear módulo.
    if (req.session.usuario.idRoles !== 1) {
        res.send(JSON.stringify({error: "No tienes permiso para crear un módulo."}));
        return;
    }

    // Verifica que el nombre y el número de módulo no sean vacíos.
    if (moduloNuevo.nombre.match(/^\s*$/) || !moduloNuevo.numeroModulo.match(/^\d{1,3}$/)) {
        res.send(JSON.stringify({error: "Hubo un error: Verifique que el nombre no sea vacío y el número sea de 3 dígitos."}));
        return;
    }

    // Intenta crear módulo.
    modulos.crear(moduloNuevo, function (err, idModulo) {
        // Si hubo error, regresa al formulario de nuevo módulo con el mensaje de error correspondiente.
        if (err) {
            console.log(err);
            res.send(JSON.stringify({error: "Hubo un error al crear el nuevo módulo. Inténtelo más tarde."}));
			return;
        }
        
        // Módulo creado exitosamente.
        res.send(JSON.stringify({idModulo: idModulo}));
    });
});

// Página ver módulo
router.get('/:id(\\d+)', function (req, res, next) {
    var idModulo = req.params.id;
     
    modulos.mostrar(idModulo, function (err, modulos) {
        if (err) {
            console.log(err);
            err = new Error("Hubo un error interno.");
            err.status = 500;
            next(err);
            return;
        } else if (!modulos[0]) {
            err = new Error("Módulo no encontrado. Es posible que el módulo no exista o que haya sido dado de baja del sistema.");
            err.status = 404;
            next(err);
            return;
        }

        if (req.session.usuario.idRoles !== 1 && req.session.usuario.idModulo !== modulos[0].idModulo) {
            err = new Error("No tienes permisos para acceder a este módulo.");
            err.status = 403;
            next(err);
            return;
        }

        usuarios.listarUsuariosModulo(idModulo, function (err, usuarios) {
            if (err) {
                console.log(err);
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
            }
            else{
                res.render('vermodulos', { titulo: 'Módulo ', modulo: modulos[0], usuario: req.session.usuario, listaAdmins: usuarios, barraLateral: 'modulos', alto: alto, ancho: ancho, cuadritos: cuadritos});
            }
            
        });
        //res.render('vermodulos', { titulo: 'Módulo ', modulo: modulos[0], usuario: req.session.usuario, listaAdmins: usuarios, barraLateral: 'modulos', alto: alto, ancho: ancho});            
        });
    });
});

router.post('/:id(\\d+)/actualizar', function (req, res, next) {

    var moduloActualizado = {
        "idModulo": req.params.id,
        "nombre": req.body.nombre,
        "numeroModulo": req.body.numero,
        "usuarioAdministrador": req.body.admin
    };

    // Valida permisos para actualizar módulo.
    if (req.session.usuario.idRoles !== 1) {
        res.send(JSON.stringify({error: "No tienes permiso para actualizar módulo."}));
        return;
    }

    // Verifica que el nombre y el número de módulo no sean vacíos.
    if (moduloActualizado.nombre.match(/^\s*$/) || !moduloActualizado.numeroModulo.match(/^\d{1,3}$/)) {
        res.send(JSON.stringify({error: "Hubo un error: Verifique que el nombre no sea vacío y el número sea de 3 dígitos."}));
        return;
    }

    // Intenta actualizar módulo.
    modulos.actualizar(moduloActualizado, function (err) {
        if (err) {
            console.log(err);
            res.send(JSON.stringify({error: "Hubo un error al actualizar el módulo. Inténtelo más tarde."}));
        } else {
            res.send(JSON.stringify({mensaje: "Correcto"}));
        }
    });
});

//eliminar modulo
router.get('/eliminar/:id(\\d+)', function (req, res, next) {
    var idModulo = req.params.id;

    // Valida permisos para eliminar módulo.
    if (req.session.usuario.idRoles !== 1) {
        res.sendStatus(403);
        return;
    }

    modulos.eliminar(idModulo, function (err, modulos) {
        res.redirect('/modulos');
    });
});

router.post('/itinerario', function (req, res, next) {
    /*
    if (req.session.usuario.idRoles != 1) {
        res.redirect('/modulos/' + req.session.usuario.idModulo);
        return;
    }*/
    asignaciones.listarAsignaciones(req.body.modulo, res, function(rows) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    });
});

module.exports = router;
