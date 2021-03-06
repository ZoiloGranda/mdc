var pristine;
var clienteNumero = 0;
window.onload = function () {
  init();
  // create the pristine instance
  pristine = new Pristine(document.getElementById('form'));
}
function init(){
  cambiarMensajes()
  bindSaldoInicialChange();
  $('form').submit(function(e) {
    e.preventDefault();
    var data = $('form').serialize()
    console.log(data);
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
          handleSuccess(data)
        },
        error:function (jqXHR) {
          console.log(jqXHR);
          handleErrors(jqXHR.responseJSON)
        }
      });
    }
  });
  
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
  
  $('#nuevaTransaccion').click(function() {
    $('.transaccion-group').append($('.transaccion-template')[0].innerHTML )
    pristine.reset() 
  })
  
  
  function bindSaldoInicialChange(){
    $('input[name=saldo_inicial]').change(function (e) {
      var saldoInicialCliente = parseFloat($(e.target).val());
      var clienteNumero = e.target.dataset.clienteNumero
      var saldo_inicial_empresa = parseFloat($('input[name=saldo_inicial_empresa]').val())
      var ganancia_neta_empresa = parseFloat($('input[name=ganancia_neta_empresa]').val())
      var gananciaCliente = saldoInicialCliente*ganancia_neta_empresa/saldo_inicial_empresa;
      var saldoFinal = saldoInicialCliente+gananciaCliente
      $(`input[name=saldo_final][data-cliente-numero=${clienteNumero}]`).val(saldoFinal)
      var rendimiento = gananciaCliente*100/saldoInicialCliente;
      $(`input[name=rendimiento][data-cliente-numero=${clienteNumero}]`).val(rendimiento);
    })
  }
  
  
  $('#nuevoCliente').click(function() {
    var addClientNumero = $('.client-template')[0].innerHTML.replace(/data-cliente-numero="[0-9]+"/g,`data-cliente-numero="${clienteNumero+1}"`)
    clienteNumero++;
    $('.client-group').append(addClientNumero)
    bindSaldoInicialChange();
    pristine.reset() 
  })
  
  function handleErrors(responseJSON) {
    // if (responseJSON.errorCode==='BUSY') {
    $('#ex1').modal();
      alert(JSON.stringify(responseJSON, null, 3))
    // }else {
      // alert('Algun error paso, llamame a ver')
    // }
  }
}
















