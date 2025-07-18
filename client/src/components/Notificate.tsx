import { log } from "node:console"
import { useEffect, useRef } from "react"

export const ChatWithNotification = () => {
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 1. Запрашиваем разрешение
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission)
      })
    }

    // 2. Открываем WebSocket
    const wsUrl = `wss://192.168.8.209:8000/ws/notifications?token=${localStorage.getItem('token')}`
    console.log("Открываю WebSocket для уведомлений:", wsUrl)
    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onopen = () => {
      console.log("WebSocket для уведомлений успешно подключён")
    }

    socketRef.current.onclose = (e) => {
      console.log("WebSocket для уведомлений закрыт", e)
    }

    socketRef.current.onerror = (e) => {
      console.error("WebSocket ошибка:", e)
    }

    socketRef.current.onmessage = (event) => {
      console.log("Получено уведомление (raw):", event.data)
      const data = JSON.parse(event.data)
      if (data.event === "notify") {
        let title = data.group ? `Группа: ${data.group}` : "Новое сообщение"
        let body = `От: ${data.from_user}\n${data.message}`
        showNotification(body, title)
      } else {
        console.log("Неизвестный тип уведомления:", data)
      }
    }

    return () => {
      socketRef.current?.close()
    }
  }, [])

  const showNotification = (body: string, title: string) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
      })
      notification.onclick = () => {
        window.focus()
      }
    }
  }

  return <></>
}
