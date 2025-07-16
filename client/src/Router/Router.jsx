import {createBrowserRouter} from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../Pages/LoginPage'
import RegPage from '../Pages/RegPage'
import Chat from '../components/Chat'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/chats/:chatType/:chatId',
        element: <Chat />,
      }
      
    ],
  },
])

export default router
