'use strict';

var express = require('express');
var router = express.Router();

var modulos = require('../components/modulos.js');
var cuadritos = require('../components/modulos.js');
var huerta = require('../components/huerta.js');

// Checar privilegios.
router.get(/.*/, function(req, res, next) {
	if (req.session.usuario.permisos.indexOf("crear modulo") < 0 && req.session.usuario.permisos.indexOf("modificar modulo") < 0) {
		var err = new Error("No tienes permiso para hacer esta acción.");
		err.status = 403;
		next(err);
	} else {
		next();
	}
});
router.post(/.*/, function(req, res, next) {
	if (req.session.usuario.permisos.indexOf("crear modulo") < 0 && req.session.usuario.permisos.indexOf("modificar modulo") < 0) {
		var err = new Error("No tienes permiso para hacer esta acción.");
		err.status = 403;
		next(err);
	} else {
		next();
	}
});

router.post('/crear/:id(\\d+)', function (req, res, next) {
 /* res.send('respond with a resource');*/
  var altoA = [];
  var anchoA = [];
  var alto = req.body.alto;
  var ancho = req.body.ancho;
  var cuadritos = req.body.cuadritos;
  if (alto*ancho > 1300) {
	var err = new Error("El tamaño de huerta seleccionado es demasiado grande");
	next(err);
	return;
  }
  while (alto > 0) {
    altoA.push(alto);
    alto--;
  }
  while (ancho > 0) {
    anchoA.push(ancho);
    ancho--;
  }
  huerta.sectoresPosibles(function (errSectores, sectores) {
    if (errSectores) {
      console.log("Err Sectores");
    } else {
      res.render('crearHuerta', {title: 'Crear Croquis', alto: altoA, ancho: anchoA, usuario: req.session.usuario, cuadritos: cuadritos, sectores: sectores});
    }
  });
});


var eliminaHuerta = function (idModulo) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      //Guardar el cuadrito
      connection.query("DELETE FROM Cuadritos USING Cuadritos, Sectores, Modulos WHERE Sectores.idModulos = '"+idModulo+"' AND Cuadritos.idSectores = Sectores.idSector", function (err, rows, fields) {
        //Funcion callback del query
        if (!err) {
          //Si no ocurrio un error al realizar la query
          
        } else {
          //Error al ejecutar el query
          console.log(err);
        }
      });
      //Termina la conexion
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end();
  });
  
}

var seleccionaContenidoCuadrito = function () {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      connection.query("SELECT * from ContenidoCuadritos", function (err, rows, fields) {
        if (!err) {
          if(rows.length > 0) {
            //Existe
            console.log("Success: selectSector encontrado");
            idSector=rows[0].idSector;
            seleccionaCuadrito(idModulo, idSector, cuadrito);
            if(cuadritos.length > _renglon+1)
              selectSector(idModulo, cuadritos, _renglon+1);
          } else {
            //No existe
            console.log("Success: selectSector NO encontrado");
            idSector = insertaSector(idModulo, cuadrito["sector"], cuadrito, _renglon, cuadritos);
          }
          
        } else {
          console.log('Error while performing Query. (Searching if sector exist)');
        } 
      });
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end(); 
  });  
}

var seleccionaCuadrito = function (idModulo, idSector, cuadrito) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      //Guardar el cuadrito
      connection.query("SELECT DISTINCT idCuadrito from Cuadritos, Sectores, Modulos WHERE Sectores.idModulos = '"+idModulo+"' AND Sectores.idSector = Cuadritos.idSectores AND Cuadritos.x = '" + cuadrito["ejeX"] + "'   AND Cuadritos.y = '" + cuadrito["ejeY"] + "' ", function (err, rows, fields) {
        //Funcion callback del query
        if (!err) {
          //Si no ocurrio un error al realizar la query
          if(rows.length > 0) {
            //Existe el cuadrito
            var idCuadrito = rows[0].idCuadrito;
            actualizaCuadrito(idModulo, idSector, cuadrito, idCuadrito);
          } else {
            //No existe el cuadrito
            insertaCuadrito(idModulo, idSector, cuadrito);
          }
        } else {
          //Error al ejecutar el query
          console.log(err);
        }
      });
      //Termina la conexion
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end();
  });
}

var actualizaCuadrito = function (idModulo, idSector, cuadrito, idCuadrito) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      //Guardar el cuadrito
      connection.query('UPDATE Cuadritos SET Cuadritos.idSectores = '+idSector+', Cuadritos.idContenidoCuadritos = '+cuadrito["type"]+' WHERE Cuadritos.idCuadrito = '+idCuadrito+'', function (err, rows, fields) {
        //Funcion callback del query
        if (!err) {
          //Si no ocurrio un error al realizar la query
        } else {
          //Error al ejecutar el query
          console.log(err);
        }
      });
      //Termina la conexion
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end();
  });
}

var insertaCuadrito = function (idModulo, idSector, cuadrito) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      //Guardar el cuadrito
      connection.query("INSERT INTO Cuadritos (idSectores, idContenidoCuadritos, x, y) VALUES ('" + idSector + "', '" + cuadrito["type"] + "', '" + cuadrito["ejeX"] + "', '" + cuadrito["ejeY"] + "')", function (err, rows, fields) {
        //Funcion callback del query
        if (!err) {
          //Si no ocurrio un error al realizar la query
        } else {
          //Error al ejecutar el query
          console.log(err);
        }
      });
      //Termina la conexion
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end();
  });
  
}

