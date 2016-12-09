var $clock = $("#clock");

//Funcion que extrae los parametros pasados por url
function getGET(){
   var loc = document.location.href;
   var getString = loc.split('?')[1];
   var GET = getString.split('&');
   var get = {};//this object will be filled with the key-value pairs and returned.

   for(var i = 0, l = GET.length; i < l; i++){
      var tmp = GET[i].split('=');
      get[tmp[0]] = unescape(decodeURI(tmp[1]));
   }
   return get;
}

var get = getGET();
var chatContainerMedico = document.querySelector('.server');
var chatContainerPaciente = document.querySelector('.client');
var clockContainer = document.querySelector('#clock');
var boxtxt = document.querySelector('.form');

//Enviando mensajes
document.getElementById('sendtxt').onclick = function() {
    appendDIV(document.getElementById('input-text-chat').value);
    connection.send(document.getElementById('input-text-chat').value);
    document.getElementById('input-text-chat').value = '';
};

//Ingresando a la sala del chat
document.getElementById('join').onclick = function() {
	if( typeof get.uid == "undefined" || get.uid == null ){
		get.uid = prompt("Ingrese su nombre...", "");
	}
	if ( get.uid == null ) return;
    disableInputButtons();
    connection.extra = {
        fullname: get.uid,
        rol: get.r
    };
	var hrtotal = getDiferenciaHora(get.hc, get.tp);
	initializeClock('clock', hrtotal);
    connection.sessionid = get.uid;
    connection.userid = get.uid;
    connection.rol = get.r;
    connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
        if(!isRoomExists) {
            connection.getAllParticipants().splice(0,1,get.uid);
            showRoomURL(roomid);
        }
    });
};

//Verifica los datos ingresados en el campo
document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    appendDIV( this.value );
    connection.send(this.value);
    this.value = '';
};

//Funcion que cierra la session
document.getElementById('btn-leave-room').onclick = function() {
    this.disabled = true;
    if(connection.isInitiator) {
        connection.closeEntireSession(function() {
            document.querySelector('h1').innerHTML = 'La session termino, todos los participantes han abandonado!.';
        });
    }
    else {
        connection.leave();
    }
};

function mostrarhora(){
    var f       = new Date();
    var hours   = f.getHours();
    var minutes = f.getMinutes();
    var seconds = f.getSeconds();
    var dn      = "AM";
    if ( hours > 12 ){
        dn    = "PM";
        hours = hours-12;
        if ( hours <= 9 )
        hours = "0"+hours;
    }
    
    if ( hours == 0 )
        hours = 12;
    if ( minutes <= 9 )
        minutes = "0"+minutes;
    if ( seconds <= 9 )
        seconds = "0"+seconds;
    
    return hours+":"+minutes+":"+seconds+" "+dn;
}

function getTimeRemaining(endtime) {
	var t = Date.parse(endtime) - Date.parse(new Date());
	var seconds = Math.floor((t / 1000) % 60);
	var minutes = Math.floor((t / 1000 / 60) % 60);
	var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
	return {
		'total': t,
		'hours': hours,
		'minutes': minutes,
		'seconds': seconds
	};
}

function initializeClock(id, endtime) {
	var clock = document.getElementById(id);
	var hoursSpan = clock.querySelector('.hours');
	var minutesSpan = clock.querySelector('.minutes');
	var secondsSpan = clock.querySelector('.seconds');

	function updateClock() {
		var t = getTimeRemaining(endtime);
		hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
		minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
		secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

		if (t.total <= 0) {
			clearInterval(timeinterval);
		}
	}

	updateClock();
	var timeinterval = setInterval(updateClock, 1000);
}

function getDiferenciaHora( hra_ini, duration ){
    var f       = new Date(hra_ini);
    var year    = f.getFullYear();
    var month   = f.getMonth();
    var day     = f.getDay();
    var hours   = f.getHours();
    var minutes = f.getMinutes();
    var seconds = f.getSeconds();
	var hra_cta = hra_ini.split(":");
    var dn      = "AM";
    if ( hours > 12 ){
        dn    = "PM";
        hours = hours-12;
        if ( hours <= 9 )
        hours = "0"+hours;
    }
	
	if( duration > 60 ){
		dr_hr += 1;
		dr_min = duration % 60;
	}else{
		dr_hr = 0;
		dr_min = parseInt(duration);
	}
    
	
    if ( hours == 0 )
        hours = 12;
    if ( minutes <= 9 )
        minutes = "0"+minutes;
    if ( seconds <= 9 )
        seconds = "0"+seconds;
	
	if( hours <= ( parseInt( hra_cta[0] ) + dr_hr ) ){
		if( minutes > ( parseInt(hra_cta[1]) + dr_min )  ){
			hrs_restantes = 1;
			min_restantes = 1;
		}else{
			hrs_restantes = 1;
			min_restantes = ( parseInt(hra_cta[1]) + dr_min ) - parseInt(minutes);
		}
	}
	
    return f;
} 

//Funcion para crear un elemento div, con los datos pasados por el usuario.
function appendDIV(event) {
    var msj, usr, rol;
    var row = document.createElement('tr');
    if( typeof event === 'string' ){
        msj = event;
        usr = get.uid;
        rol = 1;
    }else{
        msj = event.data;
        usr = event.extra.fullname;
        rol = event.extra.rol;
    }
    if( rol === 1 ){
        row.innerHTML = "<td class='col-xs-6 col-sm-5 col-md-5' style='text-align:center;'>"+usr+" ("+mostrarhora()+") dice:</td><td class='col-xs-6 col-sm-7 col-md-7' style='text-align:center;background-color:#885bc6;color:white;'>"+msj+"</td>";
        chatContainerMedico.insertBefore(row, chatContainerMedico.firstChild);
    }else{
        row.innerHTML = "<td class='col-xs-6 col-sm-5 col-md-5' style='text-align:center;'>"+usr+" ("+mostrarhora()+") dice:</td><td class='col-xs-6 col-sm-7 col-md-7' style='text-align:center;background-color:#00a5b4;color:white;'>"+msj+"</td>";
        chatContainerPaciente.insertBefore(row, chatContainerPaciente.firstChild);
    }
    row.tabIndex = 0;
    row.focus();

    document.getElementById('input-text-chat').focus();
}

