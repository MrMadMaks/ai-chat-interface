import React, { useRef, useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { TextStreamGenerator } from '../utils/textGenerator';
import { SimpleMessageList } from './SimpleMessageList';

export const ChatInterface: React.FC = () => {
  const { addMessage, updateLastMessage, setIsGenerating, isGenerating, messages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({ messages: 0, chars: 0, words: 0 });
  const generatorRef = useRef<TextStreamGenerator | null>(null);

  // Статистика производительности
  useEffect(() => {
    if (showStats) {
      const interval = setInterval(() => {
        const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
        const totalWords = messages.reduce((acc, m) => 
          acc + m.content.split(/\s+/).filter(w => w.length > 0).length, 0
        );
        
        setStats({
          messages: messages.length,
          chars: totalChars,
          words: totalWords
        });
        
        console.log('Messages:', messages.length, 
                    'Total chars:', totalChars,
                    'Total words:', totalWords);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showStats, messages]);

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
        updateLastMessage(accumulatedContent);
      },
      // onComplete
      () => {
        setIsGenerating(false);
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
      const updatedMessages = [...useChatStore.getState().messages];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1].isStreaming = false;
        useChatStore.setState({ messages: updatedMessages });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Chat Interface</h1>
            <p className="text-sm opacity-90">
              {messages.length} messages • High-performance streaming
            </p>
          </div>
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="text-xs bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>
        
        {/* Stats Panel */}
        {showStats && (
          <div className="mt-4 grid grid-cols-3 gap-4 bg-blue-700 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.messages}</div>
              <div className="text-xs opacity-80">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.chars.toLocaleString()}</div>
              <div className="text-xs opacity-80">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
              <div className="text-xs opacity-80">Words</div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <SimpleMessageList />

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
