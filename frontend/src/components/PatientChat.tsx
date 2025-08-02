import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, Bot, AlertTriangle, Heart, Pill, Shield } from 'lucide-react';
import { Patient } from '../App';

interface PatientChatProps {
  patient: Patient;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const PatientChat: React.FC<PatientChatProps> = ({ patient, onBack }) => {
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
      text: `Hello! I'm ${patient.name}'s AI assistant. I have access to all of ${patient.name}'s medical records and can help you with any questions about their medical history, allergies, medications, and conditions. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [patient]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('allerg')) {
      return `${patient.name} has the following allergies: ${patient.allergies.join(', ')}. Please note these carefully when prescribing medications or treatments.`;
    }
    
    if (message.includes('medication') || message.includes('drug') || message.includes('prescription')) {
      return `Current medications for ${patient.name}: ${patient.medications.join(', ')}. These were last updated in their medical records.`;
    }
    
    if (message.includes('condition') || message.includes('diagnosis') || message.includes('medical history')) {
      return `${patient.name} has been diagnosed with: ${patient.conditions.join(', ')}. These are their primary medical conditions on record.`;
    }
    
    if (message.includes('vaccine') || message.includes('immunization')) {
      return `Vaccination record for ${patient.name}: ${patient.vaccines.join(', ')}. Their immunizations appear to be up to date.`;
    }
    
    if (message.includes('emergency') || message.includes('contact')) {
      return `Emergency contact for ${patient.name}: ${patient.emergencyContact}. This person should be notified in case of emergencies.`;
    }
    
    if (message.includes('age')) {
      return `${patient.name} is ${patient.age} years old.`;
    }
    
    if (message.includes('summary') || message.includes('overview')) {
      return `Here's a summary for ${patient.name} (Age ${patient.age}):
      
• Allergies: ${patient.allergies.join(', ')}
• Current Medications: ${patient.medications.join(', ')}
• Medical Conditions: ${patient.conditions.join(', ')}
• Vaccinations: ${patient.vaccines.join(', ')}
• Emergency Contact: ${patient.emergencyContact}

Is there anything specific you'd like me to elaborate on?`;
    }
    
    return `I can help you with information about ${patient.name}'s medical records. You can ask me about their allergies, medications, medical conditions, vaccines, or emergency contacts. What specific information do you need?`;
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
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {patient.name} - AI Assistant
                    </h1>
                    <p className="text-sm text-gray-600">
                      Age {patient.age} • Patient ID: {patient.id}
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

      <div className="flex-1 flex">
        {/* Patient Info Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Patient Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{patient.name}</span>
                </div>
                <p className="text-sm text-gray-600">Age: {patient.age}</p>
                <p className="text-sm text-gray-600">ID: {patient.id}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Allergies
              </h4>
              <div className="space-y-2">
                {patient.allergies.map((allergy, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 p-2 rounded text-sm text-red-800">
                    {allergy}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center">
                <Pill className="h-4 w-4 mr-2" />
                Medications
              </h4>
              <div className="space-y-2">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 p-2 rounded text-sm text-blue-800">
                    {medication}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Conditions
              </h4>
              <div className="space-y-2">
                {patient.conditions.map((condition, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 p-2 rounded text-sm text-purple-800">
                    {condition}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Vaccines
              </h4>
              <div className="space-y-2">
                {patient.vaccines.map((vaccine, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 p-2 rounded text-sm text-green-800">
                    {vaccine}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-100'
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
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
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
                  placeholder="Ask about patient's medical history, allergies, medications..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChat;