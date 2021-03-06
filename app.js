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
	socket.join(sala);
    socket.emit('connected', "hola");
    socket.emit('messages', messages); 
    
	
	socket.on('ipaddr', function (data) {
		socket.emit('ipaddr', data.ip);
		var fecha = getDay();
		var post = {id: null, ip_usr: data.ip, fecha_log:fecha, nombre:data.name};
		db.query('INSERT INTO log_chats SET ?', post, function (err, results, fields) {
			if (err) throw err;
		});
		console.log(data);
    });
	
	socket.on('receta', function (data) {
		var post = { id_rctcta: null, cita_rctcta: data.cid, desc_rctcta:data.msj };
		db.query('INSERT INTO recetario_citas SET ?', post, function (err, result, fields) {
			if (err) throw err;
			data.rid = result.insertId;
			socket.broadcast.emit('receta', data);
		});
    });
    
    socket.on('message', function (message) {
		var file_chat = 'chat_'+message.cid+'.txt';
		var linea = '('+message.hra+' : '+message.fullname+') => '+message.data+'\n';
		fs.appendFileSync(file_chat, linea, encoding='utf8');
		var resp = base64_encode(file_chat);
		var getId = {cita_hstcht:parseInt(message.cid)};
		var postInsert = {id_hstcht: null, cita_hstcht: parseInt(message.cid), txt_hstcht:resp};
		db.query('SELECT * FROM historial_chat WHERE cita_hstcht = ?', getId, function (err, results, fields) {
			if (fields.length > 0){
				var prueba = db.query('UPDATE historial_chat SET txt_hstcht = ? WHERE ?', [resp, getId], function (err, results, fields) {});
			}else{
				db.query('INSERT INTO historial_chat SET ?', postInsert, function (err, results, fields) {});
			}
		});
		var mosfile = base64_decode(resp, 'chat_'+message.cid+'.txt');
		console.log( resp );
        socket.broadcast.emit('message', message);
    });
    
});

function getDay(){
	var f       = new Date();
	var year	= f.getFullYear();
	var months 	= f.getMonth() + 1;
	var days	= f.getDate();
	var hours   = f.getUTCHours() - 5;
	var minutes = f.getMinutes();
	var seconds = f.getSeconds();
	var dates = year+"-"+months+"-"+days+" "+hours+":"+minutes+":"+seconds;
	return dates;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    console.log('******** File created from base64 encoded string ********');
    return file;
}

server.listen( process.env.PORT || 443, function() {  
  //console.log("Servidor corriendo en local");
  console.log("Servidor corriendo en https://redmedix.herokuapp.com");
});
