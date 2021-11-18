const uuid = require('uuid');
const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express')
const app = express()
const {WebhookClient} = require('dialogflow-fulfillment');
const url_api = "https://www.heros.com.ve/cajaapp/api/";
const axios = require('axios');

const dialogflow = require('./dialogflow');
const sessionIds = new Map();

// var storage = new plog.storages.LocalStorage({maxSize: 200})
// Configuramos plog para que use el almacenamiento que acabamos de crear
// plog.useStorage(storage);
 
// Establecemos el nivel de detalle que queramos entre DEBUG, INFO, WARN, ERROR, FATAL
// plog.setLevel(plog.level.INFO);

// plog.info('info message');

var total_ahorros = 0;
var total_prestamos = 0;
var total_fianzas = 0;
var idempresa = "";
var lacedula = "";


wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] }
})
  .then((client) => start(client))
  .catch((erro) => {
    console.log('-------------------- sali por error ------------------')
    console.log(erro);
});


app.get('/', function (req, res) {
  res.send('Ejecutando ChatBot para Caja de Ahorro')
});


app.post('/webhook', express.json(), function (req, res) {

  const agent = new WebhookClient({ request: req, response:res });
  // plog.info('req.headers',JSON.stringify(req.headers));
  // plog.info('body ',JSON.stringify(req.body));
  // console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  // console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function probarwebhook(agent) {
    agent.add(`Esta en agente`);
  }
  
  function PedirCedula(agent)
  {
    // console.log('aqui estoy');
    const cedula = agent.parameters.number;
    // const headers = {"Content-Type":"application/json"};
    // parametros
    const parametros = {"cedula":cedula};
    const headers = {"content-type": "application/json"};
    
    // const url = url_api + "resumen_socio.php?cedula="+cedula;
    const url = url_api + "resumen_socio.php";

    // var value = 12500;
    // const formatearpeso = new Intl.NumberFormar('es-CO', {
    //   style: 'currency',
    //   currency: 'COP',
    //   minimumFractionDigits: 0
    // });
    // console.log(formatearpeso);

    return axios.post(url, parametros, headers).
    then ((response) =>
    {
          // console.log('respuesta antes del parse');
          response.data.map((wordObj) => {
            // console.log(wordObj);
            // nombre = wordObj.usuario.nombre;
            let informacion = JSON.parse(JSON.stringify(wordObj));
            // console.log(informacion)
            if (informacion.respuesta == 200)
            {
              let usuario = informacion.usuario;
              // console.log(informacion.usuario)
              // agent.add("Bienvenido(a) *" + usuario.nombre+"*");
              let mensajes = 5;
              encabeza_usuario(agent, "Bienvenido(a)",usuario.nombre);
              agent.add("*Resumen Estado de Cuenta* Actualizado al *"+ usuario.ultima_actualizacion+"*");
              // agent.add("-----------------------------------------" );
              agent.add("Total Ahorros " + usuario.ahorros);
              if (usuario.deuda_pres_cotidiano > 0)
              {
                mensajes++;
                agent.add("Total Préstamos Cotidianos " + usuario.deuda_pres_cotidianos);
              }
              if (usuario.deuda_pres_bonos > 0)
              {
                mensajes++;
                agent.add("Total Préstamos con Bonos " + usuario.deuda_pres_bonoss);
              }
              if (usuario.fianzas_recibidas > 0)
              {
                mensajes++;
                agent.add("Total Fianzas Recibidas " + usuario.fianzas_recibidass);
              }
              if (usuario.fianzas_otorgadas > 0)
              {
                mensajes++;
                agent.add("Total Fianzas Otorgadas " + usuario.fianzas_otorgadass);
              }
              // agent.add("-----------------------------------------" );
              agent.add("Total Disponibilidad " + usuario.disponibilidads);
              // agent.add(" " );
              total_ahorros = usuario.ahorros;
              total_prestamos = usuario.deuda_pres_cotidiano+usuario.deuda_pres_bonos;
              total_fianzas = usuario.fianzas_recibidas+usuario.fianzas_otorgadas;
              idempresa = usuario.idempresa;
              lacedula = cedula;
              detalle(agent, (total_prestamos), (total_fianzas));
            }
            else 
              agent.add(informacion.mensaje);
            });
    });
  }

  function encabeza_usuario(agent, titulo, nombre)
  {
    let cuento = "*"+titulo+"* ";
    cuento = cuento + "_" + nombre + "_";
    agent.add(cuento);
  }

  function detalle(agent, prestamos, fiadores)
  {
    let cuento = "Si desea información más detallada puede escribir *Ahorros*";
    if (parseFloat(prestamos) > 0)
      cuento = cuento + ", *Préstamos*";
    if (parseFloat(fiadores) > 0)
        cuento = cuento + ", *Fiadores*";
    cuento = cuento + " ó *Salir* para cerrar ésta sesión ";
    // agent.add(" " );
    agent.add(cuento);
  }

  function DetalleAhorros(agent)
  {
    const cedula = agent.parameters.cedula;
    const parametros = {"cedula":cedula};
    const headers = {"content-type": "application/json"};
    
    const url = url_api + "detalle_ahorros.php";

    return axios.post(url, parametros, headers).
    then ((response2) =>
    {
      // console.log(response2);
          response2.data.map((wordObj) => {
            let informacion = JSON.parse(JSON.stringify(wordObj));
            if (informacion.respuesta == 200)
            {
              let usuario = informacion.usuario;
              // console.log(informacion.usuario.nombre)
              // agent.add("*Detalle Ahorros* " + usuario.nombre);
              encabeza_usuario(agent, "Detalle Ahorros",usuario.nombre);
              let retenciones = informacion.retenciones;
              agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.montos);
              retenciones = informacion.aportes;
              agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.montos);
              retenciones = informacion.extras;
              if (retenciones.monto > 0)
                agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.montos);
              retenciones = informacion.dividendos;
              if (retenciones.monto > 0)
                agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.montos);
              retenciones = informacion.otros;
              if (retenciones.monto > 0)
                agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.montos);
              // agent.add("Aporte Patronal      " + usuario.aportes.monto);
              // if (usuario.extras.monto > 0)
              //   agent.add("Ahorro Voluntario    " + usuario.extras.monto);
              // if (usuario.dividendos.monto > 0)
              //   agent.add("Ahorro Capitalizable " + usuario.dividendos.monto);
              // agent.add("-----------------------------------------" );
              agent.add("*Total Ahorros        " + usuario.total_ahorrado+'*');
              detalle(agent, (total_prestamos), (total_fianzas));
            }
            else 
              agent.add(informacion.mensaje);
            });
    });
  }


  function DetallePrestamos(agent)
  {
    if (total_prestamos <= 0)
      return agent.add("Disculpe, no posee *Préstamos* registrados actualmente");
    const cedula = agent.parameters.cedula;
    const parametros = {"cedula":cedula};
    const headers = {"content-type": "application/json"};
    
    const url = url_api + "detalle_prestamos.php";
    let cuento = "";

    return axios.post(url, parametros, headers).
    then ((response) =>
    {
      // console.log(response2);
          response.data.map((wordObj) => {
            let informacion = JSON.parse(JSON.stringify(wordObj));
            if (informacion.respuesta == 200)
            {
              let usuario = informacion.usuario;
              // console.log(usuario)
              // agent.add("*Detalle Préstamos* _" + usuario+"_");
              encabeza_usuario(agent, "Detalle Préstamos",usuario);

              cuento = 'Descripción | Saldo | CC-NC | Cuota';
              agent.add(cuento)
              let prestamos = informacion.prestamos;
              prestamos.forEach(element => {
                // debugger
                // console.dir(element)
                cuento = element.descripcion+' | '+ element.saldo+' | '+ element.cuotas + ' | '+ element.cuota;
                agent.add(cuento)
                // agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.monto);
                // var arr_from_json = JSON.parse(element);
                // for (var clave in arr_from_json) {
                //   if (arr_from_json[clave] === "true") {
                //     if (clave === "estadorPagoLinea") {
                //       debugger
                //       $("#datosLinea").show();
                //       $("#botonLinea").show();
                //       trans2 = true;
                //     }
              });
              detalle(agent, (total_prestamos), (total_fianzas));
            }
            else 
              agent.add(informacion.mensaje);
            });
    });
  }

  function DetalleFiadores(agent)
  {
    if (total_fianzas <= 0)
      return agent.add("Disculpe, no posee *Fianzas* registradas actualmente");
    const cedula = agent.parameters.cedula;
    const parametros = {"cedula":cedula};
    const headers = {"content-type": "application/json"};
    
    const url = url_api + "detalle_fiadores.php";
    let titulo = false;
    let cuento_titulo = "";
    let cuento = "";

    return axios.post(url, parametros, headers).
    then ((response) =>
    {
      // console.log(response2);
          response.data.map((wordObj) => {
            let informacion = JSON.parse(JSON.stringify(wordObj));
            if (informacion.respuesta == 200)
            {
              let usuario = informacion.usuario;

              // console.log(informacion.usuario.nombre)
              // agent.add("*Detalle Fianzas Otorgadas* " + usuario.nombre);
              encabeza_usuario(agent, "Detalle Fianzas Otorgadas",usuario.nombre);

              titulo = false;
              cuento_titulo = 'Préstamo | Socio Receptor | Saldo ';
              let fiadores = informacion.fiadores;
              // console.log(fiadores)
              fiadores.forEach(element => {
                // debugger
                // console.dir(element)
                if (element.codigo_otorgante == usuario.codigo)
                {
                  if (titulo == false)
                  {
                    agent.add(cuento_titulo);
                    titulo = true;
                  }

                  cuento = element.numero_prestamo+' | '+element.nombre+' | '+ element.saldo_fianza;
                  agent.add(cuento)
                }
                // agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.monto);
                // var arr_from_json = JSON.parse(element);
                // for (var clave in arr_from_json) {
                //   if (arr_from_json[clave] === "true") {
                //     if (clave === "estadorPagoLinea") {
                //       debugger
                //       $("#datosLinea").show();
                //       $("#botonLinea").show();
                //       trans2 = true;
                //     }
              });

              // console.log(informacion.usuario.nombre)
              // agent.add("*Detalle Fianzas Recibidas* " + usuario.nombre);
              encabeza_usuario(agent, "Detalle Fianzas Recibidas",usuario.nombre);

              titulo = false;
              cuento_titulo = 'Préstamo | Socio Otorgante | Saldo ';
              fiadores.forEach(element => {
                // debugger
                // console.dir(element)
                if (element.codigo_receptor == usuario.codigo)
                {
                  if (titulo == false)
                  {
                    agent.add(cuento_titulo);
                    titulo = true;
                  }

                  cuento = element.numero_prestamo+' | '+element.nombre+' | '+ element.saldo_fianza;
                  agent.add(cuento)
                }
                // agent.add(retenciones.titulo + ' al '+retenciones.fecha+ ': '+ retenciones.monto);
                // var arr_from_json = JSON.parse(element);
                // for (var clave in arr_from_json) {
                //   if (arr_from_json[clave] === "true") {
                //     if (clave === "estadorPagoLinea") {
                //       debugger
                //       $("#datosLinea").show();
                //       $("#botonLinea").show();
                //       trans2 = true;
                //     }
              });
              detalle(agent, (total_prestamos), (total_fianzas));
            }
            else 
              agent.add(informacion.mensaje);
            });
    });
  }
  
  
