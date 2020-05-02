const path = require('path')
const http = require('http')
const express = require('express')
const socket = require('socket.io')
const formatmsg = require('./utils/message')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');

const app = express()
const server = http.createServer(app);
const io = socket(server)
const botName = 'ChatCord Bot';

app.use(express.static(path.join(__dirname,'public')))

io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        socket.emit('message',formatmsg('BotUser','Welcome chat application'))


         // Broadcast when a user connects

        socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatmsg(botName, `${user.username} has joined the chat`)
      );
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    })
    
     // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatmsg(user.username, msg));
  });

    // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatmsg(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
    
})


const port = 3000 || process.env.PORT

server.listen(port,()=>{
    console.log(`Server running on ${port}`);
    
})