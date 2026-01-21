import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VariableSizeList } from 'react-window';
import type { ListOnScrollProps } from 'react-window';
import { useChatStore } from '../store/chatStore';
import { MessageItem } from './MessageItem';


export const VirtualizedMessageList: React.FC = () => {
  const messages = useChatStore((state) => state.messages);
  const isGenerating = useChatStore((state) => state.isGenerating);
  
  const listRef = useRef<VariableSizeList>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(600);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Динамический размер контейнера
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Автоскролл при генерации
  useEffect(() => {
    if (shouldAutoScroll && listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages, shouldAutoScroll, isGenerating]);

  // Отслеживание скролла пользователя
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }: ListOnScrollProps) => {
    // Если пользователь скроллит вручную - отключаем автоскролл
    if (!scrollUpdateWasRequested) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom = scrollOffset > (container.scrollHeight - container.clientHeight - 100);
        setShouldAutoScroll(isNearBottom);
      }
    }
  }, []);

  // Функция для вычисления высоты каждого элемента
  const getItemSize = useCallback((index: number) => {
    const message = messages[index];
    // Простая эвристика: 50px базовая высота + 0.5px на символ
    const estimatedHeight = 50 + (message.content.length * 0.5);
    return Math.min(estimatedHeight, 2000); // Макс 2000px
  }, [messages]);

  // Рендер функция для каждого элемента списка
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    return <MessageItem message={message} style={style} />;
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-white">
      <VariableSizeList
        ref={listRef}
        height={listHeight}
        itemCount={messages.length}
        itemSize={getItemSize}
        width="100%"
        onScroll={handleScroll}
        overscanCount={2} // Рендерим +2 элемента сверху/снизу для плавности
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};
