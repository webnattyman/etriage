var express = require('express');  
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

io.on('connection', function(socket) {
    socket.join(sala);
    var socketId = io.nsps[namespace].adapter.rooms[sala].length;
    if( socketId == 1){
        socket.join(sala);
        socket.emit('crear', sala, socket.id);
        app.get('/', function(req, res){
            res.sendFile(dir_url + '/index.html');
        });
    }else if ( socketId == 2){
        socket.join(sala);
        socket.emit('agregado', sala, socket.id);
        app.get('/', function(req, res){
            res.sendFile(dir_url + '/index.html');
        });
    }else{
        console.log('Sala llena!');
        app.get('/', function(req, res){
            res.sendFile(dir_url + '/error.html');
        });
    }
    console.log('Usuarios Conectados: ' + socketId);
    //socket.emit('messages', messages);
    socket.on('new-message', function(data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    });
});

server.listen( process.env.PORT || 2013, function() {  
  console.log("Servidor corriendo en local");
  //console.log("Servidor corriendo en https://redmedix.herokuapp.com");
});
