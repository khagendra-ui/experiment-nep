import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Hotel, MapPin, DollarSign, Users, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ManageHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/hotel-owner/hotels');
      setHotels(response.data);
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      await axiosInstance.post(
        `/hotel-owner/hotels/${selectedHotel.id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast.success('Photos uploaded successfully!');
      setSelectedHotel(null);
      fetchHotels();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Hotels</h1>
            <p className="text-gray-600 mt-2">Manage your registered properties</p>
          </div>
          <Link to="/hotel-owner/add-hotel">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12">
              <Plus className="h-5 w-5 mr-2" />
              Add New Hotel
            </Button>
          </Link>
        </div>

        {/* Hotels List */}
        {hotels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-4">No hotels registered yet</p>
              <Link to="/hotel-owner/add-hotel">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Register Your First Hotel
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="hover:shadow-xl transition">
                <CardHeader>
                  {hotel.image_url ? (
                    <div className="relative">
                      <img 
                        src={hotel.image_url} 
                        alt={hotel.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      {hotel.images && hotel.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                          {hotel.images.length} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <CardTitle className="text-xl">{hotel.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        hotel.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                        hotel.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {hotel.approval_status || 'approved'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="text-sm">${hotel.price_per_night}/night</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{hotel.available_rooms} rooms</span>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xs text-gray-500">
                        Rating: {hotel.rating.toFixed(1)} ⭐
                      </span>
                    </div>
                    <Button
                      onClick={() => setSelectedHotel(hotel)}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Photo Upload Modal */}
      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Hotel Photos</DialogTitle>
            <p className="text-gray-600">for {selectedHotel?.name}</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Photos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to select photos</p>
                  <p className="text-sm text-gray-500">You can select multiple photos</p>
                </label>
              </div>
            </div>
            {uploading && (
              <div className="text-center text-blue-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Uploading photos...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageHotelsPage;
