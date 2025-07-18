import type { RefObject } from "react";
import {Pencil} from 'lucide-react'

type Message = { text: string, id: number, user: { name: string }, edited: boolean }
type MessageListProps = {
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  socketRef: RefObject<WebSocket | null>,
  onEdit: (id: number, text: string) => void,
  user: string
}
import React, { useEffect, useRef, useState } from 'react'

function MessageList({messages, socketRef, onEdit, user}: MessageListProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number,
    y: number,
    messageId: number | null
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const deleteHandler = (e: React.MouseEvent<HTMLSpanElement> ,id: number | null) => {
    e.preventDefault();
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: "delete", id }));
    }
  }

  const messageMenu = (e:  React.MouseEvent<HTMLSpanElement>, id:number, x: number, y: number) => {
    e.preventDefault()
    setContextMenu({x, y, messageId: id})
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isKsyu = user === 'ксю';

  return (
    <div>
      {messages.map((el) => {
        const isOwn = user == el.user.name;
        console.log(user == String(el.user.name));
        
        return (
          <div
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
            key={el.id}
          >
            <div
              onContextMenu={(e) => messageMenu(e, el.id, e.clientX, e.clientY)}
              className={`rounded-2xl shadow-sm px-4 py-2 transition-all
                ${isOwn
                  ? isKsyu
                    ? 'border-2 border-pink-600 bg-pink-200 text-pink-900'
                    : 'border-2 border-violet-600 bg-violet-100 text-violet-900'
                  : 'border-2 border-blue-300 bg-blue-100 text-blue-900'}
              `}
            >
              <p className="text-xs font-semibold mb-1">{el.user.name}:</p>
              <h3 className="break-words">
                {el.text}
              </h3>
              {el.edited && (
                <div className="flex items-center gap-1 text-xs text-gray-500 italic mt-1">
                  <span className="mr-1">изм.</span>
                  <Pencil size={12} className="text-gray-400" />
                </div>
              )}
            </div>
            {isOwn && contextMenu?.messageId == el.id && (
              <div ref={menuRef} className="absolute z-50 bg-white border shadow-lg rounded-md p-2 text-red-600 hover:underline" style={{top: contextMenu.y, left: contextMenu.x - 100}}>
                <button onClick={(e) => deleteHandler(e, contextMenu.messageId)} className="text-red-600 hover:underline">
                  Удалить
                </button>
                <button onClick={() => onEdit(el.id, el.text)} className="text-blue-600 hover:underline">
                  редактировать
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MessageList