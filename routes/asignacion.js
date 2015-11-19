/*jslint
    indent: 4, unparam: true
*/
var express = require('express');
var router = express.Router();

var actividadesAsignadas = require('../components/actividadesAsignadas.js');

// Checa tus prvilegios
router.post(/.*/, function(req, res, next) {
    if (req.session.usuario.permisos.indexOf("crear asignacion") < 0) {
        err = new Error();
        err.status = 403;
        next(err);
        return;
    }
	next();
});

router.post('/asignaractividad', function (req, res, next) {
    //To Do
    console.log("auxiliar algoreq.body");
    idModulo = req.body.idModulo;
    idSector = req.body.idSector;
    idActividades = JSON.parse(req.body.idActividades);
    fechaFin = req.body.fechaFin;
    fechaFin = fechaFin.split("/");
    fechaFin = fechaFin[2] + "-" + fechaFin[1] + "-" + fechaFin[0] + ":0:00";
    fechaFin = new Date(fechaFin);
    length = idActividades.length;
    for (i = 0; i < length; i++){
        console.log("Agregando actividades");
        var idActividad = idActividades[i];
        fechaIni = req.body.fechaIni;
        fechaIni = fechaIni.split("/");
        fechaIni = fechaIni[2] + "-" + fechaIni[1] + "-" + fechaIni[0] + ":0:00";
        fechaIni = new Date(fechaIni);
        while(fechaIni <= fechaFin){
            console.log("agregando actividad por fecha");
            fecha = fechaIni.getFullYear() + "-" + parseInt(fechaIni.getMonth() + 1) + "-" + fechaIni.getDate() + ":0:00";
            actividadesAsignadas.asignar(idModulo, idSector, parseInt(idActividad), fecha);
            //fechaIni.getTime();
            fechaIni.setDate(fechaIni.getDate() + 1);
        }
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify([]));
    return;
});

router.post('/verdetalles', function (req, res, next){
    console.log("Viendo detalles de asignacion");
    idAsignada = req.body.idAsignada;
    actividadesAsignadas.edicionAsignaciones( idAsignada, res, 'ver' );
    return;
});

router.post('/borrarasignacion', function (req, res, next){
    console.log("Eliminando actividades asignadas");
    idAsignada = req.body.idAsignada;
    console.log(idAsignada);
    actividadesAsignadas.edicionAsignaciones( idAsignada, res, 'eliminar' );
    return;
});

router.post('/verActividadesHoy', function (req, res, next){
    idModulo = req.body.idModulo;
    console.log("HOLA");
    actividadesAsignadas.obtenerActividadesHoy(res, idModulo);
    return;
})

module.exports = router;
