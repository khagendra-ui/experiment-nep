import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Star, Phone, Calendar, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

const HotelsPage = ({ user }) => {
  const { t } = useLanguage();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingData, setBookingData] = useState({
    check_in: '',
    check_out: '',
    guests: 1
  });
  const [booking, setBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (city = '') => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/hotels${city ? `?city=${city}` : ''}`);
      setHotels(response.data);
    } catch (error) {
      toast.error('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels(searchCity);
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('pleaseLogin'));
      return;
    }
    setShowPaymentModal(true);
  };

  const getNights = () => {
    if (!bookingData.check_in || !bookingData.check_out) return 1;
    const start = new Date(bookingData.check_in);
    const end = new Date(bookingData.check_out);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const currencyRates = {
    USD: 1,
    NPR: 133,
    EUR: 0.92,
    GBP: 0.79
  };

  const currencySymbols = {
    USD: '$',
    NPR: '₨',
    EUR: '€',
    GBP: '£'
  };

  const getTotalAmount = () => {
    if (!selectedHotel) return 0;
    const nights = getNights();
    return selectedHotel.price_per_night * nights;
  };

  const getConvertedAmount = () => {
    const base = getTotalAmount();
    const rate = currencyRates[currency] || 1;
    return base * rate;
  };

  const confirmPaymentAndBook = async () => {
    setBooking(true);
    try {
      await axiosInstance.post('/bookings', {
        hotel_id: selectedHotel.id,
        ...bookingData
      });
      toast.success(t('paymentSuccess'));
      toast.success(t('bookingSuccess'));
      setSelectedHotel(null);
      setShowPaymentModal(false);
      setBookingData({ check_in: '', check_out: '', guests: 1 });
    } catch (error) {
      toast.error(error.response?.data?.detail || t('bookingFailed'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12" data-testid="hotels-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4" data-testid="hotels-page-title">
            {t('findPerfectStay')}
          </h1>
          <p className="text-xl text-gray-600">{t('searchHotels')}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-10" data-testid="hotel-search-form">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 focus:border-blue-500"
                  data-testid="hotel-search-input"
                />
              </div>
              <Button type="submit" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold" data-testid="hotel-search-button">
                {t('search')}
              </Button>
              {searchCity && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchCity('');
                    fetchHotels();
                  }}
                  className="h-14 px-6 border-2"
                  data-testid="hotel-clear-search-button"
                >
                  {t('cancel')}
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Hotels Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg" data-testid="no-hotels-message">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">{t('noHotelsFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="hotels-grid">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                data-testid={`hotel-card-${hotel.id}`}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden card-hover group"
              >
                <div className="h-56 relative overflow-hidden bg-gray-200">
                  {hotel.image_url ? (
                    <>
                      <img 
                        src={hotel.image_url} 
                        alt={hotel.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-blue-100 via-emerald-100 to-blue-100 flex items-center justify-center">
                      <MapPin className="h-20 w-20 text-blue-600 transform group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 rounded-full shadow-md">
                      <Star className="h-4 w-4 text-white fill-white" />
                      <span className="text-sm font-bold text-white">{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    {hotel.location}, {hotel.city}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{hotel.description}</p>
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">${hotel.price_per_night}</p>
                      <p className="text-sm text-gray-500 font-medium">{t('perNight')}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedHotel(hotel)}
                      data-testid={`book-hotel-button-${hotel.id}`}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 font-semibold shadow-lg"
                    >
                      {t('bookNow')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="sm:max-w-md" data-testid="booking-modal">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">{selectedHotel?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-6 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-6 rounded-xl border-2 border-blue-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">{t('perNight')}</p>
              <p className="text-4xl font-bold text-emerald-600">${selectedHotel?.price_per_night}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_in" className="text-base font-semibold">{t('checkIn')}</Label>
              <Input
                id="check_in"
                data-testid="booking-checkin-input"
                type="date"
                value={bookingData.check_in}
                onChange={(e) => setBookingData({ ...bookingData, check_in: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="h-12 text-base border-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out" className="text-base font-semibold">{t('checkOut')}</Label>
              <Input
                id="check_out"
                data-testid="booking-checkout-input"
                type="date"
                value={bookingData.check_out}
                onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                min={bookingData.check_in || new Date().toISOString().split('T')[0]}
                className="h-12 text-base border-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-base font-semibold">{t('guests')}</Label>
              <Input
                id="guests"
                data-testid="booking-guests-input"
                type="number"
                min="1"
                value={bookingData.guests}
                onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                className="h-12 text-base border-2"
                required
              />
            </div>
            <Button
              type="submit"
              data-testid="confirm-booking-button"
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-xl"
              disabled={booking}
            >
              {booking ? t('loading') : t('proceedToPayment')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Prototype Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-lg" data-testid="payment-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t('payment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="text-sm text-slate-600">
              {t('paymentPrototypeNote')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">{t('paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">{t('cardPayment')}</SelectItem>
                    <SelectItem value="esewa">{t('esewa')}</SelectItem>
                    <SelectItem value="khalti">{t('khalti')}</SelectItem>
                    <SelectItem value="paypal">{t('paypal')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">{t('currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="NPR">NPR</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-semibold">{t('cardPayment')}</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    className="h-12"
                    data-testid="card-number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">MM/YY</Label>
                  <Input
                    placeholder="12/28"
                    className="h-12"
                    data-testid="card-expiry-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">CVV</Label>
                  <Input
                    placeholder="123"
                    className="h-12"
                    data-testid="card-cvv-input"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-semibold">Name on Card</Label>
                  <Input
                    placeholder="John Doe"
                    className="h-12"
                    data-testid="card-name-input"
                  />
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{t('totalAmount')}</span>
                <span>{getNights()} {t('nights')}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {currencySymbols[currency]}{getConvertedAmount().toFixed(2)}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={confirmPaymentAndBook}
                disabled={booking}
                className="flex-1 h-12 bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
              >
                {booking ? t('loading') : t('confirmPayment')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  toast.info(t('paymentCancelled'));
                }}
                className="flex-1 h-12"
              >
                {t('cancelPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelsPage;