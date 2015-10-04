/*jslint
  indent: 4, unparam: true
*/
'use strict';

var mysql = require('mysql');

var credenciales = require('../database/credencialesbd.json');

function listarAdminModulos(callback) {

    // POR HACER:
    // Filtro de roles (o por privilegios) bien (cuando estén mejor definidos).
    var bd = mysql.createConnection(credenciales),
        sql = 'SELECT * FROM Usuarios WHERE activo = 1 AND idRoles = 1 OR idRoles = 2 AND idUsuario NOT IN (SELECT usuarioAdministrador FROM Modulos WHERE activo = 1);';

    bd.connect();

    // Ejecuta consulta.
    bd.query(sql, function (err, resultados) {
        if (err) {
            bd.end();
            return callback(err);
        }
        bd.end();
        return callback(null, resultados);
    });
}

module.exports = {
    'listarAdminModulos' : listarAdminModulos
};
