var mysql = require('mysql2');
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
 
var db_config = {
    host: 'citasGeneral.db.10307171.hostedresource.com',
    user: 'citasGeneral',
    password: 'NMcitas@2013',
    database: 'citasGeneral'
};

var db;

function handleDisconnect() {
    db = mysql.createConnection(db_config);
    db.connect(function(err) {              
        if(err) {
            console.log('Error de conexion con mysql:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
                                          
    db.on('error', function(err) {
        console.log('db error', err);
        if( err.code === 'PROTOCOL_CONNECTION_LOST' ) {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect(); 
/* 
var post = {id_hstcht: null, cita_hstcht: '', usr_hstcht:, txt_hstcht:};
db.query('INSERT INTO historial_chat SET ?', post, function (err, results, fields) {
    console.log(results); // results contains rows returned by server 
    console.log(fields); // fields contains extra meta data about results, if available 
});*/

app.use(express.static('.'));
/*app.get('/', function(req, res){
    res.sendFile(dir_url + '/index.html');
});*/

io.on('connection', function(socket) {
    var socketId = io.of('/').clients();
	console.log(socketId.server.eio.clientsCount);
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