//   function enviarImagen(agent)
//   {
//     agent.add(
//       new Image('https://avatars1.githubusercontent.com/u/36980416')
//     );
//   }



  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('PedirCedula', PedirCedula);
  intentMap.set('probarwebhook', probarwebhook);
  intentMap.set('DetalleAhorrosIntent', DetalleAhorros);
  intentMap.set('DetallePrestamosIntent', DetallePrestamos);
  intentMap.set('DetalleFiadoresIntent', DetalleFiadores);
  // intentMap.set('responder_image', enviarImagen);

  agent.handleRequest(intentMap);
});

function start(client) {
  // console.log(client)
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);
  console.log(hoy.toUTCString());
  client.onMessage(async (message) => {
    // console.log(' start client-> ',message)
    setSessionAndUser(message.from)
    let session = sessionIds.get(message.from);
    let payload = await dialogflow.sendToDialogFlow(message.body, session)
    console.log(' start client-> ', message)
    // console.log(message.from,  message.type, message.sender.pushname)
    // if (message.body == 'imagen')
    //   SendImgToWA(session, message.from, client)
    // else 
    {
      await client.startTyping(message.from);
      let responses = payload.fulfillmentMessages;
      let mensajes = 0;
      for (const response of responses) 
      {
        await SendMsgToWA(client, message, response);
        mensajes++;
      }
      if (message.body == "salida")
        SendImgToWA(session, message, client);
      await client.stopTyping(message.from);
      guardar_peticion(lacedula, message.from, message.body, idempresa, message.type, mensajes, message.sender.pushname)
    }
  });
}

