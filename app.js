var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/styles', express.static(__dirname + '/styles/'));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname,'views/index.html'));
});

var formatearTransacciones = function (req, res, next) {
  req.responseMessage = {};
  var data = req.body;
  data.transacciones=[];
  var variasTransacciones = data.fecha_transaccion instanceof Array;
  if (variasTransacciones) {
    for (var i = 0; i < data.fecha_transaccion.length; i++) {
      data.transacciones[i]={
        fecha_transaccion:data.fecha_transaccion[i],
        transaccion_id:data.transaccion_id[i],
        evento_negocio:data.evento_negocio[i],
        debito:data.debito[i],
        credito:data.credito[i]
      }
    }
  }else {
    data.transacciones[0]={
      fecha_transaccion:data.fecha_transaccion,
      transaccion_id:data.transaccion_id,
      evento_negocio:data.evento_negocio,
      debito:data.debito,
      credito:data.credito
    }
  }
  delete data.fecha_transaccion;
  delete data.transaccion_id;
  delete data.evento_negocio;
  delete data.debito;
  delete data.credito;
  next()
}

var formatearClientes = function (req, res, next) {
  var data = req.body
  var dataPorClientes = {}
  var dataPorClientes = Object.assign(dataPorClientes, data);
  var variosClientes = data.nombre instanceof Array;
  if (variosClientes) {
    for (var i = 0; i < data.nombre.length; i++) {
      dataPorClientes.nombre = data.nombre[i];
      dataPorClientes.direccion = data.direccion[i];
      dataPorClientes.numero_cliente = data.numero_cliente[i];
      dataPorClientes.fecha_inicio = data.fecha_inicio[i];
      dataPorClientes.fecha_fin = data.fecha_fin[i];
      dataPorClientes.saldo_inicial = data.saldo_inicial[i];
      dataPorClientes.saldo_final = data.saldo_final[i];
      dataPorClientes.rendimiento = data.rendimiento[i];
      req.dataPorClientes = dataPorClientes;
      if (i===data.nombre.length) {
        req.ultimoCliente = true;
      }
      next()
    }
  }else {
    dataPorClientes.nombre = data.nombre;
    dataPorClientes.direccion = data.direccion;
    dataPorClientes.numero_cliente = data.numero_cliente;
    dataPorClientes.fecha_inicio = data.fecha_inicio;
    dataPorClientes.fecha_fin = data.fecha_fin;
    dataPorClientes.saldo_inicial = data.saldo_inicial;
    dataPorClientes.saldo_final = data.saldo_final;
    dataPorClientes.rendimiento = data.rendimiento;
    req.dataPorClientes = dataPorClientes;
    req.ultimoCliente = true;
    next()
  }
}

var generarDoc = function(req, res, next){
  var dataPorClientes = req.dataPorClientes;
  //Load the docx file as a binary
  var content = fs
  .readFileSync(path.resolve(__dirname, 'plantillas/standard.docx'), 'binary');
  var zip = new JSZip(content);
  var doc = new Docxtemplater();
  doc.loadZip(zip);
  //set the templateVariables
  doc.setData(dataPorClientes);
  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
    console.log('documento renderizado');
  }
  catch (error) {
    var e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({error: e}));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
  }
  var buf = doc.getZip().generate({type: 'nodebuffer'});
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  var filePath = path.resolve(`${__dirname}/documentosProcesados/${dataPorClientes.nombre}.docx`);
  try {
    fs.writeFileSync(filePath, buf);
    req.responseMessage[dataPorClientes.numero_cliente]=`Documento de ${dataPorClientes.nombre} guardado`
    next()
  } catch (e) {
    console.log(e);
    if (e.code==='EBUSY') {
      req.responseMessage[dataPorClientes.numero_cliente]=`El documento que vas a generar esta abierto en word,
        cierralo y lo vuelves a intentar,
        se estaba procesando ${dataPorClientes.nombre}`,
      res.status(400);
    }
    next()
  }
}

var enviarRespuesta = function(req, res, next){
  console.log('req.ultimoCliente ',req.ultimoCliente);
  console.log('req.responseMessage ',req.responseMessage);
  if (req.ultimoCliente) {
    res.send(req.responseMessage)
  }
}

app.use(formatearTransacciones);
app.use(formatearClientes);
app.use(generarDoc);
app.use(enviarRespuesta);

app.post('/procesardoc', function (req, res, next) {
  console.log(req.body);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

