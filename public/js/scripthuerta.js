function rellenaCuadritos(cuadritos){
	var huerta = $(".renglon");


	$(cuadritos).each(function(){

		var target = $(huerta[$(this)[0].y]).find(".cuadrito")[$(this)[0].x];
        if($(this)[0].nombre != 'Vacío') {
          // $(target).html('<span class="poste"><i class="glyphicon glyphicon-grain" style="color: '+ $(this)[0].color +'"></i><strong style="color: '+ $(this)[0].color +'">'+ $(this)[0].numeroSector + '</strong></span>');
          $(target).html('<span class="poste"><strong style="color: '+ $(this)[0].color +'">'+ $(this)[0].numeroSector + '</strong></span>');
        }
		$(target).attr('color', $(this)[0].color);
		$(target).attr('title', $(this)[0].nombre);
		$(target).attr('data-toggle', "tooltip");
		$(target).attr('data-placement', "top");
		$(target).attr('data-container', "body");
	});


}

$(document).ready(
  function () {
    rellenaCuadritos(cuadritos);
    $('[data-toggle="tooltip"]').tooltip(); 
  }
);