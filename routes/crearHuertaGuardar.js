var express = require('express');
var router = express.Router();


//////////////////
var insertaCuadrito = function(idModulo, idSector, cuadrito){
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  connection = creaConexion();
  //Guardar el cuadrito
  connection.query("INSERT INTO Cuadritos (idModulos, idSectores, contenido, x, y) VALUES ('" + idModulo + "', '" + idSector + "', '" + cuadrito["type"] + "', '" + cuadrito["ejeX"] + "', '" + cuadrito["ejeY"] + "')", function(err, rows, fields) {
    //Funcion callback del query
    if (!err){
      //Si no ocurrio un error al realizar la query
    } else{
      //Error al ejecutar el query
      console.log('Error while performing Query. (insertar cuadrito)');
    }
  });
  //Termina la conexion
  connection.end();
}

var insertaSector = function(idModulo, numeroSector){
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  connection = creaConexion();
  //Guardar el cuadrito
  connection.query("INSERT INTO Sectores (idModulos, numeroSector) VALUES ('" + idModulo + "', '" + numeroSector + "')", function(err, rows, fields) {
    //Funcion callback del query
    if (!err){
      //Si no ocurrio un error al realizar la query
      return rows[0];
    } else{
      //Error al ejecutar el query
      console.log("INSERT INTO Sectores (idModulos, numeroSector) VALUES ('" + idModulo + "', '" + numeroSector + "')");
      console.log('Error while performing Query. (insertar sector)');
      //console.log(err);
    }
  });
  //Termina la conexion
  connection.end();
}

var creaConexion = function(){
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'tiuxin918273',
    database : 'qzardb'
  });
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function(err){
    if(!err) {
      console.log("Database is connected ... \n"); 
    } else {
      console.log("Error connecting database ... \n");  
    }
  });
  return connection;
}


router.post("/", function(request,response,next){
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  connection = creaConexion();
  var cuadritos = JSON.parse(request.body.cuadritos);
  var idModulo = request.body.modulo;
  //Ver si existe el sector, si no crearlo
  var renglones = cuadritos.length;
  console.log("renglones: " + renglones);
  for(var _renglon = 0; _renglon < renglones; _renglon++){
    cuadrito=cuadritos[_renglon];
    //Existe el sector ¿?
    connection.query("SELECT idSector from Sectores WHERE idModulos = '" + idModulo + "' AND numeroSector = '" + cuadrito['sector'] + "'", function(err, rows, fields) {
      if (!err) {
        var idSector;
        if(rows.length > 0){
          //Existe
          console.log("Select exitoso");
          idSector=rows[0];
        } else {
          //No existe
          console.log("Select no exitoso");
          idSector = insertaSector(idModulo, cuadrito["sector"])
        }
        insertaCuadrito(idModulo, idSector, cuadrito);
      } else {
        console.log('Error while performing Query. (Searching if sector exist)');
        //console.log(cuadrito['type']);
        //console.log("SELECT idSector from Sectores WHERE idModulos = '" + idModulo + "' numeroSector = '" + cuadrito['sector'] + "' ");
      }
    });
  }
  //Termina la conexion
  connection.end();
  //Redirecciona a una URL
  response.redirect('/contador');
});





//////////////////


module.exports = router;
