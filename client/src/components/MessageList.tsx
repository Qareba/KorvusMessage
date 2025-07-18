import type { RefObject } from "react";

type Message = { text: string, id: number, user: { name: string } }
type MessageListProps = {
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  socketRef: RefObject<WebSocket | null>
}
import React from 'react'

function MessageList({messages, socketRef}: MessageListProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const deleteHandler = (e: React.MouseEvent<HTMLSpanElement> ,id: number) => {
    e.preventDefault();
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "delete", id }));
    }
  }
  console.log(user);
  

  return (
    <div>
        {
          messages.map((el) => (
            <div
              className={`flex ${user === el.user.name ? 'justify-end mr-2' : 'justify-start ml-2'}`}
              key={el.id}
            >
              <div className={` mb-3 rounded-2xl shadow-sm px-4 py-2${user === el.user.name
                ? user == 'ксю' ? "border-2 border-pink-600 bg-pink-200 rounded-md": "border-2 border-green-600 bg-green-200 rounded-md"
                : "border-2 border-blue-300 bg-blue-100 rounded-md"}`}
              >
                <p>{el.user.name}:</p>
                <h3>
                  {el.text}
                  {user === el.user.name && (
                    <span
                      onClick={(e) => deleteHandler(e, el.id)}
                      style={{ color: 'red', cursor: 'pointer' }}
                    >X</span>
                  )}
                </h3>
              </div>
            </div>
          ))
        }
    </div>
  )
}

  export default MessageList