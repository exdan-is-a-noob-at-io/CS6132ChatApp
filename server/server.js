const io = require('socket.io')(3000,{
    cors:{
      origin:["http://localhost:3001"]
    }
  })

const groupInfo = new Map()



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
      update(groupInfo.get(room)["messages"])
    })

    socket.on('message', (name, mess, room, update) => {
      if (mess === "" || name === "") return

      if (groupInfo.get(room) === undefined){
        groupInfo.set(room, {messages: []})
      }

      const currMessages = [...groupInfo.get(room)["messages"]]
      
      currMessages.push({
        "user": name,
        "message": mess,
        "time": new Date(),
        "key": currMessages.length
      })

      console.log(currMessages)

      groupInfo.set(room, {messages: currMessages})

      socket.to(room).emit("updateMessages", currMessages)
      update(currMessages)
  })
})
