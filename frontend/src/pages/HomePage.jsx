import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Map, FileText, MessageCircle, Hotel, Phone, Mountain, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

const HomePage = ({ user, onShowAuth }) => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Map className="h-7 w-7" strokeWidth={1.5} />,
      title: t('smartNavigation'),
      description: t('smartNavigationDesc'),
      color: 'bg-nepal-blue-500',
      link: '/map'
    },
    {
      icon: <FileText className="h-7 w-7" strokeWidth={1.5} />,
      title: t('easyPermits'),
      description: t('easyPermitsDesc'),
      color: 'bg-emerald-600',
      link: '/permits'
    },
    {
      icon: <Hotel className="h-7 w-7" strokeWidth={1.5} />,
      title: t('premiumHotels'),
      description: t('premiumHotelsDesc'),
      color: 'bg-nepal-gold-500',
      link: '/hotels'
    },
    {
      icon: <Shield className="h-7 w-7" strokeWidth={1.5} />,
      title: t('safetyFirst'),
      description: t('safetyFirstDesc'),
      color: 'bg-nepal-red-500',
      link: '/safety'
    }
  ];

  const stats = [
    { label: 'Tourist Destinations', value: '50+', icon: <Mountain className="h-5 w-5" /> },
    { label: 'Verified Hotels', value: '100+', icon: <Hotel className="h-5 w-5" /> },
    { label: 'Permit Types', value: '10+', icon: <FileText className="h-5 w-5" /> },
    { label: 'Emergency Support', value: '24/7', icon: <Phone className="h-5 w-5" /> }
  ];

  const handleChatbotClick = () => {
    const chatbotButton = document.querySelector('[aria-label="Open AI Chat Assistant"]');
    if (chatbotButton) chatbotButton.click();
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1573089178199-2b68b9cbaff0?w=1920&q=80" 
            alt="Himalayan Mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A4D]/90 via-[#003893]/70 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white/90 rounded-full text-sm font-accent font-medium mb-8 border border-white/20">
              <Sun className="h-4 w-4 text-nepal-gold-500" />
              Your Trusted Nepal Travel Companion
            </span>
            
            <h1 className="font-heading text-5xl md:text-7xl font-light text-white mb-6 leading-none tracking-tight">
              {t('heroTitle')}<br />
              <span className="text-nepal-gold-500">{t('heroSubtitle')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-xl mb-10 leading-relaxed font-body">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/hotels">
                  <Button 
                    data-testid="explore-hotels-btn"
                    className="h-14 px-8 rounded-full bg-white text-nepal-blue-500 hover:bg-white/90 font-accent font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200"
                  >
                    {t('exploreHotels')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  data-testid="get-started-btn"
                  onClick={onShowAuth}
                  className="h-14 px-8 rounded-full bg-white text-nepal-blue-500 hover:bg-white/90 font-accent font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200"
                >
                  {t('getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Link to="/map">
                <Button 
                  variant="outline" 
                  data-testid="explore-map-btn"
                  className="h-14 px-8 rounded-full bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-accent font-semibold text-base backdrop-blur-sm transition-colors duration-200"
                >
                  <Map className="mr-2 h-5 w-5" />
                  {t('map')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-nepal-blue-50 text-nepal-blue-500 mb-4">
                  {stat.icon}
                </div>
                <p className="text-4xl font-heading font-semibold text-nepal-blue-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 font-accent font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations CTA Section */}
      <section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-emerald-50 to-blue-50 border-y border-emerald-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            Explore All Destinations
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Discover Nepal's most stunning destinations, national parks, trekking routes, and adventure areas with detailed information and permit requirements.
          </p>
          <Link to="/destinations">
            <Button className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-accent font-semibold text-base shadow-lg hover:scale-105 transition-transform duration-200">
              <Mountain className="mr-2 h-5 w-5" />
              Browse All Destinations
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest font-accent font-bold text-nepal-blue-500 mb-4 block">
              Everything You Need
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-normal text-slate-900 mb-4">
              Your Complete Journey Toolkit
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-body">
              Professional tools and services designed for modern travelers exploring Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                to={feature.link}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full bg-white border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-nepal-blue-500 to-nepal-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-nepal-gold-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white mb-6">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-normal text-white mb-4">
            Need Travel Advice?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our AI-powered assistant knows everything about Nepal — permits, routes, weather, culture, and safety tips. Available 24/7.
          </p>
          <Button 
            onClick={handleChatbotClick}
            data-testid="chat-assistant-btn"
            className="h-14 px-8 rounded-full bg-white text-nepal-blue-500 hover:bg-white/90 font-accent font-semibold text-base shadow-lg hover:scale-105 transition-transform duration-200"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {t('chatWithAI') || 'Chat with AI Assistant'}
          </Button>
        </div>
      </section>

      {/* Trekking Image Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-xs uppercase tracking-widest font-accent font-bold text-nepal-red-500 mb-4 block">
                Adventure Awaits
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-normal text-slate-900 mb-6">
                From Kathmandu to Everest Base Camp
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Whether you're planning a cultural tour of the Kathmandu Valley or trekking to the roof of the world, NepSafe has you covered with real-time navigation, verified accommodations, and emergency support every step of the way.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/permits">
                  <Button 
                    data-testid="apply-permits-btn"
                    className="h-12 px-6 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 text-white font-accent font-semibold transition-colors duration-200"
                  >
                    {t('applyPermit')}
                  </Button>
                </Link>
                <Link to="/safety">
                  <Button 
                    variant="outline"
                    data-testid="safety-tips-btn"
                    className="h-12 px-6 rounded-full border-2 border-slate-200 hover:border-nepal-blue-500 text-slate-700 hover:text-nepal-blue-500 font-accent font-semibold transition-colors duration-200"
                  >
                    {t('safetyTips')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1545254245-72bacb090900?w=800&q=80" 
                  alt="Trekker in Nepal"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.png" alt="NepSafe" className="h-12 w-auto mb-4" />
              <p className="text-slate-400 text-sm leading-relaxed">
                Your trusted companion for safe and memorable travel experiences in Nepal.
              </p>
            </div>
            <div>
              <h4 className="font-accent font-semibold text-sm uppercase tracking-wider mb-4">{t('explore') || 'Explore'}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/hotels" className="hover:text-white transition-colors">{t('hotels')}</Link></li>
                <li><Link to="/permits" className="hover:text-white transition-colors">{t('permits')}</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">{t('map')}</Link></li>
                <li><Link to="/safety" className="hover:text-white transition-colors">{t('safety')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-accent font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><span className="hover:text-white transition-colors cursor-pointer" onClick={handleChatbotClick}>AI Assistant</span></li>
                <li><Link to="/safety" className="hover:text-white transition-colors">Emergency Contacts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-accent font-semibold text-sm uppercase tracking-wider mb-4">{t('emergency')}</h4>
              <p className="text-slate-400 text-sm mb-2">Nepal Police: 100</p>
              <p className="text-slate-400 text-sm mb-2">Tourist Police: 1144</p>
              <p className="text-slate-400 text-sm">Rescue: 102</p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>© 2024 NepSafe. Making travel to Nepal safe and memorable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