function guardar_peticion(cedula, celular, peticion, idempresa, tipo, mensajes, nombre)
{
    const parametros = {
      "cedula":cedula, 
      "celular": celular,
      "peticion": peticion,
      "idempresa": idempresa,
      "tipo": tipo,
      "nombre": nombre,
      "mensajes": mensajes
    };
    // console.log(parametros)
    const headers = {"content-type": "application/json"};

    const url = url_api + "guardar_peticion.php";

    return axios.post(url, parametros, headers).
    then ((response) =>
    {
      // console.log('listo');
    });

}


function SendMsgToWA(client, message, response)
{
  return new Promise((resolve, reject) => {
      console.log('SendMsgToWA ->',message.body)
        client
          .sendText(message.from, response.text.text[0])
          // .stopTyping(message.from);
          .then((result) => {
            resolve(result)
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
            reject(error)
          });
  })
}

function SendImgToWA(session, message, client)
{
  return new Promise((resolve, reject) => {
      // console.log('SendImgToWA ->',message)
        client
          .sendImage(message.from, 
                     'https://www.heros.com.ve/wp-content/uploads/2020/10/HEROS.jpg',
                     'nombre de imagen', 'caption text')
                     // 'https://avatars1.githubusercontent.com/u/36980416', 
          .then((result) => {
            resolve(result)
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
            reject(error)
          });
  })
}

async function setSessionAndUser(senderId) {
  try {
    if (!sessionIds.has(senderId)) {
      sessionIds.set(senderId, uuid.v1());
    }
  } catch (error) {
    throw error;
  }
}
  

app.listen(3000, () => {
  console.log('Ejecutando en puerto 3000');
}) 

/*
https://three-screeching-suit.glitch.me
https://wppconnect-team.github.io/wppconnect/pages/Getting%20Started/basic-functions.html#sendimage
*/