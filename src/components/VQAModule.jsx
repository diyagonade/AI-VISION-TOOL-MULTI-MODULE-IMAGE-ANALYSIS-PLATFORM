import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { ImageProcessorService } from '../services/ImageProcessorService';

export function VQAModule({ imageData, onSaveInteraction }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const question = inputValue.trim();
    setInputValue('');

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const result = await ImageProcessorService.processVQA(imageData, question);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: result.answer,
        confidence: result.confidence,
        timestamp: result.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (onSaveInteraction) {
        onSaveInteraction(question, result.answer, result.confidence);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Failed to process your question. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ask me anything about the image
            </h3>
            <p className="text-gray-500 max-w-md">
              I can identify objects, describe scenes, answer questions about colors, count
              items, and more!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.confidence && (
                    <p className="text-xs mt-2 opacity-70">
                      Confidence: {(message.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about the image..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
