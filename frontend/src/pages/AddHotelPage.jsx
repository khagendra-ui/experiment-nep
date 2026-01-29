import { useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, DollarSign, Home, Phone } from 'lucide-react';

const AddHotelPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    latitude: '',
    longitude: '',
    price_per_night: '',
    description: '',
    amenities: '',
    contact: '',
    available_rooms: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      
      const hotelData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        price_per_night: parseFloat(formData.price_per_night),
        available_rooms: parseInt(formData.available_rooms),
        amenities: amenitiesArray
      };

      await axiosInstance.post('/hotel-owner/hotels', hotelData);
      toast.success('Hotel registered successfully!');
      navigate('/hotel-owner/hotels');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center space-x-3">
              <Hotel className="h-8 w-8 text-blue-600" />
              <span>Register New Hotel</span>
            </CardTitle>
            <p className="text-gray-600 mt-2">Fill in the details to add your property</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hotel Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">Hotel Name *</Label>
                <div className="relative">
                  <Hotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Himalayan Paradise Hotel"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-11 h-12 text-base"
                    required
                  />
                </div>
              </div>

              {/* Location & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Thamel, Kathmandu"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-11 h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-semibold">City *</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Kathmandu"
                      value={formData.city}
                      onChange={handleChange}
                      className="pl-11 h-12 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-base font-semibold">Latitude *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="27.7156"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-base font-semibold">Longitude *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="85.3131"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              {/* Price & Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_night" className="text-base font-semibold">Price Per Night (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="price_per_night"
                      name="price_per_night"
                      type="number"
                      step="0.01"
                      placeholder="80.00"
                      value={formData.price_per_night}
                      onChange={handleChange}
                      className="pl-11 h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_rooms" className="text-base font-semibold">Available Rooms *</Label>
                  <Input
                    id="available_rooms"
                    name="available_rooms"
                    type="number"
                    placeholder="25"
                    value={formData.available_rooms}
                    onChange={handleChange}
                    className="h-12 text-base"
                    required
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-base font-semibold">Contact Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="contact"
                    name="contact"
                    type="text"
                    placeholder="+977-1-4123456"
                    value={formData.contact}
                    onChange={handleChange}
                    className="pl-11 h-12 text-base"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your hotel, its features, and what makes it special..."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-32 text-base"
                  required
                />
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label htmlFor="amenities" className="text-base font-semibold">Amenities *</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  type="text"
                  placeholder="WiFi, Restaurant, 24/7 Reception, Tour Desk"
                  value={formData.amenities}
                  onChange={handleChange}
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-gray-500">Separate amenities with commas</p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12 text-base"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register Hotel'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/hotel-owner')}
                  className="h-12 px-8"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddHotelPage;
