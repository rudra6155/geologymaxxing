'use client';

import { useState, useRef, useEffect } from 'react';

export interface AskAiModalProps {
  chapterSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export function AskAiModal({ chapterSlug, isOpen, onClose }: AskAiModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, chapterSlug })
      });

      if (!response.ok) {
        let errorMsg = "An unexpected error occurred.";
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch { /* ignore parse error */ }
        
        setMessages(prev => [...prev, { role: 'error', content: errorMsg }]);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body stream");
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim().startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                const text = data.choices[0]?.delta?.content;
                if (text) {
                  setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last.role === 'assistant') {
                      last.content += text;
                    }
                    return next;
                  });
                }
              } catch (e) {
                // Ignore incomplete JSON chunks or parse errors from split stream chunks
              }
            }
          }
        }
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'error', content: "Failed to communicate with AI. Please check your connection." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-basalt/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full h-[85vh] sm:h-[600px] sm:max-w-md bg-basalt border border-basalt-lighter/50 sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-basalt-lighter/30 bg-fieldnote/50 sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-core/20 flex items-center justify-center text-core">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>Doubt Solver AI</h2>
              <p className="text-[10px] text-chalk-muted uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>Grounded on Curriculum</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-chalk-muted hover:text-chalk transition-colors rounded-full hover:bg-basalt-lighter/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="text-core mb-4 opacity-50">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-chalk text-sm font-medium">What are you stuck on?</p>
              <p className="text-chalk-dim text-xs mt-2 max-w-[250px]">I can explain any concept from this chapter. My answers are sourced strictly from your syllabus.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-core text-basalt font-medium rounded-tr-sm' 
                    : msg.role === 'error'
                      ? 'bg-oxide/20 border border-oxide/30 text-oxide rounded-tl-sm text-sm'
                      : 'bg-fieldnote border border-fieldnote-lighter/50 text-chalk rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-fieldnote border border-fieldnote-lighter/50 rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-chalk-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-chalk-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-chalk-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-basalt-lighter/30 bg-basalt">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="w-full bg-fieldnote border border-fieldnote-lighter/50 rounded-full pl-5 pr-12 py-3.5 text-sm text-chalk placeholder:text-chalk-muted/50 focus:outline-none focus:border-core/50 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-core text-basalt rounded-full disabled:opacity-50 disabled:bg-chalk-dim transition-colors"
            >
              <svg className="w-4 h-4 translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-3 text-[10px] text-chalk-muted/50" style={{ fontFamily: 'var(--font-mono)' }}>
            AI can make mistakes. Check your textbook.
          </div>
        </div>
      </div>
    </div>
  );
}
