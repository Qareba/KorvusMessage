import { RouterProvider } from 'react-router-dom'
import './App.css'
import router from './Router/Router'
import {ChatWithNotification} from './components/Notificate'

function App() {

  return (
    <>
    <RouterProvider router={router}/>
    <ChatWithNotification/>
    </>
  )
}

export default App
