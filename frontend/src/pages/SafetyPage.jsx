import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const IMPORTANT_REMINDERS = [
  'Always carry a copy of your passport and important documents',
  'Share your itinerary with family or friends',
  'Get travel insurance that covers trekking and medical emergencies',
  'Stay updated with weather forecasts and local news',
  'Learn basic Nepali phrases for better communication',
];

const SafetyPage = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [safetyTips, setSafetyTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, tipsRes] = await Promise.all([
        axiosInstance.get('/emergency-contacts'),
        axiosInstance.get('/safety-tips')
      ]);
      setEmergencyContacts(contactsRes.data);
      setSafetyTips(tipsRes.data);
    } catch (error) {
      toast.error('Failed to load safety information');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'police':
        return '🚔';
      case 'ambulance':
        return '🚑';
      case 'rescue':
        return '🚁';
      case 'embassy':
        return '🏛️';
      default:
        return '📞';
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const groupedTips = safetyTips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {});

  // Deduplicate emergency contacts by ID
  const uniqueEmergencyContacts = Array.from(
    new Map(emergencyContacts.map((contact) => [contact.id, contact])).values()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="safety-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="safety-page-title">
            Safety Information
          </h1>
          <p className="text-lg text-gray-600">
            Essential contacts and tips to keep you safe during your Nepal adventure
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="emergency-contacts-grid">
            {uniqueEmergencyContacts.map((contact) => (
              <Card
                key={contact.id}
                data-testid={`emergency-card-${contact.id}`}
                className="bg-white hover:shadow-lg transition card-hover border-2"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl mb-2">{getCategoryIcon(contact.category)}</div>
                    {contact.available_24_7 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        24/7
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center space-x-2 text-xl font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <Phone className="h-5 w-5" />
                      <span>{contact.phone}</span>
                    </a>
                    <p className="text-sm text-gray-600">{contact.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Info className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Safety Tips</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4" data-testid="safety-tips-accordion">
            {Object.entries(groupedTips).map(([category, tips], idx) => (
              <AccordionItem
                key={idx}
                value={`category-${idx}`}
                className="bg-white rounded-lg border shadow-sm"
                data-testid={`safety-category-${category}`}
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-lg font-semibold capitalize">{category} Safety</span>
                    <span className="text-sm text-gray-500">({tips.length} tips)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-3">
                    {tips.map((tip) => (
                      <div
                        key={tip.id}
                        data-testid={`safety-tip-${tip.id}`}
                        className={`p-4 rounded-lg ${getImportanceColor(tip.importance)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                          <span className="text-xs px-2 py-1 bg-white rounded-full capitalize">
                            {tip.importance}
                          </span>
                        </div>
                        <p className="text-gray-700">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Info */}
        <Card className="mt-12 bg-gradient-to-br from-emerald-50 to-blue-50 border-none">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Important Reminders</h3>
            <ul className="space-y-3 text-gray-700">
              {IMPORTANT_REMINDERS.map((reminder, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{reminder}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyPage;