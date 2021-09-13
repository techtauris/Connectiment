const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


var list = [];
var users = [];

fs.readFile('data.json', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
	list = JSON.parse(data).messages;
	console.log(list)
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('disconnect', (data) => {
    console.log(socket.id);
		for(var i = 0; i < users.length; i++){
			if(users[i].socket == socket.id){
				users[i].socket =null;
			}
		}
  });
  socket.on('chat message', (msg) => {
		list.push(msg);
    io.emit('chat message', msg);
		console.log(list);
  });
	socket.on('fullconnect', (msg) => {
		if(getuser(msg.user) != null){
			getuser(msg.user).socket = socket.id;
		}else{
		users.push({"user":msg.user,"socket": socket.id,"joinmsg":"is online"});
		}
		io.emit('chat message', {"message": getuser(msg.user).joinmsg +" &gt","user": msg.user});
		list.push( {"message": getuser(msg.user).joinmsg +" &gt","user": msg.user});
		console.log(users);
	});
	socket.on('command', (msg) => {
		console.log(msg);
		switch(msg.type){
			case 'getusers':
				var usertext = "";
				for(var i = 0; i<users.length; i++){
					usertext += users[i].user + " &lt&gt ";
				}
				socket.emit('chat message', {"message": usertext,"user": "server"});
				break;
			case "join":
				var jointext = "";
				for(var i = 0; i<msg.args.length; i++){
					jointext += " "+msg.args[i];
				}
				users[getuserindex(msg.user)].joinmsg = jointext;
				break;
			case "rickroll":
				io.emit('chat message', {"message": '<iframe width="336" height="164" src="https://www.youtube.com/embed/dQw4w9WgXcQ?&autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',"user": "server"});
				break;
			case "yt":
				io.emit('chat message', {"message": '<iframe width="336" height="164" src="https://www.youtube.com/embed/'+msg.args[1]+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',"user": "server"});
				break;
		}
	});
});
server.listen(3000, () => {
  console.log('listening');
});

function getuser(name){
	for(var i = 0; i < users.length; i++){
		if(users[i].user == name){
			return users[i]
		}
	}
	return null;
}

function getuserindex(name){
	for(var i = 0; i < users.length; i++){
		if(users[i].user == name){
			return i;
		}
	}
	return null;
}