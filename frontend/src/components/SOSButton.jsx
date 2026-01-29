import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SOSButton = () => {
  const [open, setOpen] = useState(false);

  const emergencyContacts = [
    { name: 'Nepal Police', phone: '100', icon: '🚔' },
    { name: 'Ambulance', phone: '102', icon: '🚑' },
    { name: 'Fire Brigade', phone: '101', icon: '🚒' },
    { name: 'Tourist Police', phone: '+977-1-4247041', icon: '👮' },
  ];

  const callEmergency = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full p-5 shadow-2xl animate-pulse hover:animate-none transition-all duration-300 hover:scale-110"
        data-testid="sos-button"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">SOS</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-4 border-red-500" data-testid="sos-modal">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-red-600 text-center flex items-center justify-center space-x-2">
              <AlertTriangle className="h-8 w-8" />
              <span>EMERGENCY HELP</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-center text-gray-700 font-semibold">
                Choose an emergency service to call immediately
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {emergencyContacts.map((contact, idx) => (
                <Card key={idx} className="border-2 hover:border-red-500 transition cursor-pointer" onClick={() => callEmergency(contact.phone)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{contact.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-gray-600">Tap to call</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-red-600" />
                        <span className="text-xl font-bold text-red-600">{contact.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Your Location</p>
                  <p className="text-sm text-gray-700">Location sharing can help emergency services find you faster</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;