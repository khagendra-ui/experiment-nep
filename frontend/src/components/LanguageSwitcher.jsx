import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
      data-testid="language-switcher"
    >
      <Globe className="h-4 w-4" />
      <span className="font-semibold">{language === 'en' ? 'नेपाली' : 'English'}</span>
    </Button>
  );
};

export default LanguageSwitcher;