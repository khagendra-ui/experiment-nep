import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'नमस्ते! Hello! I am NepSafe Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const quickReplies = [
    'How to get trekking permit?',
    'Emergency contacts',
    'Hotel booking help',
    'Safety tips',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { type: 'user', text: input }]);
    
    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(input);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);

    setInput('');
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('permit') || input.includes('tims')) {
      return 'To get a trekking permit:\n1. Go to Permits page\n2. Fill the application form\n3. Upload passport copy\n4. Submit for approval\n5. Government admin will review within 24-48 hours';
    } else if (input.includes('emergency') || input.includes('help') || input.includes('sos')) {
      return 'Emergency Contacts:\n🚔 Nepal Police: 100\n🚑 Ambulance: 102\n🚒 Fire: 101\n👮 Tourist Police: +977-1-4247041\n\nYou can also click the red SOS button at bottom right!';
    } else if (input.includes('hotel') || input.includes('booking')) {
      return 'Hotel Booking:\n1. Visit Hotels page\n2. Search by city\n3. View hotel details\n4. Select dates and guests\n5. Confirm booking\n\nYou can cancel confirmed bookings from your profile.';
    } else if (input.includes('safety') || input.includes('tips')) {
      return 'Safety Tips:\n✅ Get travel insurance\n✅ Ascend gradually for altitude\n✅ Stay hydrated\n✅ Check weather daily\n✅ Inform family about itinerary\n\nVisit Safety page for more tips!';
    } else if (input.includes('map') || input.includes('location')) {
      return 'Use our interactive map to:\n📍 Find tourist spots\n🏨 Locate hotels\n🚨 See emergency services\n\nGo to Map page to explore!';
    } else {
      return 'I can help you with:\n- Trekking permits\n- Hotel bookings\n- Emergency contacts\n- Safety information\n- Map navigation\n\nWhat would you like to know?';
    }
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    handleSend();
  };

  return (
    <>
      {/* Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110"
          data-testid="chatbot-button"
          aria-label="Open Chat"
        >
          <MessageCircle className="h-8 w-8" />
          <span className="absolute -top-1 -right-1 bg-green-500 h-4 w-4 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <Card className="fixed bottom-6 left-6 z-50 w-96 h-[600px] shadow-2xl border-2" data-testid="chatbot-window">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <CardTitle className="text-lg">NepSafe Assistant</CardTitle>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-blue-100 mt-1">Online 24/7</p>
          </CardHeader>
          
          <CardContent className="p-4 flex flex-col h-[calc(100%-140px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 whitespace-pre-line ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Quick Questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition border border-blue-200"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
                data-testid="chatbot-input"
              />
              <Button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="chatbot-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;