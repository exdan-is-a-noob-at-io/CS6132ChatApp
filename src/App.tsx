import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import './App.css';
import { socket } from '.';

interface Mess {
  key: number
  message: string
  user: string
  time: Date
}


export const Message:FC<Mess> = (props) => {
  const text = props.message
  const user = props.user
  const time = new Date(props.time).toLocaleTimeString()

  const collatedMessage = time + " (" + user + ") " + text
  return (
    <div className='message'>{collatedMessage}</div>
  )
}

interface ChatProps {
  messages: Mess[]
}

export const Chat:FC<ChatProps> = (props) => {
  return (
    <div className='messages'>
      <div>
        {props.messages.map((val, i) => {
          return <Message message={val.message} user={val.user} time={val.time} key={val.key}/>
        })}
      </div>
    </div>
    
  )
}

function App() {

  const [messages, setMessages] = useState<Mess[]>([])
  const [name, setName] = useState<string>("")
  const [mess, setMees] = useState<string>("")
  const [room, setRoom] = useState<string>("SUS")

  useEffect(() => {
    socket.emit("joinRoom", room)
    socket.emit("getMessages", room, update)
  }, [room])
  
  
  const update = (newMessages: Mess[]) => {
    setMessages(newMessages)
    console.log(newMessages)
  }

  socket.on('updateMessages', (currMessages) => {
    update(currMessages)
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    socket.emit("message", name, mess, room, update)
    setMees("")
    event.preventDefault()
  }

  const updateRoom = (newRoom: string) => {
    setRoom(newRoom.trim().toUpperCase())
  }

  
  return (
    <div className="App">
      <div className='hFlex'>
        <p>Room: </p>
        <input type='text' value={room} onChange={event => updateRoom(event.target.value)}></input>
      </div>
      <Chat messages={messages}/>
      <form onSubmit={event => onSubmit(event)}>
        <input name="name" type="text" value={name} onChange={event => setName(event.target.value)}></input>
        <input name="mess" type="text" value={mess} onChange={event => setMees(event.target.value)}></input>
        <input type="submit" value="Send"/>
      </form>
    </div>
  );
}

export default App;
