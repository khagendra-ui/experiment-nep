// Top navigation bar with responsive design and user menu
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Mountain, Hotel, FileText, Map, Shield, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = ({ user, onLogout, onShowAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { path: '/hotels', label: t('hotels'), icon: <Hotel className="h-4 w-4" /> },
    { path: '/permits', label: t('permits'), icon: <FileText className="h-4 w-4" /> },
    { path: '/map', label: t('map'), icon: <Map className="h-4 w-4" /> },
    { path: '/safety', label: t('safety'), icon: <Shield className="h-4 w-4" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-full mx-auto px-8 lg:px-12">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-5 group" data-testid="navbar-logo">
            <img 
              src="/logo.png" 
              alt="NepSafe Logo" 
              className="h-20 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-nepal-blue-500 leading-tight">NepSafe</span>
              <span className="text-lg text-slate-600 font-medium">Your Travel Companion</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`px-7 py-3.5 rounded-xl text-xl font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-nepal-blue-50 text-nepal-blue-600 shadow-sm'
                    : 'text-slate-700 hover:text-nepal-blue-600 hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-5">
            <LanguageSwitcher />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 h-14 px-4 rounded-full hover:bg-muted"
                    data-testid="user-menu-trigger"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-slate-300">
                      <AvatarImage src={user.profile_picture} alt={user.name} />
                      <AvatarFallback className="bg-nepal-blue-100 text-nepal-blue-600 text-lg font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-lg font-semibold text-slate-700 max-w-[140px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-3">
                  <div className="px-4 py-3 mb-1">
                    <p className="text-base font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-nepal-blue-50 text-nepal-blue-600' :
                      user.role === 'hotel_owner' ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-slate-600'
                    }`}>
                      {user.role === 'hotel_owner' ? 'Hotel Owner' : user.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-3 cursor-pointer text-base py-2" data-testid="nav-profile">
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-3 cursor-pointer text-base py-2" data-testid="nav-admin">
                        <LayoutDashboard className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'hotel_owner' && (
                    <DropdownMenuItem asChild>
                      <Link to="/hotel-owner" className="flex items-center gap-3 cursor-pointer text-base py-2" data-testid="nav-hotel-owner">
                        <Hotel className="h-5 w-5" />
                        Hotel Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout} 
                    className="flex items-center gap-3 text-red-600 cursor-pointer text-base py-2"
                    data-testid="nav-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onShowAuth}
                data-testid="nav-login-btn"
                className="h-10 px-5 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-nepal-blue-50 text-nepal-blue-600'
                      : 'text-slate-600 hover:bg-muted'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
