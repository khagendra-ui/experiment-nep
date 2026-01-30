import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Ticket, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import { destinationsData } from '@/pages/TouristDestinationsPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

const DestinationDetailPage = () => {
  const { id } = useParams();
  const { language } = useLanguage();

  const destination = useMemo(
    () => destinationsData.find((item) => String(item.id) === String(id)),
    [id]
  );

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
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-nepal-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Star className="h-4 w-4" />
              {destination.category === 'national-park' && (language === 'en' ? 'Park' : 'पार्क')}
              {destination.category === 'trekking' && (language === 'en' ? 'Trek' : 'ट्रेक')}
              {destination.category === 'adventure' && (language === 'en' ? 'Adventure' : 'साहस')}
              {destination.category === 'cultural' && (language === 'en' ? 'Culture' : 'संस्कृति')}
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
                <p className="text-lg text-slate-600">{destination.nameNe}</p>
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
                <span>{destination.altitude}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-nepal-gold-500" />
                <span>{destination.duration || destination.difficulty}</span>
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{language === 'en' ? 'Region' : 'क्षेत्र'}:</span>{' '}
                {destination.region}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{language === 'en' ? 'Difficulty' : 'कठिनाइ'}:</span>{' '}
                {destination.difficulty}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">
                {language === 'en' ? 'Highlights' : 'मुख्य आकर्षण'}
              </p>
              <p className="text-slate-700">{destination.attractions}</p>
            </div>

            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">
                {language === 'en' ? 'Best Time to Visit' : 'भ्रमणको उत्तम समय'}
              </p>
              <p className="text-slate-700">{destination.bestTime}</p>
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
