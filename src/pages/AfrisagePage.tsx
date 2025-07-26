import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'afrisage';
  timestamp: Date;
}

const AfrisagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Afrisage, your AI-powered business coach specializing in African markets. I'm here to help you navigate business opportunities, understand market dynamics, and provide insights on legal frameworks across Africa. How can I assist you today?",
      sender: 'afrisage',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAfrisageResponse(inputMessage),
        sender: 'afrisage',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAfrisageResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('business') && input.includes('kenya')) {
      return "Kenya offers excellent business opportunities! Key considerations include: 1) Business registration through eCitizen portal, 2) Understanding the Kenya Revenue Authority (KRA) tax requirements, 3) Leveraging M-Pesa for digital payments, 4) Considering the growing tech sector in Nairobi's Silicon Savannah. Would you like specific guidance on any of these areas?";
    }

    if (input.includes('investment') || input.includes('funding')) {
      return "African investment landscape is evolving rapidly! Consider these opportunities: 1) Fintech solutions addressing financial inclusion, 2) Agtech innovations for food security, 3) Renewable energy projects, 4) E-commerce platforms. Key funding sources include development finance institutions, impact investors, and local venture capital. What sector interests you most?";
    }

    if (input.includes('market') && input.includes('africa')) {
      return "The African market presents immense potential with 1.4 billion people and growing middle class. Key insights: 1) Mobile-first approach is crucial, 2) Local partnerships are essential, 3) Understanding cultural nuances varies by region, 4) Regulatory frameworks differ significantly between countries. Which specific market are you targeting?";
    }

    if (input.includes('legal') || input.includes('regulation')) {
      return "Legal frameworks across Africa vary significantly. General considerations: 1) Business registration requirements differ by country, 2) Tax obligations and incentives vary, 3) Employment laws have local nuances, 4) Intellectual property protection varies. I recommend consulting local legal experts. Which country's regulations are you interested in?";
    }

    return "That's an interesting question about African business! Based on my knowledge of African markets, I'd recommend considering local market dynamics, regulatory requirements, and cultural factors. Could you provide more specific details about your business context or the particular African market you're interested in? This will help me give you more targeted advice.";
  };

  const suggestedQuestions = [
    "How do I start a business in Nigeria?",
    "What are the best investment opportunities in East Africa?",
    "Tell me about fintech regulations in South Africa",
    "How can I expand my business across African markets?"
  ];

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-500/10 rounded-full p-3 mr-4">
                <Bot className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Afrisage AI</h1>
                <p className="text-gray-400">Your AI-powered African business coach</p>
              </div>
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-gray-300 hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex mr-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-gray-400">Afrisage is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Afrisage about African business opportunities..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AfrisagePage;