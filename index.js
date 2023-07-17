/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-undef */
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
var disconnectName;

// eslint-disable-next-line no-unused-vars
var online = false;
var status = 'whatever';


// sqlite related code
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.db3');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/name.html');
});

app.get('/img', (req, res) => {
	res.sendFile(__dirname + '/Chatting-App.png');
});

app.get('/chat', (req, res) => {
	disconnectName = req.query.name;
	console.log('1111111111 ', disconnectName);
	res.sendFile(__dirname + '/chat.html');
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});

// establishing connection between FE & BE

var names = [];

io.on('connection', (socket) => {
	// clearing the database
	db.serialize(() => {
		db.run('DROP TABLE chats');
		db.run('CREATE TABLE IF NOT EXISTS chats (sender TEXT, message TEXT)'); // Runs the SQL query with the specified parameters and calls the callback afterwards. It does not retrieve any result data. The function returns the Database object for which it was called to allow for function chaining.
	});
	// a user connected functionality here
	socket.on('conn', (name) => {
		db.serialize(() => {
			// eslint-disable-next-line quotes
			db.run("INSERT into chats(sender, message) VALUES ('A','hello world!')");
		});
		names.push(name);
		console.log('8888 ', names);
		io.emit('conn', names); // <------------- emit here.
		online = 1;
	});

	// chat message functionality
	socket.on('chat message', (data) => {
		db.serialize(() => {
			db.all('SELECT * FROM chats', (err, rows) => {
				if(err){  
            		// eslint-disable-next-line no-mixed-spaces-and-tabs
            		console.log(err);
				}  
        		// eslint-disable-next-line no-mixed-spaces-and-tabs
        		else{  
            		console.log(rows);
					console.log('awkmdkmamwld', rows.sender + ': ' + rows.message);
        		}
			});
		});

		// db.close();                                                         // Closes the database.
		io.emit('chat message', data);
		console.log('message: ', data);
	});

	//socket.id
	console.log('adwafaf ', socket.id);

	// a user connected functionality
	// socket.on('conn', (msg1) => {
	// 	io.emit('conn', msg1);
	// });

	// current user joins the room and emits status
	socket.join('chatroom-1');
	// socket.emit('status', status);

	// user is typing functionality
	socket.on('is typing', (data) => {
		io.emit('is typing', data.name + ' is typing...');
	});

	socket.on('now online', (data) => {
		io.emit('now online', data.name + ' online');
	});

	// label - online/left/is typing...
	// eslint-disable-next-line no-unused-vars
	socket.on('label', (name) => {
		console.log('******* ', names);
		if (socket.rooms.has('chatroom-1') == true) {
			status = 'online';
		}
		else {
			status = 'whatever'; 
		}
		io.emit('label', [names, status]);
	});

	// some user disconnected functionality + user leaves the room and emits status
	socket.on('disconnect', function () {
		console.log('98746541652132');
		socket.leave('room-1');
		online = false;
		// io.emit('label', [name, status]);
		io.emit('chat message', { username: disconnectName, usermessage: 'disconnected' });
	});

});
