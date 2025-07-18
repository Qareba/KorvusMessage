import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import { useParams } from 'react-router-dom'
import { Send } from 'lucide-react';

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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  type Message = { text: string, id: number, user: {name: string} }
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    socketRef.current = new WebSocket(`ws://192.168.8.209:8000/ws/chat/?token=${localStorage.getItem("token")}&chatId=${chatId}&chat=${chatType}`);
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
        console.log(data);
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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);


  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({"text": text}))
      settext('')
    }
  }

  const addToGroup = async (e: React.FormEvent<HTMLFormElement>, chat_id: string, user_id: string) => {
    e.preventDefault()
    const response = await fetch(`${import.meta.env.VITE_API_URL}group/add/${chat_id}/${user_id}`, {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
      <div
        style={{ flex: 1, overflowY: 'auto' }}
        ref={messagesEndRef}
      >
        <MessageList messages={messages} setMessages={setMessages} socketRef={socketRef} />
      </div>
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 p-4 border-t bg-white shadow-inner"
        style={{ minHeight: 64 }}
      >
        <input
          type="text"
          value={text}
          placeholder="Введите сообщение..."
          onChange={(e) => settext(e.target.value)}
          className={`flex-1 rounded-full px-4 py-2 border border-blue-300 focus:outline-none focus:ring-2 transition ${user === 'ксю' ? 'bg-pink-100' : 'bg-gray-100'}`}
        />
        <button
          type="submit"
          className={`flex items-center justify-center w-12 h-12 rounded-full ${user == 'ксю' ? 'bg-pink-500 hover:bg-pink-600 transition text-white shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400': 'bg-blue-500 hover:bg-green-600 transition text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-400'}`}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}

export default Chat