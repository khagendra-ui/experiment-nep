import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/App';

const SOSButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergency_type: 'general',
    message: ''
  });
  const [nearestContacts, setNearestContacts] = useState([]);

  // Get user location when dialog opens
  useEffect(() => {
    if (showDialog && !location) {
      getLocation();
    }
  }, [showDialog]);

  const getLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Please enable location access for emergency services');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('Unable to get your location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!location) {
      toast.error('Please enable location access for emergency services');
      getLocation();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/sos`, {
        latitude: location.latitude,
        longitude: location.longitude,
        user_name: formData.name || 'Anonymous',
        user_email: formData.email || null,
        user_phone: formData.phone || null,
        emergency_type: formData.emergency_type,
        message: formData.message || null
      });

      setNearestContacts(response.data.nearest_contacts || []);
      setSuccess(true);
      toast.success('Emergency alert sent! Help is on the way.');
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Failed to send alert. Please call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setShowDialog(false);
    setSuccess(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      emergency_type: 'general',
      message: ''
    });
  };

  return (
    <>
      {/* SOS Floating Button */}
      <button
        onClick={() => setShowDialog(true)}
        data-testid="sos-button"
        aria-label="Emergency SOS"
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-nepal-red-500 text-white shadow-lg flex items-center justify-center font-accent font-bold text-lg sos-button hover:bg-nepal-red-600 focus:outline-none focus:ring-4 focus:ring-nepal-red-500/50 transition-colors duration-200"
      >
        SOS
      </button>

      {/* SOS Dialog */}
      <Dialog open={showDialog} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-md border-nepal-red-500 border-2" data-testid="sos-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-nepal-red-500 text-2xl font-heading">
              <AlertTriangle className="h-6 w-6" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Send your exact GPS location to rescue teams
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Alert Sent Successfully!</h3>
              <p className="text-slate-600">
                Stay calm and stay where you are if it's safe. Help is on the way.
              </p>
              
              {nearestContacts.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">
                    Emergency Contacts
                  </h4>
                  <div className="space-y-2">
                    {nearestContacts.slice(0, 3).map((contact, idx) => (
                      <a
                        key={idx}
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{contact.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{contact.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-nepal-blue-500">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{contact.phone}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={resetDialog} className="mt-4 w-full rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Location Status */}
              <div className={`p-4 rounded-xl ${location ? 'bg-emerald-50 border border-emerald-200' : locationError ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${location ? 'bg-emerald-100 text-emerald-600' : locationError ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    {location ? (
                      <>
                        <p className="font-medium text-emerald-700">Location Acquired</p>
                        <p className="text-xs text-emerald-600">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                      </>
                    ) : locationError ? (
                      <>
                        <p className="font-medium text-red-700">Location Error</p>
                        <p className="text-xs text-red-600">{locationError}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-700">Getting Location...</p>
                        <p className="text-xs text-slate-500">Please allow location access</p>
                      </>
                    )}
                  </div>
                  {!location && (
                    <Button size="sm" variant="outline" onClick={getLocation} className="text-xs">
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              {/* Emergency Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Emergency Type</Label>
                <Select 
                  value={formData.emergency_type} 
                  onValueChange={(value) => setFormData({ ...formData, emergency_type: value })}
                >
                  <SelectTrigger className="h-12 rounded-lg" data-testid="emergency-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Emergency</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="lost">Lost / Stranded</SelectItem>
                    <SelectItem value="altitude">Altitude Sickness</SelectItem>
                    <SelectItem value="weather">Weather Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Your Name</Label>
                  <Input
                    placeholder="Optional"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-lg"
                    data-testid="sos-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 rounded-lg"
                    data-testid="sos-phone-input"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Additional Details</Label>
                <Textarea
                  placeholder="Describe your situation (optional)"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-lg resize-none"
                  rows={3}
                  data-testid="sos-message-input"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !location}
                data-testid="send-sos-button"
                className="w-full h-14 rounded-full bg-nepal-red-500 hover:bg-nepal-red-600 text-white font-semibold text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Alert...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    Send Emergency Alert
                  </>
                )}
              </Button>

              {/* Direct Call Option */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-center text-slate-500 mb-3">Or call directly:</p>
                <div className="flex gap-2">
                  <a href="tel:100" className="flex-1">
                    <Button variant="outline" className="w-full h-11 rounded-lg text-sm">
                      Police: 100
                    </Button>
                  </a>
                  <a href="tel:102" className="flex-1">
                    <Button variant="outline" className="w-full h-11 rounded-lg text-sm">
                      Rescue: 102
                    </Button>
                  </a>
                  <a href="tel:1144" className="flex-1">
                    <Button variant="outline" className="w-full h-11 rounded-lg text-sm">
                      Tourist: 1144
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
