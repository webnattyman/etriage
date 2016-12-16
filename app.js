var mysql = require('mysql2');
var express = require('express');  
var fs = require('fs');  
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
    /*socket.client(function(error, clients){
		if (error) throw error;
	});*/
	var socketId = 1;
    if( socketId == 1){
        socket.emit('crear', sala, socket.id);
    }else if ( socketId == 2){
        socket.emit('agregado', sala, socket.id);
    }else{
        console.log('Sala llena!');
    }
    //console.log('Usuarios Conectados: ' + socketId.clientsCount);
    socket.emit('connected', "hola");
    socket.emit('messages', messages);
    socket.on('messages', function(data) {
        console.log('Got message: ', data);
    });
	
	socket.on('ipaddr', function (data) {
		socket.emit('ipaddr', data);
		var fecha = getDay();
		var post = {id: null, ip_usr: data, fecha_log:fecha};
		db.query('INSERT INTO log_chats SET ?', post, function (err, results, fields) {
			console.log(results); // results contains rows returned by server 
			console.log(fields); // fields contains extra meta data about results, if available 
		});
		console.log(data);
    });
    
    socket.on('message', function (message) {
        console.log('Got message: ', message);
        socket.broadcast.emit('message', message);
    });
    
});

function getDay(){
	var f       = new Date();
	var year	= f.getFullYear();
	var months 	= f.getMonth();
	var days	= f.getDay();
	var hours   = f.getHours();
	var minutes = f.getMinutes();
	var seconds = f.getSeconds();
	var dates = year+"-"+months+"-"+days+" "+hours+":"+minutes+":"+seconds;
	return dates;
}

server.listen( process.env.PORT || 443, function() {  
  //console.log("Servidor corriendo en local");
  console.log("Servidor corriendo en https://redmedix.herokuapp.com");
});
