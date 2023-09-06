const io = require('socket.io')(3000,{
    cors:{
      origin:["http://localhost:3001"]
    }
  })

const groupInfo = new Map()
const userInfo = new Map()



io.on('connection', socket => {
    console.log("User " + socket.id + " has connected")
    
    socket.on("joinRoom", (room) => {
      socket.join(room)
    })
    
    socket.on("leaveRoom", (room) => {
      socket.leave(room)
    })

    socket.on('hello', (message) => {
        console.log("Hello was sent with message: " + message)
    })

    socket.on('getMessages', (room, update) => {
      console.log("Get messages called")
      if (groupInfo.get(room) === undefined){
        groupInfo.set(room, {messages: []})
      }
      update(groupInfo.get(room)["messages"], JSON.stringify([...userInfo]))
    })

    socket.on('message', (name, mess, room, update) => {
      if (mess === "" || name === "") return

      if (groupInfo.get(room) === undefined){
        groupInfo.set(room, {messages: []})
      }

      const currMessages = [...groupInfo.get(room)["messages"]]
      
      currMessages.push({
        "user": socket.id,
        "message": mess,
        "time": new Date(),
        "key": currMessages.length
      })

      groupInfo.set(room, {messages: currMessages})
      userInfo.set(socket.id, name)

      console.log(JSON.stringify([...userInfo]))

      socket.to(room).emit("updateMessages", currMessages, JSON.stringify([...userInfo]))
      update(currMessages, JSON.stringify([...userInfo]))
  })
})
