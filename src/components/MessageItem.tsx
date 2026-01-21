import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../store/chatStore';

interface MessageItemProps {
  message: Message;
  style?: React.CSSProperties;
}

// memo() предотвращает ре-рендер, если message не изменился
export const MessageItem = memo(({ message, style }: MessageItemProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      style={style} 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-3`}
    >
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-xs font-semibold mb-1 opacity-70">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        
        {/* Markdown рендерится только для видимых сообщений */}
        <div className="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для memo
  // Ре-рендерим только если изменился content или isStreaming
  return prevProps.message.content === nextProps.message.content &&
         prevProps.message.isStreaming === nextProps.message.isStreaming;
});

MessageItem.displayName = 'MessageItem';
