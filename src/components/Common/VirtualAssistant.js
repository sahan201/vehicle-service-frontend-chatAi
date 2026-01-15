import React, { useState, useEffect, useRef } from "react";
import '../../styles/VirtualAssistant.css';

// --- Levenshtein Distance Function ---
// This is a standard algorithm for "fuzzy" string matching.
// It's much more powerful than the old `isSimilar` function.
const levenshteinDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! How can I help you today? 👋" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const chatBodyRef = useRef(null);

  // --- Improved Knowledge Base ---
  // 1. Removed all misspelled keywords (Levenshtein makes them unnecessary).
  // 2. Proofread and improved grammar of all answers.
  // 3. Updated "discount" answer to be accurate with our new dynamic system.
  const knowledgeBase = [
    {
      category: "booking",
      keywords: ["book", "appointment", "schedule", "reserve"],
      question: "How do I book an appointment?",
      answer:
        'You can book a new service by going to the "Book Service" page from the main menu or by clicking the "Book Appointment" button on your dashboard.',
    },
    {
      category: "vehicle",
      keywords: ["vehicle", "car", "add", "new", "register"],
      question: "How can I add a new vehicle?",
      answer:
        'Navigate to your "Customer Dashboard" and find the "My Vehicles" tab. Click the "Add Vehicle" button and fill in your vehicle\'s details.',
    },
    {
      category: "discount",
      keywords: ["discount", "offer", "cheap", "price", "off-peak", "save"],
      question: "What are off-peak discounts?",
      answer:
        "We offer a 5% off-peak discount! The specific days (like Mondays or Tuesdays) are set by our manager based on booking volume. The discount is automatically applied when you book on an eligible day.",
    },
    {
      category: "cancel",
      keywords: ["cancel", "remove", "delete", "stop"],
      question: "How do I cancel an appointment?",
      answer:
        'Go to your "Customer Dashboard" and find your list of "My Appointments". You can click the "Cancel" button next to any upcoming appointment. Please note you can only cancel services that have not yet started.',
    },
    {
      category: "payment",
      keywords: ["payment", "pay", "money", "card", "cash", "price", "cost"],
      question: "What payment methods do you accept?",
      answer:
        "We accept cash and all major credit/debit cards (Visa, MasterCard, etc.) at the service center *after* your service is completed.",
    },
    {
      category: "service_types",
      keywords: ["service", "type", "services", "repair", "maintenance"],
      question: "What types of services do you offer?",
      answer:
        "We offer a wide range of services, including: Regular Service, Oil Changes, Brake Service, Battery Replacement, Tire Service, Engine Diagnostics, and AC Repair.",
    },
    {
      category: "status",
      keywords: ["status", "track", "progress", "where", "check"],
      question: "How can I track my service status?",
      answer:
        'You can see the live status of your service in your "Customer Dashboard" under "My Appointments". The status will update from "Scheduled" to "In Progress" and finally to "Completed".',
    },
    {
      category: "time",
      keywords: ["time", "hours", "open", "close", "when", "timing", "hour"],
      question: "What are your service hours?",
      answer:
        "Our service hours are from 6:00 AM to 6:00 PM. You can see all available booking slots when you use the booking form.",
    },
    {
      category: "edit",
      keywords: ["edit", "change", "modify", "update"],
      question: "Can I edit my appointment?",
      answer:
        "Currently, you'll need to cancel your existing appointment and book a new one with your preferred details. You can do this from your dashboard.",
    },
    {
      category: "feedback",
      keywords: ["feedback", "review", "rating", "rate", "comment"],
      question: "How do I leave feedback?",
      answer:
        'After your service is marked "Completed", a "Leave Feedback" button will appear next to that appointment in your dashboard. You can give a 1-5 star rating and leave a comment.',
    },
    {
      category: "vehicle_info",
      keywords: ["registration", "reg", "number", "license", "plate"],
      question: "What vehicle information do I need?",
      answer:
        "When adding a vehicle, you'll need its Make (e.g., Toyota), Model (e.g., Camry), Year, and Vehicle Number (license plate).",
    },
    {
      category: "urgent",
      keywords: ["urgent", "emergency", "now", "immediate", "quick", "asap"],
      question: "Do you handle urgent repairs?",
      answer:
        "For urgent repairs or emergencies, please call our service center directly. Our online booking system is for scheduled services. You can find our contact number on your booking confirmation email.",
    },
  ];

  // Common greetings and responses
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon"];
  const thanks = ["thank", "thanks", "thanku", "thank you", "thx"];
  const helpWords = ["help", "assist", "support", "guide"];

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[?.,!]/g, "") // Remove punctuation
      .replace(/\s+/g, " "); // Multiple spaces to single
  };

  // --- New `findBestMatch` using Levenshtein Distance ---
  const findBestMatch = (userInput) => {
    const normalized = normalizeText(userInput);
    const words = normalized.split(" ");

    // 1. Check for simple greetings
    if (words.length <= 3 && greetings.some(g => words.includes(g))) {
      return "Hello! 👋 I can help with questions about booking, vehicles, service status, and more. How can I assist you?";
    }

    // 2. Check for simple thanks
    if (words.length <= 3 && thanks.some(t => words.includes(t))) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }

    // 3. Check for simple help requests
    if (words.length <= 3 && helpWords.some(h => words.includes(h))) {
        return "I can help you with:\n• Booking appointments\n• Adding vehicles\n• Checking service status\n• Understanding discounts\n• Payment information\n• Service types\n\What would you like to know?";
    }

    // 4. Score each category based on keyword matching
    let scores = new Array(knowledgeBase.length).fill(0);
    const typoThreshold = 2; // How many "typos" to allow (e.g., 2 edits)

    words.forEach(word => {
      if (word.length < 3) return; // Skip small words

      knowledgeBase.forEach((entry, index) => {
        entry.keywords.forEach(keyword => {
          const distance = levenshteinDistance(word, keyword);
          
          if (distance === 0) {
            scores[index] += 3; // Perfect match
          } else if (distance <= typoThreshold) {
            scores[index] += 1; // Close typo match
          }
        });
      });
    });

    const bestScore = Math.max(...scores);
    const bestMatchIndex = scores.indexOf(bestScore);

    // 5. Return best match or a fallback message
    if (bestScore > 0) {
      return knowledgeBase[bestMatchIndex].answer;
    }

    // 6. Default fallback message
    return "I'm sorry, I didn't quite understand that. 🤔 I can help with topics like 'booking', 'vehicles', 'service status', and 'discounts'. Please try rephrasing your question or click one of the quick actions below.";
  };

  const handleQuestionClick = (faq) => {
    setMessages([
      ...messages,
      { type: "user", text: faq.question },
      { type: "bot", text: faq.answer },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages([...messages, { type: "user", text: userMessage }]);
    setInputValue("");

    // Process the question
    setTimeout(() => {
      const response = findBestMatch(userMessage);
      setMessages((prev) => [...prev, { type: "bot", text: response }]);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to bottom of chat body when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Quick action buttons based on common intents
  const quickActions = [
    { text: "Book appointment", query: "How do I book an appointment?" },
    { text: "Add vehicle", query: "How can I add a new vehicle?" },
    { text: "Discount info", query: "What are off-peak discounts?" },
    { text: "Cancel booking", query: "How do I cancel an appointment?" },
    { text: "Leave feedback", query: "How do I leave feedback?" },
  ];

  return (
    <>
      {/* Assistant Icon */}
      {!isOpen && (
        <div 
          className="assistant-icon" 
          onClick={() => setIsOpen(true)}
          title="Chat with Support"
        >
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Virtual Assistant </h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div
            style={{
              padding: "0.75rem",
              background: "#f9f9f9",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Quick Actions:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="qa-button"
                  style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                  onClick={() => {
                    const faq = knowledgeBase.find(item => item.question === action.query);
                    const answer = faq ? faq.answer : "I can help with that.";
                    setMessages([
                      ...messages,
                      { type: "user", text: action.query },
                      { type: "bot", text: answer },
                    ]);
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
              placeholder="Type your question..."
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