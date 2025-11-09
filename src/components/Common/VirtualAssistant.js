import React, { useState } from 'react';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you today? 👋' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Enhanced FAQs with keywords
  const knowledgeBase = [
    {
      category: 'booking',
      keywords: ['book', 'appointment', 'schedule', 'reserve', 'appoint', 'apointment', 'schedul', 'boking', 'buk'],
      question: 'How do I book an appointment?',
      answer: 'Go to "Book Appointment" in the menu and select your vehicle, service type, and preferred date. You can also click the "Book Appointment" button on your dashboard.'
    },
    {
      category: 'vehicle',
      keywords: ['vehicle', 'car', 'add', 'new', 'register', 'vehical', 'vehcile', 'vahicle', 'veicle'],
      question: 'How can I add a new vehicle?',
      answer: 'Navigate to "My Vehicles" from the menu and click the "Add Vehicle" button. Fill in your vehicle details like make, model, year, and registration number.'
    },
    {
      category: 'discount',
      keywords: ['discount', 'offer', 'cheap', 'price', 'off-peak', 'offpeak', 'save', 'discunt', 'discout', 'saving'],
      question: 'What are off-peak discounts?',
      answer: 'Book on weekdays (Monday-Friday) to get a 5% discount on all services! Weekend bookings don\'t have discounts. The system automatically applies the discount.'
    },
    {
      category: 'cancel',
      keywords: ['cancel', 'remove', 'delete', 'stop', 'cancle', 'canel', 'cansle', 'canceling'],
      question: 'How do I cancel an appointment?',
      answer: 'Go to "Appointments" page and click the "Cancel" button next to your scheduled booking. You can only cancel appointments that haven\'t started yet.'
    },
    {
      category: 'payment',
      keywords: ['payment', 'pay', 'money', 'card', 'cash', 'price', 'cost', 'paymet', 'paymnt'],
      question: 'What payment methods do you accept?',
      answer: 'We accept cash and all major credit/debit cards (Visa, MasterCard, Amex) at the service center. Payment is made after service completion.'
    },
    {
      category: 'service_types',
      keywords: ['service', 'type', 'what service', 'services', 'repair', 'maintenance', 'servic', 'servis'],
      question: 'What types of services do you offer?',
      answer: 'We offer: Regular Service, Full Service, Oil Change, Brake Service, Battery Replacement, Tire Service, Engine Repair, Transmission Service, AC Service, and Electrical Work.'
    },
    {
      category: 'status',
      keywords: ['status', 'track', 'progress', 'where', 'check', 'statu', 'progres'],
      question: 'How can I track my service status?',
      answer: 'Go to "Appointments" page to see the status of all your bookings. Status updates include: Scheduled, In Progress, and Completed.'
    },
    {
      category: 'time',
      keywords: ['time', 'hours', 'open', 'close', 'when', 'timing', 'hour'],
      question: 'What are your service hours?',
      answer: 'We are open Monday to Friday: 9:00 AM - 5:00 PM. Available time slots are: 9:00, 10:00, 11:00, 12:00, 2:00, 3:00, 4:00, and 5:00 PM.'
    },
    {
      category: 'edit',
      keywords: ['edit', 'change', 'modify', 'update', 'eddit', 'chang', 'modifi'],
      question: 'Can I edit my appointment?',
      answer: 'Currently you need to cancel the existing appointment and create a new one with your preferred details. Go to Appointments → Cancel → Book New.'
    },
    {
      category: 'feedback',
      keywords: ['feedback', 'review', 'rating', 'rate', 'comment', 'feedbak', 'revew', 'raiting'],
      question: 'How do I leave feedback?',
      answer: 'After your service is completed, go to "Appointments" and click "Leave Feedback" button next to the completed service. Rate 1-5 stars and write your comments.'
    },
    {
      category: 'vehicle_info',
      keywords: ['registration', 'reg', 'number', 'license', 'plate', 'registeration'],
      question: 'What vehicle information do I need?',
      answer: 'You need: Vehicle Make (e.g., Toyota), Model (e.g., Corolla), Year, and Registration Number (e.g., ABC1234). Make sure the registration number is correct.'
    },
    {
      category: 'urgent',
      keywords: ['urgent', 'emergency', 'now', 'immediate', 'quick', 'asap', 'urgnt', 'emergancy'],
      question: 'Do you handle urgent repairs?',
      answer: 'For urgent repairs, please call our service center directly. Online bookings are for scheduled services. Check your booking confirmation email for the contact number.'
    }
  ];

  // Common greetings
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'helo', 'helo', 'hai'];
  const thanks = ['thank', 'thanks', 'thanku', 'thank you', 'thx', 'thnks', 'thnx'];
  const helpWords = ['help', 'assist', 'support', 'guide', 'hlp', 'asist'];

  // Normalize text for better matching
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[?.,!]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Multiple spaces to single
  };

  // Calculate similarity between two words (simple Levenshtein-like)
  const isSimilar = (word1, word2) => {
    if (word1 === word2) return true;
    if (word1.includes(word2) || word2.includes(word1)) return true;
    
    // Check if words are very similar (typo tolerance)
    const minLen = Math.min(word1.length, word2.length);
    if (minLen < 3) return false;
    
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (word1[i] === word2[i]) matches++;
    }
    
    // If 70% characters match, consider similar
    return matches / minLen >= 0.7;
  };

  // Find best matching category
  const findBestMatch = (userInput) => {
    const normalized = normalizeText(userInput);
    const words = normalized.split(' ');
    
    // Check for greetings
    const hasGreeting = greetings.some(greeting => 
      words.some(word => isSimilar(word, greeting))
    );
    if (hasGreeting && words.length <= 3) {
      return {
        found: true,
        answer: 'Hello! 👋 I can help you with: booking appointments, adding vehicles, checking discounts, canceling bookings, payment methods, service types, and more. What would you like to know?'
      };
    }

    // Check for thanks
    const hasThanks = thanks.some(thank => 
      words.some(word => isSimilar(word, thank))
    );
    if (hasThanks) {
      return {
        found: true,
        answer: 'You\'re welcome! 😊 Is there anything else I can help you with?'
      };
    }

    // Check for general help
    const hasHelp = helpWords.some(help => 
      words.some(word => isSimilar(word, help))
    );
    if (hasHelp && words.length <= 3) {
      return {
        found: true,
        answer: 'I can help you with:\n• Booking appointments\n• Adding vehicles\n• Checking service status\n• Understanding discounts\n• Payment information\n• Service types\n\nWhat would you like to know?'
      };
    }

    // Score each knowledge base entry
    let bestMatch = null;
    let bestScore = 0;

    knowledgeBase.forEach(entry => {
      let score = 0;
      
      entry.keywords.forEach(keyword => {
        words.forEach(word => {
          if (isSimilar(word, keyword)) {
            score += 2; // Exact or very similar match
          } else if (word.includes(keyword) || keyword.includes(word)) {
            score += 1; // Partial match
          }
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    });

    // If we found a good match (score >= 1)
    if (bestMatch && bestScore >= 1) {
      return {
        found: true,
        answer: bestMatch.answer
      };
    }

    // Handle incomplete or unclear questions
    return handleUnclearQuestion(normalized, words);
  };

  // Handle unclear or incomplete questions
  const handleUnclearQuestion = (normalized, words) => {
    // Check if question is too short
    if (words.length === 1) {
      const word = words[0];
      
      // Single word queries - try to guess intent
      if (['vehicle', 'car', 'vehical'].some(w => isSimilar(word, w))) {
        return {
          found: true,
          answer: 'I can help with vehicles! Do you want to:\n• Add a new vehicle?\n• Edit an existing vehicle?\n• Delete a vehicle?\n\nPlease let me know what you need!'
        };
      }
      
      if (['book', 'booking', 'appoint'].some(w => isSimilar(word, w))) {
        return {
          found: true,
          answer: 'I can help with appointments! Do you want to:\n• Book a new appointment?\n• View your appointments?\n• Cancel an appointment?\n\nPlease specify!'
        };
      }

      if (['service', 'repair', 'servic'].some(w => isSimilar(word, w))) {
        return {
          found: true,
          answer: 'We offer many services! Types include:\n• Regular Service\n• Oil Change\n• Brake Service\n• Engine Repair\n• AC Service\nAnd more! What specific service do you need?'
        };
      }

      if (['price', 'cost', 'payment', 'pay'].some(w => isSimilar(word, w))) {
        return {
          found: true,
          answer: 'About pricing:\n• Prices vary by service type\n• 5% discount on weekdays!\n• Pay after service completion\n• Accept cash & cards\n\nWhat would you like to know?'
        };
      }
    }

    // Questions with question words
    const questionWords = ['how', 'what', 'where', 'when', 'why', 'can', 'do'];
    const hasQuestionWord = questionWords.some(qw => words.includes(qw));

    if (hasQuestionWord) {
      // Try to guess from remaining words
      const contentWords = words.filter(w => !questionWords.includes(w) && w.length > 2);
      
      if (contentWords.length > 0) {
        return {
          found: true,
          answer: `I'm not sure about that specific question. Here are some topics I can help with:\n\n📅 Booking appointments\n🚗 Adding/managing vehicles\n💰 Discounts & payments\n📊 Service status\n⭐ Feedback & reviews\n\nPlease try asking about one of these topics, or click a question below!`
        };
      }
    }

    // Default for completely unclear
    return {
      found: false,
      answer: 'I didn\'t quite understand that. 🤔 Let me help you! I can answer questions about:\n\n• How to book appointments\n• Adding your vehicle\n• Service types & pricing\n• Off-peak discounts\n• Canceling bookings\n• Payment methods\n\nTry clicking a question below or ask in your own words!'
    };
  };

  const handleQuestionClick = (faq) => {
    setMessages([...messages, 
      { type: 'user', text: faq.question },
      { type: 'bot', text: faq.answer }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages([...messages, { type: 'user', text: userMessage }]);
    setInputValue('');

    // Process the question
    setTimeout(() => {
      const result = findBestMatch(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: result.answer }]);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Quick action buttons based on common intents
  const quickActions = [
    { text: '📅 Book appointment', query: 'How do I book an appointment?' },
    { text: '🚗 Add vehicle', query: 'How can I add a new vehicle?' },
    { text: '💰 Discount info', query: 'What are off-peak discounts?' },
    { text: '❌ Cancel booking', query: 'How do I cancel an appointment?' },
    { text: '⭐ Leave feedback', query: 'How do I leave feedback?' },
  ];

  return (
    <>
      {/* Assistant Icon */}
      {!isOpen && (
        <div className="assistant-icon" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Virtual Assistant 🤖</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '0.75rem', background: '#f9f9f9', borderTop: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: '600' }}>
              Quick Actions:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="qa-button"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setMessages([...messages, 
                      { type: 'user', text: action.query }
                    ]);
                    setTimeout(() => {
                      const result = findBestMatch(action.query);
                      setMessages(prev => [...prev, { type: 'bot', text: result.answer }]);
                    }, 300);
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type your question... (any language/spelling is ok!)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;