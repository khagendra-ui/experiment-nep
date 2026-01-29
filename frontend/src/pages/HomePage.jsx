import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Map, FileText, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

const HomePage = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Map className="h-8 w-8" />,
      title: t('exploreMap'),
      description: 'Navigate with confidence using our interactive map with real-time directions',
      color: 'from-blue-500 to-blue-600',
      link: '/map'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: t('getPermits'),
      description: 'Quick and easy permit applications for all trekking regions',
      color: 'from-purple-500 to-purple-600',
      link: '/permits'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('stayInformed'),
      description: 'Access safety tips, emergency contacts, and travel advisories',
      color: 'from-emerald-500 to-emerald-600',
      link: '/safety'
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'AI Travel Assistant',
      description: 'Get instant answers about Nepal tourism from our GPT-powered chatbot',
      color: 'from-indigo-500 to-indigo-600',
      action: 'chatbot'
    }
  ];

  const stats = [
    { label: 'Tourist Destinations', value: '50+' },
    { label: 'Verified Hotels', value: '100+' },
    { label: 'Permit Types', value: '10+' },
    { label: 'Emergency Services', value: '24/7' }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.action === 'chatbot') {
      // Trigger chatbot open
      const chatbotButton = document.querySelector('[aria-label="Open AI Chat Assistant"]');
      if (chatbotButton) chatbotButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              🇳🇵 Your Complete Travel Companion for Nepal
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NepSafe</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Discover hotels, obtain permits, navigate with confidence, and stay safe throughout your adventure in the Himalayas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/hotels">
              <Button className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                {t('getStartedFree')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/safety">
              <Button variant="outline" className="h-14 px-8 border-2 border-gray-300 hover:border-blue-500 font-semibold text-lg transition-all duration-200">
                {t('safetyInformation')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Nepal Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional tools and services designed for modern travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              feature.link ? (
                <Link key={index} to={feature.link}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-300">
                    <CardHeader>
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <div key={index} onClick={() => handleFeatureClick(feature)}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-300">
                    <CardHeader>
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of travelers who trust NepSafe for their Nepal journey
          </p>
          <Link to="/hotels">
            <Button className="h-16 px-10 bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-200">
              Explore Hotels & Book Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © 2024 NepSafe - Your trusted travel companion for Nepal. Made with ❤️ for travelers.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Emergency Hotline: 📞 100 (Police) | 102 (Ambulance) | +977-1-4247041 (Tourist Police)
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;