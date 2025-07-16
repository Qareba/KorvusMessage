import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../AuthContext';

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
  const [chatType, setChatType] = useState<string>('')

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

  

  console.log(users);

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
  

  return (
    <div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{cursor: 'pointer'}} onClick={logoutHandler}>выйти из аккаунта</span>
        <button onClick={() => setShowCreateGroup(true)}>Create group</button>
        {
          showCreateGroup ? (
            <form onSubmit={createGroup}>
              <label>
                name group
                <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)}/>
                <button type='submit'>Create</button>
              </label>
            </form>
          ): (
            <></>
          )
        }
        {
          users.map(user => (
            <button key={user.id} onClick={() => createPrivateChat(user.id)}>
              {user.name}
            </button>
          ))
        }
        <p>Группы</p>
        {
          groups.map(group => (
            <button key={group.id} onClick={() => RoudToGroupChat(group.id)}>
              {group.name}
            </button>
          ))
        }
      </nav>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}

export default Layout