import { useState, useRef, useEffect } from 'react';
import Header from '../layout/Header';
import { api } from '../../lib/api';
import { abstractPII } from '../../lib/pii';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatAssistantProps {
  patientId: string;
  patient?: any;
  todayCheckin?: any;
}

export default function ChatAssistant({ patientId, patient, todayCheckin }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Abstract PII before sending
      const piiData = patient ? {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        guardianName: patient.guardian_name || undefined,
        guardianContact: patient.guardian_contact || undefined,
      } : null;
      const abstractedMessage = abstractPII(userMessage, piiData);

      // Build check-in context if available
      const checkinContext = todayCheckin ? {
        mood: todayCheckin.mood,
        energy: todayCheckin.energy,
        stress: todayCheckin.stress,
        sleep_hours: todayCheckin.sleep_hours,
        interest: todayCheckin.interest,
      } : undefined;

      const result = await api.chat(patientId, abstractedMessage, checkinContext);
      setMessages(prev => [...prev, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100% - 48px)' }}>
      <Header title="Chat" subtitle="Talk with your AI companion" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center">
              <Bot size={28} className="text-indigo-400" />
            </div>
            <p className="text-sm text-slate-500">Hi! I'm here to listen and help you reflect.</p>
            <p className="text-xs text-slate-400 mt-1">Share what's on your mind today</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-indigo-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-indigo-600" />
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none max-h-24"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
