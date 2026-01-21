// Mock данные для генерации
const CODE_SAMPLES = [
    'const fetchData = async () => {\n  const response = await fetch("/api/data");\n  return response.json();\n};\n\n',
    'function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}\n\n',
    'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n',
  ];
  
  const LOREM_WORDS = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 
    'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
    'et', 'dolore', 'magna', 'aliqua', 'Ut', 'enim', 'ad', 'minim', 'veniam'
  ];
  
  export class TextStreamGenerator {
    private intervalId: number | null = null;
    private targetWords = 10000;
    private chunks: string[] = [];
    private onChunk: (chunk: string) => void;
    private onComplete: () => void;
  
    constructor(
      onChunk: (chunk: string) => void,
      onComplete: () => void
    ) {
      this.onChunk = onChunk;
      this.onComplete = onComplete;
      this.prepareChunks();
    }
  
    // Предгенерируем чанки, чтобы не тратить CPU во время стриминга
    private prepareChunks() {
      this.chunks = [];
      let tempContent = '';
      
      for (let i = 0; i < this.targetWords; i++) {
        // Каждые 50 слов добавляем code block
        if (i > 0 && i % 50 === 0) {
          tempContent += '\n\n```typescript\n' + 
            CODE_SAMPLES[Math.floor(Math.random() * CODE_SAMPLES.length)] + 
            '```\n\n';
        }
        
        // Каждые 20 слов - новая строка
        if (i > 0 && i % 20 === 0) {
          tempContent += '\n\n**Important point:** ';
        }
        
        tempContent += LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)] + ' ';
        
        // Создаем чанки по 5-10 слов
        if (i > 0 && i % 7 === 0) {
          this.chunks.push(tempContent);
          tempContent = '';
        }
      }
      
      if (tempContent) this.chunks.push(tempContent);
    }
  
    start() {
      let chunkIndex = 0;
      
      // Экстремально быстрая генерация: каждые 10-20мс
      this.intervalId = window.setInterval(() => {
        if (chunkIndex >= this.chunks.length) {
          this.stop();
          this.onComplete();
          return;
        }
        
        this.onChunk(this.chunks[chunkIndex]);
        chunkIndex++;
      }, 15); // 15ms = ~66 чанков в секунду
    }
  
    stop() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
  