var $clock = $("#clock");
var socketio = io();
var $userIP;
var get = getGET();
var chatContainer = document.querySelector('.chat_box');
var videoContainer = document.querySelector('#videos-container');
var recetarioContainer = document.querySelector('#recetario-container');
var recetarioBox = document.querySelector('#messages-recetario');
var clockContainer = document.querySelector('#clock');
var boxtxt = document.querySelector('.form');
var boxrecetario = document.querySelector('.form1');

$.getJSON('//jsonip.com/?callback=?', function(data) {
	$userIP = data.ip;
});

socketio.on('messages', function(data){
	console.log(data);
}); 

socketio.on('receta', function(data){
	appendDIV2(data);
}); 

socketio.on('ipaddr', function (ipaddr) {
    console.log('Server IP address is: ' + ipaddr);
});
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



//Enviando mensajes
document.getElementById('sendtxt').onclick = function(e) {
    appendDIV(document.getElementById('input-text-chat').value);
    connection.send(document.getElementById('input-text-chat').value);
    document.getElementById('input-text-chat').value = '';
};

document.getElementById('cplnk').onclick = function(e) {
    $("body").append("<input type='text' id='temp'>");
	$("#temp").val(document.getElementById('room-url').value).select();
	document.execCommand("copy");
	$("#temp").remove();
};

//Enviando recetas
document.getElementById('sendOrden').onclick = function(e) {
	if ( document.getElementById('input-recetario').value == '') return;
	var datas = {};
	datas.msj = document.getElementById('input-recetario').value;
	datas.cid = get.ct;
	appendDIV2(datas);
    socketio.emit('receta', datas );
    document.getElementById('input-recetario').value = '';
};

//Enviando archivos
document.getElementById('file_snd').onclick = function() {
	var file = this.files[0];
	if (!file) return;
	file.uuid = connection.userid;
	connection.selectedFile = file;
	var fileSelector = new FileSelector();
	fileSelector.selectSingleFile(function(file) {
		connection.send(file);
	});
};

