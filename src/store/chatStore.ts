import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  
  // Actions
  addMessage: (message: Omit<Message, 'id'>) => void;
  updateLastMessage: (content: string) => void;
  setIsGenerating: (value: boolean) => void;
  stopGenerating: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isGenerating: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: crypto.randomUUID() }]
  })),

  // Критично для производительности: обновляем только последнее сообщение
  updateLastMessage: (content) => set((state) => {
    const newMessages = [...state.messages];
    if (newMessages.length > 0) {
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content
      };
    }
    return { messages: newMessages };
  }),

  setIsGenerating: (value) => set({ isGenerating: value }),
  
  stopGenerating: () => set({ isGenerating: false })
}));
