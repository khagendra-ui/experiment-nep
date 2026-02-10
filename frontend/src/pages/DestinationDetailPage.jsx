// Displays full destination details when user clicks "Learn More"
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Ticket, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { axiosInstance } from '@/App';

const DESTINATION_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop';

const normalizeCategory = (category) => {
  const value = String(category || '').toLowerCase();
  if (value.includes('park')) return 'national-park';
  if (value.includes('trek')) return 'trekking';
  if (value.includes('adventure')) return 'adventure';
  if (value.includes('culture') || value.includes('temple') || value.includes('heritage')) return 'cultural';
  return value || 'cultural';
};

const DestinationDetailPage = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      try {
        const response = await axiosInstance.get('/tourist-spots');
        const spots = Array.isArray(response.data) ? response.data : [];
        if (isMounted) {
          setDestinations(spots);
        }
      } catch (error) {
        if (isMounted) {
          setDestinations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDestinations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Find destination by ID from URL param
  const destination = useMemo(
    () => destinations.find((item) => String(item.id) === String(id)),
    [destinations, id]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error if destination not found
  if (!destination) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/destinations" className="inline-flex items-center text-nepal-blue-600 hover:text-nepal-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Back to Destinations' : 'गन्तव्यमा फर्कनुहोस्'}
          </Link>
          <Card className="border border-slate-200">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {language === 'en' ? 'Destination not found' : 'गन्तव्य फेला परेन'}
              </h1>
              <p className="text-slate-600">
                {language === 'en'
                  ? 'The destination you are looking for does not exist.'
                  : 'तपाईंले खोजिरहनुभएको गन्तव्य उपलब्ध छैन।'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render destination detail view
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/destinations" className="inline-flex items-center text-nepal-blue-600 hover:text-nepal-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Back to Destinations' : 'गन्तव्यमा फर्कनुहोस्'}
        </Link>

        <Card className="overflow-hidden border border-slate-200">
          <div className="relative h-72 md:h-96 overflow-hidden">
            <img
              src={destination.image_url || DESTINATION_IMAGE_FALLBACK}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-nepal-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Star className="h-4 w-4" />
              {normalizeCategory(destination.category) === 'national-park' && (language === 'en' ? 'Park' : 'पार्क')}
              {normalizeCategory(destination.category) === 'trekking' && (language === 'en' ? 'Trek' : 'ट्रेक')}
              {normalizeCategory(destination.category) === 'adventure' && (language === 'en' ? 'Adventure' : 'साहस')}
              {normalizeCategory(destination.category) === 'cultural' && (language === 'en' ? 'Culture' : 'संस्कृति')}
            </div>
            {destination.permit && (
              <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                {language === 'en' ? 'Permit Required' : 'अनुमति आवश्यक'}
              </div>
            )}
          </div>

          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {destination.name}
                </h1>
                {destination.name_ne && (
                  <p className="text-lg text-slate-600">{destination.name_ne}</p>
                )}
              </div>
              {destination.cost && (
                <div className="bg-slate-100 rounded-lg px-4 py-2 text-slate-800 font-semibold">
                  {language === 'en' ? 'Cost' : 'खर्च'}: {destination.cost}
                </div>
              )}
            </div>

            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              {destination.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-nepal-blue-500" />
                <span>{destination.altitude || destination.region || destination.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-nepal-gold-500" />
                <span>{destination.duration || destination.difficulty || '-'}</span>
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{language === 'en' ? 'Region' : 'क्षेत्र'}:</span>{' '}
                {destination.region || destination.location}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{language === 'en' ? 'Difficulty' : 'कठिनाइ'}:</span>{' '}
                {destination.difficulty || '-'}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">
                {language === 'en' ? 'Highlights' : 'मुख्य आकर्षण'}
              </p>
              <p className="text-slate-700">{destination.attractions || destination.description}</p>
            </div>

            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">
                {language === 'en' ? 'Best Time to Visit' : 'भ्रमणको उत्तम समय'}
              </p>
              <p className="text-slate-700">{destination.best_time_to_visit || 'Year-round'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {destination.permit && (
                <Link to="/permits" className="w-full sm:w-auto">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Ticket className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Apply for Permit' : 'अनुमतिको लागि आवेदन गर्नुहोस्'}
                  </Button>
                </Link>
              )}
              <Link to="/map" className="w-full sm:w-auto">
                <Button className="w-full bg-nepal-blue-500 hover:bg-nepal-blue-600">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'View on Map' : 'नक्सामा हेर्नुहोस्'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DestinationDetailPage;
