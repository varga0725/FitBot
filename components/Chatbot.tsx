import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { MessageSender } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onTriggerMotivation: () => void;
  isLoading: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, onTriggerMotivation, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl h-full flex flex-col rounded-2xl border border-white/10 shadow-2xl">
      <div className="p-4 border-b border-white/10">
        <h2 id="chatbot-title" className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-500)]">
          FitBot Motivációs Partner
        </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'} animate-scale-in`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-3xl ${
                msg.sender === MessageSender.USER
                  ? 'bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] text-white rounded-br-lg'
                  : 'bg-white/10 text-gray-200 rounded-bl-lg'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-white/10 text-gray-200 rounded-3xl rounded-bl-lg p-2"><LoadingSpinner text="Írok..."/></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={onTriggerMotivation}
          className="group w-full mb-3 text-sm text-center bg-white/5 hover:bg-white/10 active:bg-white/20 text-[var(--color-primary-400)] font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
          <span>Kihagytam egy edzést (szimuláció)</span>
        </button>
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Írj a FitBot-nak..."
            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition duration-200 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] hover:shadow-md hover:shadow-[var(--glow-color)] text-white font-bold p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 active:scale-100 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;