//Ingresando a la sala del chat
document.getElementById('join').onclick = function() {
	if( typeof get.uid == "undefined" || get.uid == null ){
		get.uid = prompt("Ingrese su nombre...", "");
	}
	if ( get.uid == null ) return;
	var users = {};
	users.name = get.uid;
	users.ip = $userIP;
	socketio.emit('ipaddr', users);
    disableInputButtons();
	var hrtotal = getDiferenciaHora(get.hc, get.tp);
    connection.extra = {
        fullname: get.uid,
        rol: parseInt(get.r),
		cid: get.ct
	};
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

document.getElementById('input-recetario').onkeyup = function(e) {
    if (e.keyCode == 13) return;
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
	f.setMinutes(f.getMinutes() + parseInt(duration));
	
    return f;
} 

//Funcion para crear un elemento div, con los datos pasados por el usuario.
function appendDIV(event) {
    var msj, usr, rol, hra;
    var row = document.createElement('div');
    if( typeof event === 'string' ){
        msj = event;
        usr = get.uid;
        rol = parseInt(get.r);
    }else{
        msj = event.data;
        usr = event.extra.fullname;
        rol = event.extra.rol;
    }
	row.className = "row";
    if( rol === 1 ){
        row.innerHTML = "<div class='col-xs-1 col-sm-1 col-md-1'>&nbsp;</div><div class='col-xs-8 col-sm-8 col-md-8' style='text-align:left;background-color:#885bc6;color:white;'>"+msj+"</div><div class='col-xs-3 col-sm-3 col-md-3' style='text-align:right;'>"+mostrarhora()+"</div>";
        chatContainer.insertBefore(row, chatContainer.firstChild);
    }else{
        row.innerHTML = "<div class='col-xs-8 col-sm-8 col-md-8' style='text-align:left;background-color:#00a5b4;color:white;'>"+msj+"</div><div class='col-xs-3 col-sm-3 col-md-3' style='text-align:right;'>"+mostrarhora()+"</div><div class='col-xs-1 col-sm-1 col-md-1'>&nbsp;</div>";
        chatContainer.insertBefore(row, chatContainer.firstChild);
    }
    row.tabIndex = 0;
    row.focus();

    document.getElementById('input-text-chat').focus();
}

function appendDIV2(event) {
    var msj, cita_id, rect_id;
    var li = document.createElement('li');
	msj = event.msj;
	li.innerHTML = '<div style="word-wrap: break-word;">'+msj+'</div>';
	document.getElementById('input-recetario').focus();
	recetarioBox.append(li);
}

//Conexion de la session
var connection = new RTCMultiConnection();
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'Video Citas';
connection.getAllParticipants().splice(0,1,get.uid);
connection.sessionid = get.uid;
connection.userid = get.uid;
//connection.enableScalableBroadcast = true;
connection.maxRelayLimitPerUser = 1;
connection.fileReceived = {};
connection.enableFileSharing = true;
connection.chunkSize = 60 * 1000;
connection.filesContainer = document.getElementById('files-container');

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
connection.videosContainerMedicos = document.getElementById('videos-container-cliente');
connection.videosContainerPaciente = document.getElementById('videos-container-servidor');

//Agrega un evento a la conexion cuando transmite.
connection.onstream = function(event) {
	var width;
	console.log(event);
	if( event.extra.rol == 1 ){
		width = parseInt(connection.videosContainerMedicos.clientWidth) - 20;
	}else{
		width = parseInt(connection.videosContainerPaciente.clientWidth) - 20;
	}
    
    var mediaElement = getMediaElement(event.mediaElement, {
        title: event.extra.fullname,
        buttons: ['full-screen', 'mute-audio', 'mute-video', 'volume-slider'],
		toggle: ['mute-audio', 'mute-video', 'record-audio', 'record-video'],
        width: width,
        clase: 'col-xs-12 col-sm-12 col-md-12',
        showOnMouseEnter: true
    });
	if( event.extra.rol == 1 ){
		connection.videosContainerMedicos.appendChild(mediaElement);
		mediaElement.style="background-color:#885bc6;color:white;";
	}else{
		connection.videosContainerPaciente.appendChild(mediaElement);
		mediaElement.style="background-color:#00a5b4;color:white;";
	}

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);
    mediaElement.id = event.streamid;
    clockContainer.style.display = "block";
	var textnode = document.createTextNode(event.extra.fullname);
	var newItem = document.createElement("h2");
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
	var obj = {};
	obj.data = event.data;
	obj.fullname = event.extra.fullname;
	obj.rol = event.extra.rol;
	obj.hra = mostrarhora();
	obj.cid = event.extra.cid
	socketio.emit('message', obj);
    appendDIV(event);
};
    

//Agrega funcion cuando abre la conexion.
connection.onopen = function(event) {
    document.getElementById('txtdiv').style.display = 'block';
    recetarioContainer.style.display = 'block';
    boxtxt.style.display = 'block';
    document.getElementById('sendtxt').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
	document.getElementById('tt_files').style.display = 'block';
	document.getElementById('files-container').style.display = 'block';
	if( parseInt(get.r) == 1 ){
		boxrecetario.style.display = 'block';
		document.getElementById('sendOrden').disabled = false;
		document.getElementById('input-recetario').disabled = false;
	}
    document.getElementById('btn-leave-room').disabled = false;
};

connection.onExtraDataUpdated = function(event) {
};

//Agrega funcion cuando un usuario cierra la conexion.
connection.onclose = function() {
    
};

//Agrega funcion cuando la sesion entera es cerrada.
connection.onEntireSessionClosed = function(event) {
    document.getElementById('sendtxt').disabled = true;
    document.getElementById('input-text-chat').disabled = true;
    document.getElementById('cplnk').disabled = true;
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

var FileProgressBarHandler = (function() {
	function handle(connection) {
		var progressHelper = {};
		// www.RTCMultiConnection.org/docs/onFileStart/
		connection.onFileStart = function(file) {
			if (connection.fileReceived[file.name]) return;
			var div = document.createElement('div');
			div.id = file.uuid;
			div.title = file.name;
			div.innerHTML = '<label>0%</label> <progress></progress>';
			if (file.remoteUserId) {
				div.innerHTML += ' (Sharing with:' + file.remoteUserId + ')';
			}
			connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);
			if (!file.remoteUserId) {
				progressHelper[file.uuid] = {
					div: div,
					progress: div.querySelector('progress'),
					label: div.querySelector('label')
				};
				progressHelper[file.uuid].progress.max = file.maxChunks;
				return;
			}
			if (!progressHelper[file.uuid]) {
				progressHelper[file.uuid] = {};
			}
			progressHelper[file.uuid][file.remoteUserId] = {
				div: div,
				progress: div.querySelector('progress'),
				label: div.querySelector('label')
			};
			progressHelper[file.uuid][file.remoteUserId].progress.max = file.maxChunks;
		};
		// www.RTCMultiConnection.org/docs/onFileProgress/
		connection.onFileProgress = function(chunk) {
			if (connection.fileReceived[chunk.name]) return;
			var helper = progressHelper[chunk.uuid];
			if (!helper) {
				return;
			}
			if (chunk.remoteUserId) {
				helper = progressHelper[chunk.uuid][chunk.remoteUserId];
				if (!helper) {
					return;
				}
			}
			helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
			updateLabel(helper.progress, helper.label);
		};
		// www.RTCMultiConnection.org/docs/onFileEnd/
		connection.onFileEnd = function(file) {
			if (connection.fileReceived[file.name]) return;
			if (file.userid == connection.userid) {
				connection.fileReceived[file.name] = file;
			}
			var helper = progressHelper[file.uuid];
			if (!helper) {
				return;
			}
			if (file.remoteUserId) {
				helper = progressHelper[file.uuid][file.remoteUserId];
				if (!helper) {
					return;
				}
			}
			var div = helper.div;
			if (file.type.indexOf('image') != -1) {
				div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Descargar Archivo <strong style="color:red;">' + file.name + '</strong> </a><br />';
			} else if (file.type.indexOf('video/') != -1) {
				div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Descargar Archivo <strong style="color:red;">' + file.name + '</strong> </a><br /><video src="' + file.url + '" title="' + file.name + '" style="max-width: 80%;" controls></video>';
			} else if (file.type.indexOf('audio/') != -1) {
				div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Descargar Archivo <strong style="color:red;">' + file.name + '</strong> </a><br /><audio src="' + file.url + '" title="' + file.name + '" style="max-width: 80%;" controls></audio>';
			} else {
				div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Descargar Archivo <strong style="color:red;">' + file.name + '</strong> </a><br /><iframe src="' + file.url + '" title="' + file.name + '" style="width: 80%;border: 0;height: inherit;margin-top:1em;"></iframe>';
			}
			if (!file.slice) {
				return;
			}
			if (file.slice && file.userid !== connection.userid) {
				connection.getAllParticipants().forEach(function(paricipantId) {
					if (paricipantId != file.userid) {
						connection.send(file, paricipantId);
					}
				});
				connection.lastFile = file;
			}
		};
		function updateLabel(progress, label) {
			if (progress.position === -1) {
				return;
			}
			var position = +progress.position.toFixed(2).split('.')[1] || 100;
			label.innerHTML = position + '%';
		}
	}
	return {
		handle: handle
	};
})();

FileProgressBarHandler.handle(connection);

/*
document.querySelector('input[type=file]').onchange = function() {
	var file = this.files[0];
	if (!file) return;
	file.uuid = connection.userid;
	connection.selectedFile = file;
	if (connection.isInitiator) {
		if (connection.getAllParticipants().length > 0) {
			connection.send(file);
		}
	}
};*/

/*
document.querySelector('input[type=file]').onclick = function() {
	 var fileSelector = new FileSelector();
	fileSelector.selectSingleFile(function(file) {
		connection.send(file);
	});
};*/


//Funcion que muestra los botones
function disableInputButtons() {
    document.getElementById('join').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('btn-leave-room').disabled = false;
    
}

//Funcion que abre los parametros del chat, despues de iniciar session.
function showRoomURL(roomid) {
    var roomQueryStringURL = "https://redmedix.herokuapp.com/?roomid="+roomid+"&r=1&tp="+get.tp+"&hc="+get.hc+"&ct="+get.ct;
    //var html = 'Enlace de la sala : <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
    var roomURLsDiv = document.getElementById('room-url');
    roomURLsDiv.value = roomQueryStringURL;
	document.getElementById('cplnk').disabled = false;
}

//
function eliminarReceta(item) {
    
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

