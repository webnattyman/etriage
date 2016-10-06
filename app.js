var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);
var messages = [{  
    id: 1,
    text: "Hola soy un mensaje",
    author: "Carlos Azaustre"
}];

app.use(express.static('.'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {  
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', messages);

  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });
});

server.listen( process.env.PORT || 2013, function() {  
  console.log("Servidor corriendo en https://redmedix.herokuapp.com");
});
