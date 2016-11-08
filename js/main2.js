var chatContainer = document.querySelector('.chat-output');

/*Enviando mensajes
document.getElementById('sendtxt').onclick = function() {
    var customMessage = prompt('Enter test message.');
    socket.emit(connection.socketCustomEvent, {
        sender: connection.userid,
        customMessage: customMessage
    });/*
    connection.send(document.getElementById('input-text-chat').value);
    appendDIV(document.getElementById('input-text-chat').value);
    document.getElementById('input-text-chat').value = '';
};*/

//Ingresando a la sala del chat
document.getElementById('join').onclick = function() {
    disableInputButtons();
    connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
        if(!isRoomExists) {
            showRoomURL(roomid);
        }
    });
};

//Verifica los datos ingresados en el campo
document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    connection.send(this.value);
    appendDIV(this.value);
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

//Funcion para crear un elemento div, con los datos pasados por el usuario.
function appendDIV(event) {
    var div = document.createElement('div');
    div.innerHTML = event.data || event;
    chatContainer.insertBefore(div, chatContainer.firstChild);
    div.tabIndex = 0;
    div.focus();

    document.getElementById('input-text-chat').focus();
}

//Conexion de la session
var connection = new RTCMultiConnection();
//connection.enableLogs = true;
//connection.socketURL = 'https://redmedix.herokuapp.com:443/';
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'Video Chat';

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
    var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
    var mediaElement = getMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        width: width,
        showOnMouseEnter: false
    });

    connection.videosContainer.appendChild(mediaElement);

    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);

    mediaElement.id = event.streamid;
};

//Agrega funcion cuando termina de transmitir
connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if(mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

//Agrega funcion cuando llega un mensaje.
connection.onmessage = appendDIV;

//Agrega el contenedor de archivos
connection.filesContainer = document.getElementById('file-container');

//Agrega funcion cuando abre la conexion.
connection.onopen = function() {
    document.getElementById('txtdiv').style.display = 'block';
    document.getElementById('sendtxt').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;
    document.querySelector('h1').innerHTML = 'Estas comunicado con: ' + connection.getAllParticipants().join(', ');
};

//Agrega funcion cuando un usuario cierra la conexion.
connection.onclose = function() {
    if(connection.getAllParticipants().length) {
        document.querySelector('h1').innerHTML = 'Ha finalizado la comunicacion, recuerda que estabas en conexion con: ' + connection.getAllParticipants().join(', ');
    }
    else {
        document.querySelector('h1').innerHTML = 'La session termino, todos los participantes han abandonado!.';
    }
};

//Agrega funcion cuando la sesion entera es cerrada.
connection.onEntireSessionClosed = function(event) {
    document.getElementById('sendtxt').disabled = true;
    document.getElementById('input-text-chat').disabled = true;
    document.getElementById('btn-leave-room').disabled = true;
    document.getElementById('open-or-join-room').disabled = false;
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

//Funcion que muestra los botones
function disableInputButtons() {
    document.getElementById('join').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('btn-leave-room').disabled = false;
}

//Funcion que abre los parametros del chat, despues de iniciar session.
function showRoomURL(roomid) {
    var roomQueryStringURL = '?roomid=' + roomid;
    var html = '<h2>Estos son los datos de tu sala:</h2><br>';
    html += 'Enlace de la sala : <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;
    roomURLsDiv.style.display = 'block';
}

//Funcion que extrae los parametros pasados por url
(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

//****** Paramentrizacion de la sala ***************
var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
    roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
    roomid = connection.token();
}
document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
    localStorage.setItem(connection.socketMessageEvent, this.value);
};

var hashString = location.hash.replace('#', '');
if(hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = window.params.roomid;

alert(roomid);

if(roomid && roomid.length) {
    document.getElementById('room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);

    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExists) {
            if(isRoomExists) {
                connection.join(roomid);
                return;
            }

            setTimeout(reCheckRoomPresence, 5000);
        });
    })();

    disableInputButtons();
}
//****** FIN Paramentrizacion de la sala ***************
connection.openSignalingChannel = function(config) {
   var channel = config.channel || this.channel || connection.channel;
   var sender = Math.round(Math.random() * 9999999999) + 9999999999;

   io.connect(connection.socketURL).emit('new-channel', {
      channel: channel,
      sender : sender
   });

   var socket = io.connect(connection.socketURL);
   socket.channel = channel;

   socket.on('connect', function () {
      if (config.callback) config.callback(socket);
   });

    document.getElementById('sendtxt').onclick = function() {
        var customMessage = prompt('Enter test message.');
        socket.emit('message', {
            sender: connection.userid,
            customMessage: customMessage
        });/*
        connection.send(document.getElementById('input-text-chat').value);
        appendDIV(document.getElementById('input-text-chat').value);
        document.getElementById('input-text-chat').value = '';*/
    };
    
    socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data  : message
        });
    };

    socket.on('message', config.onmessage);
};

/*
connection.openSignalingChannel = function(callback) {
    return io.connect().on('new-message', function(data) {  
        console.log(data);
        render(data);
    });
};
*/

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
