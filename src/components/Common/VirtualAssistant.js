import React, { useState, useEffect, useRef } from 'react';

// 1. DEFINE YOUR KNOWLEDGE BASE (KEYWORDS)
// This is the "brain" of your assistant.
// It will match any keyword in the array to the answer.
const knowledgeBase = [
  {
    keywords: ['service', 'offer', 'what do you do', 'fix'],
    answer: "We offer a full range of services including: Oil Changes, Tire Rotation, Brake Service, Engine Tune-ups, Battery Replacement, and General Repair."
  },
  {
    keywords: ['hour', 'time', 'open', 'close', 'when'],
    answer: "Our service center is open from 9:00 AM to 6:00 PM, Monday to Saturday. We are closed on Sundays."
  },
  {
    keywords: ['price', 'cost', 'how much', 'fee'],
    answer: "Prices vary by service and vehicle. For example, an Oil Change starts at $49.99. You can also ask about a specific service (e.g., 'how much for brakes?')."
  },
  {
    keywords: ['oil', 'oil change'],
    answer: "An Oil Change is our most common service and starts at $49.99 for most vehicles."
  },
  {
    keywords: ['brake', 'brakes'],
    answer: "A Brake Service starts around $150, but the final price depends on whether you need pads, rotors, or both. We offer a free inspection."
  },
  {
    keywords: ['tire', 'tires', 'rotation'],
    answer: "A Tire Rotation is $24.99, or free with any other service over $100."
  },
  {
    keywords: ['book', 'appointment', 'schedule', 'how to'],
    answer: "You can book an appointment by clicking the 'Appointments' link in the top menu and then selecting 'Book New Appointment'."
  },
  {
    keywords: ['discount', 'deal', 'offer', 'coupon', 'off-peak'],
    answer: "Yes! We offer a 5% off-peak discount for all appointments scheduled on a Monday, Tuesday, or Wednesday."
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    answer: "Hello! How can I help you today? You can ask me about our services, prices, or hours."
  },
  {
    keywords: ['thanks', 'thank you', 'ok'],
    answer: "You're welcome! Is there anything else I can help with?"
  },
  {
    keywords: ['bye', 'goodbye'],
    answer: "Goodbye! Have a great day."
  }
];

// This is the default answer if no keywords are matched
const defaultAnswer = "I'm sorry, I don't understand that. Can you please rephrase? You can ask about our 'services', 'prices', or 'operating hours'.";

// 2. THE NEW COMPONENT LOGIC
const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! How can I help you today? Ask me about services, prices, or booking." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatBodyRef = useRef(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Main logic: finds a response from the knowledge base
  const getBotResponse = (userInput) => {
    const normalizedInput = userInput.toLowerCase();

    // Loop through the knowledge base
    for (const rule of knowledgeBase) {
      // Check if any keyword in the rule is present in the user's input
      const matched = rule.keywords.some(keyword => normalizedInput.includes(keyword));
      
      if (matched) {
        return rule.answer;
      }
    }
    
    // If no match is found, return the default answer
    return defaultAnswer;
  };

  // Handles sending the user's message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const userText = inputValue.trim();

    if (!userText) return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Get and add bot response
    const botText = getBotResponse(userText);
    const botMessage = { sender: 'bot', text: botText };

    // Add a small delay for a more natural feel
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  // This is the floating chat bubble
  if (!isOpen) {
    return (
      <div className="assistant-icon" onClick={() => setIsOpen(true)}>
        💬
      </div>
    );
  }

  // This is the open chat window
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Virtual Assistant</h3>
        <button onClick={() => setIsOpen(false)}>&times;</button>
      </div>
      
      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your question..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default VirtualAssistant;