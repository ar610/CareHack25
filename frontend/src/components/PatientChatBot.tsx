import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, Bot, Heart } from 'lucide-react';
import { PatientUser } from '../App';

interface PatientChatBotProps {
  user: PatientUser;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const PatientChatBot: React.FC<PatientChatBotProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting from the AI bot
    const initialMessage: Message = {
      id: '1',
      text: `Hello ${user.name}! I'm your personal AI health assistant. I have access to all your medical records and can help you with questions about your health, medications, symptoms, and provide general medical guidance. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [user]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('symptom') || message.includes('feel') || message.includes('pain')) {
      return `I can help you track and understand your symptoms. Based on your current symptom log, you have ${user.symptoms.filter(s => !s.endDate).length} active symptoms. Would you like me to help you log a new symptom or discuss your existing ones? Remember, if you're experiencing severe symptoms, please contact your healthcare provider immediately.`;
    }
    
    if (message.includes('medication') || message.includes('drug') || message.includes('prescription')) {
      const medications = user.medicalRecords.filter(r => r.category === 'medication');
      if (medications.length > 0) {
        return `Based on your records, I can see information about your medications. Always take medications as prescribed by your doctor. If you have questions about dosage, side effects, or interactions, please consult with your healthcare provider or pharmacist.`;
      }
      return `I don't see any medication records in your profile yet. You can upload your prescription information in the "Upload Records" section. For any medication questions, always consult with your healthcare provider.`;
    }
    
    if (message.includes('allerg') || message.includes('reaction')) {
      const allergies = user.medicalRecords.filter(r => r.category === 'allergy');
      if (allergies.length > 0) {
        return `I can see you have allergy information in your records. It's important to always inform healthcare providers about your allergies before any treatment. Make sure to carry this information with you, especially in emergency situations.`;
      }
      return `I don't see any allergy information in your records. If you have known allergies, please add them to your medical records. This information is crucial for your safety during medical treatments.`;
    }
    
    if (message.includes('appointment') || message.includes('doctor') || message.includes('visit')) {
      return `You have ${user.appointments.length} upcoming appointments in your calendar. Regular check-ups are important for maintaining good health. Would you like me to help you prepare questions for your next doctor visit?`;
    }
    
    if (message.includes('emergency') || message.includes('urgent') || message.includes('serious')) {
      return `⚠️ If you're experiencing a medical emergency, please call emergency services immediately (911 in the US) or go to the nearest emergency room. I'm here to provide general health information, but I cannot replace professional medical care in urgent situations.`;
    }
    
    if (message.includes('record') || message.includes('history')) {
      return `You currently have ${user.medicalRecords.length} medical records in your profile. Keeping comprehensive medical records helps healthcare providers give you better care. You can upload new records anytime using the "Upload Records" feature.`;
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return `I can help you with:
      
• Understanding your medical records and history
• Tracking and discussing symptoms
• Reminding you about appointments and medications
• Providing general health information
• Preparing for doctor visits
• Managing your health calendar

What would you like to know more about?`;
    }
    
    return `I'm here to help with your health-related questions! I can discuss your medical records, symptoms, appointments, and provide general health guidance. What specific information would you like to know about your health?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      Personal AI Health Assistant
                    </h1>
                    <p className="text-sm text-gray-600">
                      Your personalized medical guidance
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    message.sender === 'user' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`whitespace-pre-wrap ${
                      message.sender === 'user' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {message.text}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-green-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-3xl bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your health, symptoms, medications, or any medical questions..."
                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatBot;