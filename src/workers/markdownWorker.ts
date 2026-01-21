// Web Worker для парсинга Markdown в отдельном потоке
// Это демонстрация концепции — в production используй библиотеку типа 'remark' для парсинга в AST

self.onmessage = (e: MessageEvent) => {
    const { id, markdown } = e.data;
    
    // В реальном проекте здесь был бы парсинг Markdown в AST
    // Например, с помощью 'remark' или 'marked'
    // const parsed = parseMarkdownToAST(markdown);
    
    // Для демонстрации просто возвращаем исходный текст
    self.postMessage({ id, parsed: markdown });
  };
  
  export {};
  