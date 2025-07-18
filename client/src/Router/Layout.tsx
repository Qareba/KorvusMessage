import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../AuthContext';
import { pre } from 'framer-motion/client';

function Layout() {
  type User = {
    id: number;
    name: string;
    second_name: string;
    phone: string;
  };
  type Group = {
    id: number;
    name: string;
    creator: string;
    participants: [];
  }

  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [chatName, setChatName] = useState<string>('');
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false)
  const navigate = useNavigate();
  const {logout} = useAuth()
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadUsers = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    setUsers(data);
  };

  const loadGroups = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}group`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    setGroups(data);
  };

  const createPrivateChat = async (userId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}private/create/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      setChatId(data.chat_id);
      navigate(`/chats/private/${data.chat_id}`);
    } else {
      console.error(data);
    }
  };

  useEffect(() => {
    loadUsers();
    loadGroups();
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    logout()
    navigate('/login')
  }

  const createGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`${import.meta.env.VITE_API_URL}group/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: chatName})
    })
    const data = await res.json()
    if (res.status == 201) {
      setGroups((prev) => [...prev, data])
    }
  }

  const RoudToGroupChat = async (chat_id:number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}group/${chat_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      navigate(`/chats/group/${chat_id}`);
    } else {
      console.error(data);
    }
  }

  // Определяем стили для nav и кнопок в зависимости от пользователя
  const isKsyu = user.name === 'ксю';
  const navClass = isKsyu
    ? 'w-60 flex flex-col gap-4 items-center justify-start bg-pink-100 shadow-xl p-6 border-r-2 border-pink-200 min-h-screen'
    : 'w-60 flex flex-col gap-4 items-center justify-start bg-gradient-to-b from-violet-100 via-purple-100 to-fuchsia-100 shadow-xl p-6 border-r-2 border-violet-200 min-h-screen';
  const buttonClass = isKsyu
    ? 'w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded-lg shadow transition'
    : 'w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold py-2 rounded-lg shadow transition';
  const groupButtonClass = isKsyu
    ? 'w-full bg-pink-200 hover:bg-pink-300 text-pink-700 font-semibold py-2 rounded-lg transition'
    : 'w-full bg-violet-200 hover:bg-violet-300 text-violet-700 font-semibold py-2 rounded-lg transition';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <nav className={navClass}>
        <span className='cursor-pointer text-sm text-gray-500 hover:text-gray-800 mb-2' onClick={logoutHandler}>Выйти из аккаунта</span>
        <button className={buttonClass} onClick={() => setShowCreateGroup((prev) => !prev)}>Создать группу</button>
        {showCreateGroup && (
          <form onSubmit={createGroup} className="w-full flex flex-col gap-2 mt-2">
            <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} placeholder="Имя группы" className="rounded-lg border border-pink-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50 text-pink-900 transition" />
            <button type='submit' className={buttonClass}>Создать</button>
          </form>
        )}
        <div className="w-full mt-4">
          <p className="text-xs text-gray-400 mb-1">Пользователи</p>
          <div className="flex flex-col gap-2">
            {users.map(user => (
              <button key={user.id} className={buttonClass} onClick={() => createPrivateChat(user.id)}>
                {user.name}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full mt-4">
          <p className="text-xs text-gray-400 mb-1">Группы</p>
          <div className="flex flex-col gap-2">
            {groups.map(group => (
              <button key={group.id} className={groupButtonClass} onClick={() => RoudToGroupChat(group.id)}>
                {group.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout