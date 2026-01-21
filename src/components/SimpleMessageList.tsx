import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageItem } from './MessageItem';

export const SimpleMessageList: React.FC = () => {
  const messages = useChatStore((state) => state.messages);
  const isGenerating = useChatStore((state) => state.isGenerating);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastMessageIdRef = useRef<string | null>(null);

  // Автоскролл при генерации или новых сообщениях
  useEffect(() => {
    if (!containerRef.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage.id !== lastMessageIdRef.current;

    // Скроллим если это новое сообщение или идёт генерация
    if (isNewMessage || (isGenerating && shouldAutoScroll)) {
      lastMessageIdRef.current = lastMessage.id;
      
      // Используем requestAnimationFrame для надёжности
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isGenerating, shouldAutoScroll]);

  // Отслеживание скролла пользователя
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-white"
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
