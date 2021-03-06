/*jslint
    indent: 4, unparam: true
*/
var mysql = require('mysql');
var credenciales = require('../database/credencialesbd.json');
var listar = require('../components/listarActividades.js');
var multiparty = require("multiparty");
var fs = require('fs');
var path = require('path');

var modifica = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var id = fields.idModActividad;
        var nombre = fields.nombreModActividad;
        var descripcion = fields.descripcionModActividad;
        var nombreoriginal = files.imaMod[0].originalFilename;
        var ext = path.extname(nombreoriginal);
        var categoria = fields.roles;
        var img = files.imaMod[0];

        if(nombreoriginal == '') {nombreoriginal = 'NULL';}

        var bd = mysql.createConnection(credenciales);   
        var sql = 'UPDATE Actividades SET nombre = ?, descripcion = ?, idCategoriaAct = ?, imagen = ? WHERE idActividad = ?';
		var params = [nombre, descripcion, categoria, nombreoriginal, fields.idModActividad];

        console.log(sql);

        bd.connect();
		sql = mysql.format(sql, params);
        bd.query(sql, function (err, resultado) {
            if (err) {
                bd.end();
                console.log(err);
            }
           
            fs.readFile(img.path, function (err, data) {
                var idAc = id + ext;
                var path = "./public/images/actividades/" + idAc;
                fs.writeFile(path, data, function (err) {
                    if (err) {
                        console.log(err);
                    } else {                        
                            listar.listar(res);
                    }
                });
            });
        });
    });
};

module.exports = {
    'modifica' : modifica
};
