import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/ui';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { text: input, type: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await chatService.ask(input);
      const botMessage = {
        text: response.data.answer,
        sources: response.data.sources || [],
        type: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la génération de la réponse.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Quels sont les signes d\'alerte d\'une détresse respiratoire ?',
    'Protocole de prise en charge d\'une douleur thoracique',
    'Comment évaluer le score de Glasgow ?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Assistant MediAssist</h1>
        <p className="text-text-secondary">
          Posez vos questions sur les protocoles médicaux et la documentation clinique
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Comment puis-je vous aider ?
              </h3>
              <p className="text-text-secondary mb-8 max-w-md">
                Posez une question sur un protocole médical, un symptôme, ou une procédure clinique.
              </p>
              
              {/* Suggestions */}
              <div className="space-y-3 w-full max-w-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="flex items-center">
                      <MessageSquareIcon className="w-5 h-5 text-text-muted group-hover:text-primary-500 mr-3 transition-colors" />
                      <span className="text-text-secondary group-hover:text-text-primary">
                        {suggestion}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-500'
                          : 'bg-gradient-to-br from-accent-500 to-teal-600'
                      }`}>
                        {msg.type === 'user' ? (
                          <UserIcon className="w-5 h-5 text-white" />
                        ) : (
                          <SparklesIcon className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`space-y-2 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-primary-500 text-white rounded-tr-none'
                            : 'bg-slate-100 text-text-primary rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                              >
                                <BookOpenIcon className="w-3 h-3 mr-1" />
                                Source {i + 1}: {src}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className="text-xs text-text-muted px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-teal-600 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircleIcon className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question clinique ici..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6"
            >
              {loading ? (
                <LoadingIcon className="w-5 h-5 animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-xs text-text-muted text-center">
            MediAssist fournit des informations à titre indicatif. Consultez toujours un professionnel de santé.
          </p>
        </div>
      </Card>
    </div>
  );
};

// Icon components
function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MessageSquareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BookOpenIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function LoadingIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default Chat;
