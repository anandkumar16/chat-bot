import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import Markdown from 'react-markdown';
import { FiSend, FiUser, FiCopy, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const makeRequestAPI = async (prompt) => {
  const res = await axios.post("https://api-dostai-qocw.onrender.com/generate", { prompt });
  return res.data;
};

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, and welcome to Dost AI! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ["gemini-ai-request"],
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: data,
          sender: "bot",
          timestamp: new Date(),
        }
      ]);
    },
  });

  const submitHandler = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: prompt,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    mutation.mutate(prompt);
    setPrompt("");
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src="/image.png" 
              alt="Assistant Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full w-3 h-3 border-2 border-white"></div>
          </div>
          <div>
            <h1 className="font-bold text-indigo-800">Dost AI</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3xl rounded-2xl px-4 py-3 relative group ${message.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white shadow-sm rounded-bl-none'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-white transform rotate-45"></div>
                  )}
                  {message.sender === 'user' && (
                    <div className="absolute -right-2 top-0 w-4 h-4 bg-indigo-600 transform rotate-45"></div>
                  )}
                  
                  <div className="flex items-start">
                    {message.sender === 'bot' && (
                      <div className="mr-2 mt-0.5">
                        <img 
                          src="/image.png" 
                          alt="Bot Avatar" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Markdown 
                        components={{
                          p: ({ children }) => (
                            <p className={`${message.sender === 'user' ? 'text-white' : 'text-gray-800'} max-w-none whitespace-pre-wrap`}>
                              {children}
                            </p>
                          )
                        }}
                      >
                        {message.text}
                      </Markdown>
                      <div className={`text-xs mt-1 flex justify-between items-center ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        <span>{formatTime(message.timestamp)}</span>
                        <button 
                          onClick={() => copyToClipboard(message.text, message.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          {copiedId === message.id ? (
                            <FiCheck className="text-green-400" />
                          ) : (
                            <FiCopy />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="ml-2 mt-0.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <FiUser size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-3xl rounded-2xl bg-white shadow-sm px-4 py-3 rounded-bl-none relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-white transform rotate-45"></div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-400"></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={submitHandler}
          className="bg-white rounded-xl shadow-lg p-1 border border-gray-200 focus-within:border-indigo-300 transition-colors"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Message Dost AI..."
              className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || mutation.isPending}
              className={`p-2 rounded-full mr-1 ${!prompt.trim() || mutation.isPending 
                ? 'text-gray-400' 
                : 'text-white bg-indigo-600 hover:bg-indigo-700'}`}
            >
              <FiSend size={20} />
            </button>
          </div>
        </form>
        
        <p className="text-xs text-center text-gray-500 mt-2">
          Dost AI may produce inaccurate information. Consider verifying important information.
        </p>
      </main>
    </div>
  );
};

export default App;
