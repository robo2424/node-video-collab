'use strict';

var socketIO = require('socket.io');
var ot = require('ot');
var UsersList = require('./helpers/userslist').UsersList;

var roomList = {};
var usersList;

module.exports = function(server) {
  var str = '// Welcome \n\n' + 'function helloWorld() {\n  console.log("Hello World!"); \n} \n\nhelloWorld();';
  var io = socketIO(server);

  io.on('connection', function(socket) {
    socket.on('joinRoom', function(data) {
      if (!roomList[data.room]) {
        usersList = new UsersList();

        var socketIOServer = new ot.EditorSocketIOServer(str, [], data.room, function(socket, cb) {
          var self = this;
          Task.findByIdAndUpdate(data.room, {content: self.document}, function(err) {
            if (err) {
              return cb(false);
            }

            cb(true);
          });
        });

        roomList[data.room] = socketIOServer;
      }

      socket.join(data.room);

      usersList.removeUser(socket.id); // remove user from other active tasks
      usersList.addUser(socket.id, data.username, data.room); // add user to task
      io.to(data.room).emit('updateUserList', usersList.getUserList(data.room)); // emit event

      roomList[data.room].addClient(socket);
      roomList[data.room].setName(socket, data.username);

      socket.broadcast.to(data.room).emit('chatMessage', {
        username: 'Admin',
        message: data.username + ' has joined.'
      });
    });

    socket.on('chatMessage', function(data) {
      var user = usersList.getUser(socket.id);

      if (user && isRealString(data.message)) {
        io.to(user.room).emit('chatMessage', data);
      }
    });

    socket.on('typing', function(data) {
        var user = usersList.getUser(socket.id);
        var response = data;

        if (data) {
            response = user.name;
        }

        socket.broadcast.to(user.room).emit('typing', response);
    });

    socket.on('disconnect', function() {
      if (usersList) {
        var user = usersList.removeUser(socket.id);

        if (user) {
          socket.leave(user.room);
          io.to(user.room).emit('updateUserList', usersList.getUserList(user.room));
          io.to(user.room).emit('chatMessage', {
            username: 'Admin',
            message: user.name + ' has left.'
          });
        }
      }
    });
  });
}

var isRealString = function(str) {
  return typeof str === 'string' && str.trim().length > 0;
};
