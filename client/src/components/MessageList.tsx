import type { RefObject } from "react";

type Message = { text: string, id: number }
type MessageListProps = {
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  socketRef: RefObject<WebSocket | null>
}
import React from 'react'
function MessageList({messages, socketRef}: MessageListProps) {

  const deleteHandler = (e: React.MouseEvent<HTMLSpanElement> ,id: number) => {
    e.preventDefault();
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "delete", id }));
    }
  }

  return (
    <div>
        {
          messages.map((el) => (
            <>
            <h3>{el.text} <span onClick={(e) => deleteHandler(e, el.id)} style={{color: 'red', cursor: 'pointer'}}>X</span></h3>
            </>
          ))
        }
    </div>
  )
}

  export default MessageList