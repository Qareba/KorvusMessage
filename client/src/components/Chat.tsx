import React from 'react'
import { useState, useEffect, useRef } from 'react'
import MessageList from './MessageList'
import { useParams } from 'react-router-dom'

function Chat() {

  type User = {
    id: number;
    name: string;
    second_name: string;
    phone: string;
  };


  const [text, settext] = useState('')
  const socketRef = useRef <WebSocket | null > (null)
  const chatId = useParams().chatId || '';
  const chatType = useParams().chatType || '';
  const [showAddToGroup, setShowAddToGroup] = useState<boolean>(false)
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>('')

  type Message = { text: string, id: number }
  const [messages, setMessages] = useState<Message[]>([])

  const loaddata = async (chat_Id: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${chatType}/${chat_Id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await res.json();
    setMessages(data);
  } 
  const loadUsers = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://192.168.0.141:8000/ws/chat/?token=${localStorage.getItem("token")}&chatId=${chatId}&chat=${chatType}`);
    socketRef.current.onopen = () => console.log("connected");
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        alert(data.error); // или setError(data.error) для показа на экране
        return;
      }
      if (data.type === "delete") {
        setMessages(prev => prev.filter(msg => msg.id !== data.id));
      } else {
        setMessages(prev => [...prev, data]);
      }
    }


    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    }
  }, [chatId])

  useEffect(() => {
  setMessages([]);
  loaddata(chatId)
}, [chatId])

  useEffect(() => {
    loadUsers()
  }, [])
  


  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({"text": text}))
      settext('')
    }
  }

  const addToGroup = async (e: React.FormEvent<HTMLFormElement>, chat_id: string, user_id: string) => {
    e.preventDefault()
    const response = await fetch(`${import.meta.env.VITE_API_URL}group_chats/add/${chat_id}/${user_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      setShowAddToGroup(false)
    }
  }

  console.log(messages);
  
  return (
    <div>
      {
        chatType == 'group' && (
          <>
          <button onClick={() => setShowAddToGroup(true)}>Add people</button>
          {
            showAddToGroup && (
              <form onSubmit={(e) => addToGroup(e,chatId, userId)}>
              <select value={userId} onChange={e => setUserId(e.target.value)}>
                <option>выберите людей</option>  
                {
                  users.map(user => (
                    <option value={user.id}>{user.name}</option>  
                  ))
                }
              </select>
              <button type='submit'>Add</button>
            </form> 
            )
          }
          </>
        )
      }
      <MessageList messages={messages} setMessages={setMessages} socketRef={socketRef} />
        <form onSubmit={sendMessage}>
      <input type="text" value={text} placeholder='писюн' onChange={(e) => settext(e.target.value)}/>
      <button type='submit'>Send</button>
    </form>
    </div>
  )
}

export default Chat