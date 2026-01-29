import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navbar
    home: 'Home',
    hotels: 'Hotels',
    permits: 'Permits',
    map: 'Map',
    safety: 'Safety',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    
    // Home Page
    heroTitle: 'Welcome to NepSafe',
    heroSubtitle: 'Your Complete Travel Companion for Nepal',
    heroDescription: 'Discover hotels, obtain permits, navigate with confidence, and stay safe throughout your adventure in the Himalayas',
    getStarted: 'Get Started Free',
    exploreHotels: 'Explore Hotels',
    safetyInfo: 'Safety Information',
    
    // Features
    premiumHotels: 'Premium Hotels',
    easyPermits: 'Easy Permits',
    smartNavigation: 'Smart Navigation',
    safetyFirst: 'Safety First',
    
    // Common
    search: 'Search',
    cancel: 'Cancel',
    submit: 'Submit',
    confirm: 'Confirm',
    save: 'Save',
    booking: 'Booking',
    permit: 'Permit',
    emergency: 'Emergency',
    contact: 'Contact',
  },
  ne: {
    // Navbar
    home: 'गृहपृष्ठ',
    hotels: 'होटेल',
    permits: 'अनुमति',
    map: 'नक्सा',
    safety: 'सुरक्षा',
    profile: 'प्रोफाइल',
    admin: 'प्रशासक',
    login: 'लगइन',
    signup: 'दर्ता गर्नुहोस्',
    logout: 'लगआउट',
    
    // Home Page
    heroTitle: 'NepSafe मा स्वागत छ',
    heroSubtitle: 'नेपालको लागि तपाईंको पूर्ण यात्रा साथी',
    heroDescription: 'होटेलहरू पत्ता लगाउनुहोस्, अनुमतिहरू प्राप्त गर्नुहोस्, आत्मविश्वासका साथ नेभिगेट गर्नुहोस्, र हिमालयमा आफ्नो साहसिक कार्यमा सुरक्षित रहनुहोस्',
    getStarted: 'निःशुल्क सुरु गर्नुहोस्',
    exploreHotels: 'होटेल अन्वेषण गर्नुहोस्',
    safetyInfo: 'सुरक्षा जानकारी',
    
    // Features
    premiumHotels: 'प्रिमियम होटेलहरू',
    easyPermits: 'सजिलो अनुमति',
    smartNavigation: 'स्मार्ट नेभिगेशन',
    safetyFirst: 'सुरक्षा पहिलो',
    
    // Common
    search: 'खोज्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    submit: 'पेश गर्नुहोस्',
    confirm: 'पुष्टि गर्नुहोस्',
    save: 'बचत गर्नुहोस्',
    booking: 'बुकिंग',
    permit: 'अनुमति',
    emergency: 'आपतकालीन',
    contact: 'सम्पर्क',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('nepsafe_language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ne' : 'en';
    setLanguage(newLang);
    localStorage.setItem('nepsafe_language', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};