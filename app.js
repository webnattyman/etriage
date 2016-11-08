var express = require('express');  
var cors = require('cors');
var app = express(); 
var server = require('http').Server(app);  
var io = require('socket.io')(server);
var sala = "chat983143145454";
var namespace = '/';
var dir_url = __dirname;
var messages = [{  
    id: 1,
    text: "Bienvenidos!",
    author: "Redmedix"
}];

app.use(express.static('.'));
/*app.get('/', function(req, res){
    res.sendFile(dir_url + '/index.html');
});*/
app.use(cors());

io.on('connection', function(socket) {
    socket.join(sala);
    var socketId = io.nsps[namespace].adapter.rooms[sala].length;
    if( socketId == 1){
        socket.emit('crear', sala, socket.id);
    }else if ( socketId == 2){
        socket.emit('agregado', sala, socket.id);
    }else{
        console.log('Sala llena!');
    }
    console.log('Usuarios Conectados: ' + socketId);
    socket.emit('connected', socketId);
    socket.emit('new-message', messages);
    socket.on('new-message', function(data) {
        messages.push(data);
        io.sockets.emit('new-message', messages);
    });
    
    socket.on('message', function (message) {
        console.log('Got message: ', message);
        socket.broadcast.emit('message', message);
    });
    
});

server.listen( process.env.PORT || 443, function() {  
  //console.log("Servidor corriendo en local");
  console.log("Servidor corriendo en https://redmedix.herokuapp.com");
});
