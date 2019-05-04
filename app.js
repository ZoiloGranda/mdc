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

app.post('/procesardoc', function (req, res) {
  console.log(req.body);
  res.send({message:'ok'})
  formatearTransacciones(req.body)
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function formatearTransacciones(data) {
  data.transacciones=[];
  var variasTransacciones = data.fecha_transaccion instanceof Array;
  console.log(data.fecha_transaccion instanceof Array);
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
      fecha_transaccion:data.fecha_transaccion[i],
      transaccion_id:data.transaccion_id[i],
      evento_negocio:data.evento_negocio[i],
      debito:data.debito[i],
      credito:data.credito[i]
    }
  }
  delete data.fecha_transaccion
  delete data.transaccion_id
  delete data.evento_negocio
  delete data.debito
  delete data.credito
  console.log(data);
  generarDoc(data)
}

function generarDoc(data) {
  //Load the docx file as a binary
  var content = fs
  .readFileSync(path.resolve(__dirname, 'plantillas/standard.docx'), 'binary');
  var zip = new JSZip(content);
  var doc = new Docxtemplater();
  doc.loadZip(zip);
  //set the templateVariables
  doc.setData(data);
  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
    console.log('output generado');
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
  var buf = doc.getZip()
  .generate({type: 'nodebuffer'});
  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(__dirname, 'output.docx'), buf);
}