var socket       = new WebSocket('wss://redmedix.herokuapp.com');
socket.onopen    = function(e) {
	console.log(e);
};
socket.onmessage = function() {};


var SIGNALING_SERVER = 'https://redmedix.herokuapp.com';
connection.openSignalingChannel = function(config) {
   var channel = config.channel || this.channel || 'default-namespace';
   var sender = Math.round(Math.random() * 9999999999) + 9999999999;

   io.connect(SIGNALING_SERVER).emit('new-channel', {
      channel: channel,
      sender : sender
   });

   var socket = io.connect(SIGNALING_SERVER + channel);
   socket.channel = channel;

   socket.on('connect', function () {
      if (config.callback) config.callback(socket);
   });

   socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data  : message
        });
    };

   socket.on('message', config.onmessage);
};

//Conexion de la session
var connection = new RTCMultiConnection();
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'Video Chat';
connection.getAllParticipants().splice(0,1,get.uid);
connection.sessionid = get.uid;
connection.userid = get.uid;

//Variables de configuracion con respecto a los tipos de datos que acepta.
connection.session = {
    video: true,
    audio: true,
    data: true
};

//Configuracion de objeto mandatory
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

//Crear el contenedor de video.
connection.videosContainer = document.getElementById('videos-container');

//Agrega un evento a la conexion cuando transmite.
connection.onstream = function(event) {
	document.querySelector('h1').innerHTML = 'Estas comunicado con: ' + event.extra.fullname;
    var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
    var mediaElement = getMediaElement(event.mediaElement, {
        title: event.extra.fullname,
        buttons: ['full-screen', 'mute-audio'],
        width: width,
        clase: 'col-xs-12 col-sm-6 col-md-6',
        showOnMouseEnter: true
    });

    connection.videosContainer.appendChild(mediaElement);

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);
    mediaElement.id = event.streamid;
    clockContainer.style.display = "block";
	var newItem = document.createElement("h2");
    var textnode = document.createTextNode(event.extra.fullname);
    newItem.appendChild(textnode);
	mediaElement.insertBefore( newItem, mediaElement.childNodes[0] );
};

//Agrega funcion cuando termina de transmitir
connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if(mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

//Agrega funcion cuando llega un mensaje.
connection.onmessage = function(event){
    appendDIV(event);
};
    

//Agrega el contenedor de archivos
connection.filesContainer = document.getElementById('file-container');

//Agrega funcion cuando abre la conexion.
connection.onopen = function() {
    document.getElementById('txtdiv').style.display = 'block';
    boxtxt.style.display = 'block';
    document.getElementById('sendtxt').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;
};

connection.onExtraDataUpdated = function(event) {
	document.querySelector('h1').innerHTML = 'Estas comunicado con: ' + event.extra.fullname;
};

//Agrega funcion cuando un usuario cierra la conexion.
connection.onclose = function() {
    if( connection.getAllParticipants().length == 1 ) {
        document.querySelector('h1').innerHTML = 'Ha finalizado la comunicacion, recuerda que estabas en conexion con: ' + connection.getAllParticipants().join(', ');
    }else {
        document.querySelector('h1').innerHTML = 'La session termino, todos los participantes han abandonado!.';
    }
};

//Agrega funcion cuando la sesion entera es cerrada.
connection.onEntireSessionClosed = function(event) {
    document.getElementById('sendtxt').disabled = true;
    document.getElementById('input-text-chat').disabled = true;
    document.getElementById('btn-leave-room').disabled = true;
    document.getElementById('join').disabled = false;
    document.getElementById('room-id').disabled = false;
    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });
    // don't display alert for moderator
    if(connection.userid === event.userid) return;
    document.querySelector('h1').innerHTML = 'Entire session has been closed by the moderator: ' + event.userid;
};

//Funcion que verifica si el nombre del usuario esta disponible.
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    connection.join(useridAlreadyTaken);
};


connection.connectSocket( function() {
    alert('Successfully connected to socket.io server.');
    connection.socket.emit('new-message', 'hello');
});


//Funcion que muestra los botones
function disableInputButtons() {
    document.getElementById('join').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('btn-leave-room').disabled = false;
}

//Funcion que abre los parametros del chat, despues de iniciar session.
function showRoomURL(roomid) {
    var roomQueryStringURL = "?roomid="+roomid+"&r=1&tp="+get.tp+"&hc="+get.hc;
    var html = '<h2>Estos son los datos de tu sala:</h2><br>';
    html += 'Enlace de la sala : <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;
    roomURLsDiv.style.display = 'block';
}

//****** Paramentrizacion de la sala ***************

var roomid = get.roomid;

document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};

if(roomid && roomid.length) {
    document.getElementById('room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);
}
//****** FIN Paramentrizacion de la sala ***************



function render (data) {  
    var html = data.map(function(elem, index) {
        return('<div><strong>'+elem.author+'</strong>:<em>'+elem.text+'</em></div>');
    }).join(" ");

    document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {  
    var message = {
        author: document.getElementById('username').value,
        text: document.getElementById('texto').value
    };
    socket.emit('new-message', message);
    return false;
}
