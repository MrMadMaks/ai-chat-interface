import React, { useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { TextStreamGenerator } from '../utils/textGenerator';
import { VirtualizedMessageList } from './VirtualizedMessageList';

export const ChatInterface: React.FC = () => {
  const { addMessage, updateLastMessage, setIsGenerating, isGenerating, messages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const generatorRef = useRef<TextStreamGenerator | null>(null);

  const handleGenerate = () => {
    if (isGenerating) return;

    // Добавляем user сообщение
    addMessage({ role: 'user', content: inputValue || 'Generate a long response' });
    setInputValue('');

    // Создаем пустое assistant сообщение
    addMessage({ role: 'assistant', content: '', isStreaming: true });
    setIsGenerating(true);

    let accumulatedContent = '';

    // Создаем генератор с коллбэками
    generatorRef.current = new TextStreamGenerator(
      // onChunk: вызывается каждые 15ms
      (chunk) => {
        accumulatedContent += chunk;
        // Обновляем только последнее сообщение
        updateLastMessage(accumulatedContent);
      },
      // onComplete
      () => {
        setIsGenerating(false);
        // Убираем индикатор стриминга
        const updatedMessages = [...useChatStore.getState().messages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1].isStreaming = false;
          useChatStore.setState({ messages: updatedMessages });
        }
      }
    );

    generatorRef.current.start();
  };

  const handleStop = () => {
    if (generatorRef.current) {
      generatorRef.current.stop();
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">AI Chat Interface</h1>
        <p className="text-sm opacity-90">
          {messages.length} messages • High-performance streaming
        </p>
      </div>

      {/* Messages */}
      <VirtualizedMessageList />

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
            placeholder="Type a message or press Generate..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          
          {!isGenerating ? (
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
