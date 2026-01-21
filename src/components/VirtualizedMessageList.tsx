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
  const itemHeightsRef = useRef<Map<number, number>>(new Map());

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

  // Пересчитываем размеры при изменении сообщений
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [messages]);

  // Отслеживание скролла пользователя
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }: ListOnScrollProps) => {
    if (!scrollUpdateWasRequested) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom = scrollOffset > (container.scrollHeight - container.clientHeight - 100);
        setShouldAutoScroll(isNearBottom);
      }
    }
  }, []);

  // Улучшенная функция для вычисления высоты
  const getItemSize = useCallback((index: number) => {
    // Проверяем кэш
    if (itemHeightsRef.current.has(index)) {
      return itemHeightsRef.current.get(index)!;
    }

    const message = messages[index];
    
    // Более точная эвристика для Markdown
    let estimatedHeight = 80; // Базовая высота (padding + header)
    
    // Считаем количество строк (переносы)
    const lines = message.content.split('\n').length;
    estimatedHeight += lines * 24; // 24px на строку
    
    // Добавляем высоту для code blocks
    const codeBlocks = (message.content.match(/```/g) || []).length / 2;
    estimatedHeight += codeBlocks * 150; // 150px на code block
    
    // Ограничиваем минимум и максимум
    estimatedHeight = Math.max(100, Math.min(estimatedHeight, 3000));
    
    // Кэшируем
    itemHeightsRef.current.set(index, estimatedHeight);
    
    return estimatedHeight;
  }, [messages]);

  // Рендер функция для каждого элемента списка
  const Row = useCallback(({ index }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    return <MessageItem message={message} />;
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-white">
      <VariableSizeList
        ref={listRef}
        height={listHeight}
        itemCount={messages.length}
        itemSize={getItemSize}
        width="100%"
        onScroll={handleScroll}
        overscanCount={2}
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};
