var pristine;
window.onload = function () {
  cambiarMensajes();
  var form = document.getElementById("form");
  // create the pristine instance
  pristine = new Pristine(form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // console.log(form);
    // console.log(new FormData(form));
    // var formdata = new FormData(form)
    // console.log(formdata);
    // var data={}
    // for (var [key, value] of formdata.entries()) { 
    //   data[key]=value
    // }
    var data = $(form).serialize()
    // check if the form is valid
    var valid = pristine.validate(); // returns true or false
    console.log(valid);
    if (valid) {
      console.log(data);
      $.ajax({
        url: '/procesardoc',
        data: data,
        type: 'POST',
        success: function(data){
          console.log(data);
        }
      });
    }
  });
}

function cambiarMensajes() {
  var textInputs =$('input[type=text]') 
  textInputs.each(function( index ) {
    $(this).attr('data-pristine-required-message', "Este campo es requerido" )
  });
  var numberInputs =$('input[data-pristine-type=number]') 
  numberInputs.each(function( index ) {
    $(this).attr('data-pristine-number-message', "Este campo debe ser solo numeros" )
  });
}

function nuevaTransaccion() {
  console.log($('.transaccion-group'));
  console.log($('.transaccion-group').last());
  $('#listo').before($('.transaccion-group')[0].innerHTML )
  pristine.reset() 
}