var insertaSector = function (idModulo, numeroSector, cuadrito, _renglon, cuadritos) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      //Guardar el cuadrito
      connection.query("INSERT INTO Sectores (idModulos, numeroSector) VALUES ('" + idModulo + "', '" + numeroSector + "')", function (err, rows, fields) {
        //Funcion callback del query
        if (!err) {
          //Si no ocurrio un error al realizar la query
          seleccionaCuadrito(idModulo, rows.insertId, cuadrito);
        } else {
          //Error al ejecutar el query
          console.log('Error while performing Query. (insertar sector)');
        }
        if(cuadritos.length > _renglon+1)
          selectSector(idModulo, cuadritos, _renglon+1)
      });
      //Termina la conexion
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end();
  });
}

var selectSector = function (idModulo, cuadritos, _renglon) {
  var cuadrito = cuadritos[_renglon];

  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      connection.query("SELECT idSector from Sectores WHERE idModulos = '" + idModulo + "' AND numeroSector = '" + cuadrito['sector'] + "'", function (err, rows, fields) {
        if (!err) {
          var idSector;
          if(rows.length > 0) {
            //Existe
            console.log("Success: selectSector encontrado");
            idSector=rows[0].idSector;
            seleccionaCuadrito(idModulo, idSector, cuadrito);
            if(cuadritos.length > _renglon+1)
              selectSector(idModulo, cuadritos, _renglon+1);
          } else {
            //No existe
            console.log("Success: selectSector NO encontrado");
            idSector = insertaSector(idModulo, cuadrito["sector"], cuadrito, _renglon, cuadritos);
          }
          
        } else {
          console.log('Error while performing Query. (Searching if sector exist)');
        } 
      });
    } else {
      console.log("Error connecting database ... \n");  
    }
    connection.end(); 
  });  
}

var creaConexion = function () {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      console.log("Database is connected ... \n");
      return connection;
    } else {
      console.log("Error connecting database ... \n");  
    }
  });
}


var tamHuerta = function (idModulo, alto, ancho) {
  var credenciales = require('../database/credencialesbd.json');
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  //Crea la coneccion
  var connection = mysql.createConnection(credenciales);
  //Prueba si se conecto correctamente a la base de datos
  connection.connect(function (err) {
    if(!err) {
      connection.query("UPDATE Modulos set alto = '"+ alto +"', ancho = '"+ ancho +"' WHERE idModulo = '"+ idModulo + "'", function (err, rows, fields) {
        if (!err) {
          console.log("Success tamHuerta");
        } else {
          console.log('Error while performing Query. (tamHuerta)');
        }
      });
      connection.end();
    } else {
      console.log("Error connecting database ... \n");  
    }
  });
}


router.post("/crearGuardar", function (request, response, next) {
  //Carga el modulo de mySQL
  var mysql = require('mysql');
  
  var cuadritos = JSON.parse(request.body.cuadritos);
  var idModulo = request.body.modulo;
  //Ver si existe el sector, si no crearlo
  var renglones = cuadritos.length;
  //Alto y ancho
  var ancho = request.body.ancho;
  var alto = request.body.alto;
  tamHuerta(idModulo, alto, ancho);
  //Existe el sector ¿?
  selectSector(idModulo, cuadritos, 0);
  //Termina la conexion
  //Redirecciona a una URL
  //response.redirect('/contador');
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify(idModulo));

});

router.get('/formulario', function (req, res, next) {
 /* res.send('respond with a resource');*/
  res.render('formularioCrearHuerta', {title: 'Form', usuario: req.session.usuario});
});


router.get('/editar/:id(\\d+)', function (req, res, next) {
 /* res.send('respond with a resource');*/
  var idModulo = req.params.id;
  modulos.mostrar(idModulo, function (err, modulos) {
    if(err) {
      console.log(err);
    } else {
      var altoA = [];
      var anchoA = [];
      var alto = modulos[0].alto;
      var ancho = modulos[0].ancho;
      while (alto > 0) {
        altoA.push(alto);
        alto--;
      }
      while (ancho > 0) {
        anchoA.push(ancho);
        ancho--;
      }
      cuadritos.desplegar(idModulo, function (err, cuadritos) {
        if (err) {
          console.log(err);
        }
        else {
          //res.render('vermodulos', { titulo: 'Módulo ', modulo: modulos[0], usuario: req.session.usuario, listaAdmins: usuarios, barraLateral: 'modulos', alto: alto, ancho: ancho, cuadritos: cuadritos});
          huerta.sectoresPosibles(function (errSectores, sectores) {
            if (errSectores) {
              console.log("Err Sectores");
            } else {
              res.render('crearHuerta', {title: 'Editar Croquis', alto: altoA, ancho: anchoA, usuario: req.session.usuario, cuadritos: cuadritos, sectores: sectores});
            }
        });
        }    
      });
    }
 });
});

//Elimina la Huerta
router.get('/eliminar/:id(\\d+)',function (req, res, next) {

  var idModulo = req.params.id;
  var al = cuadritos.alto;
  var an = cuadritos.ancho;
  eliminaHuerta(idModulo);
  modulos.borraHuerta(idModulo, al, an, function (err, cuadritos) {
        if (err) {
          console.log(err);
        }
        else {
          res.redirect('/modulos/'+idModulo+'');
        }    
      });
  
  


});

module.exports = router;
