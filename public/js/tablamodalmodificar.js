$(document).on("click", ".modificar", function () {	
	var obj = (this).closest("tr");	
	var id = $(obj).find(".id").html();
	var nombre = $(obj).find(".nombre").html();
	var descripcion = $(obj).find(".descripcion").html();
	var img = $(obj).find(".img").html();
	var categoria = $(obj).find(".idcategoria").html();

	document.getElementById('MRT').value = categoria;
	console.log(categoria);
	document.getElementById('MIDA').value = id;
	document.getElementById('MNA').value = nombre;
	document.getElementById('MDA').value = descripcion;
	document.getElementById('MIA').value = img;
	
	
});


//Ninja para pasar el id
$(document).on("click", ".eliminarModal", function (){
	var obj = (this).closest("tr");	
	var id = $(obj).find(".id").html();
	$("input.ninja").attr("value", id);
	console.log($("input.ninja"));
});



$(document).on("click", ".eliminar", function () {
	
	var id = $("input.ninja").attr("value");
	console.log(id);
	$.post("/actividades/eliminaactividad",
          {
              'id': id
          },
          function(data, status){
              location.reload();
          });
});
