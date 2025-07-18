import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import { useParams } from 'react-router-dom'
import { Send, Pencil } from 'lucide-react';

type Message = { text: string, id: number, user: { name: string }, edited: boolean }

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
  const user = (localStorage.getItem('user') || '').replace(/^"+|"+$/g, '');
  const [editMessageId, setEditMessageId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loaddata = async (chat_Id: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${chatType}/${chat_Id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    let data = await res.json();
    data = (data as any[]).map((msg) => ({ ...msg, edited: !!msg.edited })) as Message[];
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
    socketRef.current = new WebSocket(`wss://192.168.8.209:8000/ws/chat/?token=${localStorage.getItem("token")}&chatId=${chatId}&chat=${chatType}`);
    socketRef.current.onopen = () => console.log("connected");
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "delete") {
        setMessages((prev: Message[]) => prev.filter(msg => msg.id !== data.id));
      } else if (data.event === "update") {
        setMessages((prev: Message[]) =>
          prev.map(msg =>
            msg.id === data.id ? { ...msg, text: data.text, edited: true } : msg
          )
        );
      } else if (data.text && data.id) {
        setMessages((prev: Message[]) => [...prev, { ...data, edited: !!data.edited }]);
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
    if (!text.trim()) return;
    if (socketRef.current) {
      if (editMessageId) {
        socketRef.current.send(JSON.stringify({
          type: "update",
          id: editMessageId,
          text
        }));
        setEditMessageId(null);
        settext('');
        return;
      } else {
        socketRef.current.send(JSON.stringify({ text }));
        settext('');
      }
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

  const isKsyu = user === 'ксю';

  return (
    <div className={`flex flex-col h-screen ${isKsyu ? 'bg-gradient-to-br from-pink-100 via-pink-50 to-fuchsia-100' : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50'}`}>
      {chatType == 'group' && (
        <div className="p-4">
          <button
            className={`rounded-lg px-4 py-2 font-semibold shadow transition ${isKsyu ? 'bg-pink-400 hover:bg-pink-500 text-white' : 'bg-violet-400 hover:bg-violet-500 text-white'}`}
            onClick={() => setShowAddToGroup(true)}
          >
            Add people
          </button>
          {showAddToGroup && (  
            <form onSubmit={(e) => addToGroup(e, chatId, userId)} className="flex gap-2 mt-2">
              <select value={userId} onChange={e => setUserId(e.target.value)} className="rounded-lg border border-violet-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50 text-violet-900 transition">
                <option>выберите людей</option>
                {users.map(user => (
                  <option value={user.id}>{user.name}</option>
                ))}
              </select>
              <button type='submit' className={`rounded-lg px-4 py-2 font-semibold shadow transition ${isKsyu ? 'bg-pink-400 hover:bg-pink-500 text-white' : 'bg-violet-400 hover:bg-violet-500 text-white'}`}>Add</button>
            </form>
          )}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }} ref={messagesEndRef}>
        <MessageList messages={messages} setMessages={setMessages} socketRef={socketRef} onEdit={(id, text) => {
          setEditMessageId(id);
          settext(text);
        }} user={user} />
      </div>
      <form
        onSubmit={sendMessage}
        className={`flex items-center gap-2 p-4 border-t shadow-inner ${isKsyu ? 'bg-pink-50' : 'bg-white'}`}
        style={{ minHeight: 64 }}
      >
        <input
          type="text"
          value={text}
          placeholder="Введите сообщение..."
          onChange={(e) => settext(e.target.value)}
          className={`flex-1 rounded-full px-4 py-2 border focus:outline-none focus:ring-2 transition ${isKsyu ? 'border-pink-300 focus:ring-pink-400 bg-pink-100 placeholder-pink-300 text-pink-900' : 'border-violet-300 focus:ring-violet-400 bg-violet-50 placeholder-violet-300 text-violet-900'}`}
        />
        <button
          type="submit"
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md focus:outline-none focus:ring-2 transition
            ${isKsyu
              ? editMessageId
                ? 'bg-yellow-400 hover:bg-yellow-500 text-white focus:ring-yellow-400'
                : 'bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-400'
              : editMessageId
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400'
                : 'bg-violet-500 hover:bg-violet-600 text-white focus:ring-violet-400'
            }`}
        >
          {editMessageId ? <Pencil size={22} /> : <Send size={22} />}
        </button>
      </form>
    </div>
  )
}

export default Chat