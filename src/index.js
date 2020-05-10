const path = require("path")
const port = process.env.PORT || 3000
const publicdirectory = (path.join(__dirname, "../public"))
var express = require('express')
var http = require('http');
var app = express();
const {addUser,removeUser,getUser,getUserInRoom} = require("./utils/users")
const {generateMessage,generateLocationMessage} =require("./utils/message")
const Filter = require("bad-words")



app.use(express.static(publicdirectory))
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(port, () => {
    console.log(`Connection is running on ${port}`)
});

io.on("connect", (socket) => {
    console.log("new connection detected")
  

     socket.on("join",({ username,room },callback)=>{
         const { error,user} = addUser({id:socket.id,username,room})

        if(error){
           return callback(error)
        }
        if(!user.room || !user.username){
            return callback(error)

        }

        socket.join(user.room)
        socket.emit("message", generateMessage("Admin",`Welcome to Sehaj's Chat app Room No ${user.room}`))
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin",`${user.username} has joined!`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    
    })

    socket.on("sendMessage", (message,callback) => {
        const user = getUser(socket.id)
        const filter  = new Filter()
        // if(filter.isProfane(message)){
        //      return  callback("Bad words are not allowed")

        // }
        io.to(user.room).emit("message", generateMessage(user.username,message))
        callback()
    })

    

    socket.on("sendLocation", (coords,callback) => {
        const user  = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username,`https://google.com/maps?q=${coords.lattitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {

        const user =  removeUser(socket.id)

        if(user){
        io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left!`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        }
    })


})
