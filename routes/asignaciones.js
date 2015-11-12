/*jslint
    indent: 4, unparam: true
*/
var express = require('express');
var router = express.Router();

var actividadesAsignadas = require('../components/actividadesAsignadas.js');

// Checa tus prvilegios
router.post(/.*/, function(req, res, next) {
    if (req.session.usuario.idRoles !== 1) {
        err = new Error('No tienes suficiente permisos para hacer esta acción.');
        err.status = 403;
        next(err);
    } else {
	    next();
    }
});

// Ver itinerario del módulo.
router.post('/listar', function (req, res, next) {
    /*
    if (req.session.usuario.idRoles != 1) {
        res.redirect('/modulos/' + req.session.usuario.idModulo);
        return;
    }*/
    actividadesAsignadas.listar(req.body.modulo, function(err, actividades) {
        res.setHeader('Content-Type', 'application/json');
		if (err) {
			console.log(err);
			res.send(JSON.stringify([]));
		} else {
			res.send(JSON.stringify(actividades));
		}
	});
    /*actividadesAsignadas.listarActividadesAsignadas(req.body.modulo, function(err, rows) {
        res.setHeader('Content-Type', 'application/json');
        if (err) {
            console.log(err);
			rows = [];
		}
        res.send(JSON.stringify(rows));
    });*/
});

router.post('/asignaractividad', function (req, res, next) {
    //To Do
    console.log("Entrando a asignacion");
    idModulo = req.body.idModulo;
    idSector = req.body.idSector;
    idActividad = req.body.idActividad;
    fechaFin = req.body.fechaFin;
    fechaFin = fechaFin.split("/");
    fechaFin = fechaFin[2] + "-" + fechaFin[1] + "-" + fechaFin[0] + ":0:00";
    fechaIni = req.body.fechaIni;
    fechaIni = fechaIni.split("/");
    fechaIni = fechaIni[2] + "-" + fechaIni[1] + "-" + fechaIni[0] + ":0:00";
    fechaIni = new Date(fechaIni);
    fechaFin = new Date(fechaFin);
    while(fechaIni <= fechaFin){
    	console.log("asignando");
        fecha = fechaIni.getFullYear() + "-" + parseInt(fechaIni.getMonth() + 1) + "-" + fechaIni.getDate() + ":0:00";
        console.log(fecha);
	    actividadesAsignadas.asignar(idModulo, idSector, idActividad, fecha);
        //fechaIni.getTime();
    	fechaIni.setDate(fechaIni.getDate() + 1);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify([]));
    return;
});

router.post('/verdetalles', function (req, res, next){
    console.log("Viendo detalles de asignacion");
    idAsignada = req.body.idAsignada;
    actividadesAsignadas.detalles(idAsignada, function(err, actividad) {
		res.setHeader('Content-Type', 'application/json');
		if (err) {
			console.log(err);
			res.send(JSON.stringify([]));
		} else {
			res.send(JSON.stringify(actividad));
		}
	});
    return;
});

module.exports = router;
