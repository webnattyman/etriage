document.getElementById('sendtxt').onclick = function() {
    connection.send(document.getElementById('input-text-chat').value);
    appendDIV(document.getElementById('input-text-chat').value);
    document.getElementById('input-text-chat').value = '';
};

document.getElementById('open-or-join-room').onclick = function() {
    disableInputButtons();
    connection.interval = 1000;
    connection.open();
    /*connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
        if(!isRoomExists) {
            showRoomURL(roomid);
        }
    });*/
};

document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    connection.send(this.value);
    appendDIV(this.value);
    this.value = '';
};

var chatContainer = document.querySelector('.chat-output');

function appendDIV(event) {
    var div = document.createElement('div');
    div.innerHTML = event.data || event;
    chatContainer.insertBefore(div, chatContainer.firstChild);
    div.tabIndex = 0;
    div.focus();

    document.getElementById('input-text-chat').focus();
}

var onMessageCallbacks = {};
var SIGNALING_SERVER = 'https://redmedix.herokuapp.com/';
var defaultChannel = 'redmedix-channel';

window.username = Math.random() * 9999 << 9999;
var connection = new RTCMultiConnection(defaultChannel);
connection.openSignalingChannel = function(config) {
    var channel = config.channel || defaultChannel;
    onMessageCallbacks[channel] = config.onmessage;
    var sender = Math.round(Math.random() * 60535) + 5000;

    io.connect(SIGNALING_SERVER).emit('new-channel', {
        channel: channel,
        sender: sender
    });

    var socket = io.connect(SIGNALING_SERVER + channel);
    socket.channel = channel;
    socket.on('connect', function() {
        if (config.callback) config.callback(socket);
    });

    socket.on('new-message', function(data) {  
        console.log(data);
        render(data);
    });

    socket.send = function(message) {
        socket.emit('message', {
            sender: sender,
            data: message
        });
    };

    socket.on('message', function(data) {
        if(data.sender == connection.userid) return;

        if (onMessageCallbacks[data.channel]) {
            onMessageCallbacks[data.channel](data.message);
        };
    });
};

connection.videosContainer = document.getElementById('videos-container');
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

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if(mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');

connection.extra = {
    username: window.username
};

connection.connect();

connection.onopen = function() {
    document.getElementById('sendtxt').disabled = false;
    document.getElementById('input-text-chat').disabled = false;
    document.getElementById('btn-leave-room').disabled = false;

    document.querySelector('h1').innerHTML = 'You are connected with: ' + connection.getAllParticipants().join(', ');
};

connection.onclose = function() {
    if(connection.getAllParticipants().length) {
        document.querySelector('h1').innerHTML = 'You are still connected with: ' + connection.getAllParticipants().join(', ');
    }
    else {
        document.querySelector('h1').innerHTML = 'Seems session has been closed or all participants left.';
    }
};

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

connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    // seems room is already opened
    connection.join(useridAlreadyTaken);
};

function disableInputButtons() {
    document.getElementById('open-or-join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('btn-leave-room').disabled = false;
}

// ......................................................
// ......................Handling Room-ID................
// ......................................................

function showRoomURL(roomid) {
    var roomHashURL = '#' + roomid;
    var roomQueryStringURL = '?roomid=' + roomid;

    var html = '<h2>Unique URL for your room:</h2><br>';

    html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';

    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = 'block';
}

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

var roomid = params.roomid;
if(!roomid && hashString.length) {
    roomid = hashString;
}

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
