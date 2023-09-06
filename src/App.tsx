import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import './App.css';
import { socket } from '.';

interface Mess {
  key: number
  message: string
  user: string
  time: Date
  isClient: boolean
}


export const Message:FC<Mess> = (props) => {
  const text = props.message
  const user = props.user
  const time = new Date(props.time).toLocaleTimeString()

  const collatedMessage = time + " (" + user + ") " + text
  return (
    <div className={props.isClient ? 'currUserMessaage' : 'message'}>
      <p className={props.isClient ? 'currUser' : 'user'}>{user + ": "}</p>
      <p>{text}</p>
    </div>
  )
}

interface ChatProps {
  messages: Mess[]
  userList: Map<string,string>
  user: string
}

export const Chat:FC<ChatProps> = (props) => {
  const getUser = (user: string) => {
    const username = props.userList.get(user)
    return (username === undefined) ? "" : username
  }
  
  return (
    <div className='messages'>
      <div>
        {props.messages.map((val, i) => {
          return <Message isClient={props.user === val.user} message={val.message} user={getUser(val.user)} time={val.time} key={val.key}/>
        })}
      </div>
    </div>
    
  )
}

function App() {

  const [messages, setMessages] = useState<Mess[]>([])
  const [userList, setUserList] = useState<Map<string,string>>(new Map())
  const [name, setName] = useState<string>("")
  const [mess, setMees] = useState<string>("")
  const [room, setRoom] = useState<string>("SUS")

  useEffect(() => {
    socket.emit("joinRoom", room)
    socket.emit("getMessages", room, update)
  }, [room])
  
  
  const update = (newMessages: Mess[], newUserList: string) => {
    console.log(newMessages)
    console.log(newUserList)
    setMessages(newMessages)
    setUserList(new Map(JSON.parse(newUserList)))
  }
  socket.on('updateMessages', (currMessages, newUserList) => {
    update(currMessages, newUserList)
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (name === ""){
      alert("Please Input a Name!")
      event.preventDefault()
      return;
    }
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
      <Chat messages={messages} user={socket.id} userList={userList}/>
      <form onSubmit={event => onSubmit(event)}>
        <input name="name" type="text" value={name} placeholder="Name" onChange={event => setName(event.target.value)}></input>
        <input name="mess" type="text" value={mess} placeholder="Message" onChange={event => setMees(event.target.value)}></input>
        <input type="submit" value="Send"/>
      </form>
    </div>
  );
}

export default App;
