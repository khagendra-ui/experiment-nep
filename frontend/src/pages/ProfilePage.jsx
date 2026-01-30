import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Hotel, FileText, Calendar, MapPin, XCircle, Upload, Edit2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage = ({ user }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, permitsRes] = await Promise.all([
        axiosInstance.get('/bookings'),
        axiosInstance.get('/permits')
      ]);
      setBookings(bookingsRes.data);
      setPermits(permitsRes.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully!');
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const handleCancelPermit = async (permitId) => {
    if (!window.confirm('Are you sure you want to cancel this permit application?')) return;
    
    setCancelling(permitId);
    try {
      await axiosInstance.patch(`/permits/${permitId}/cancel`);
      toast.success('Permit application cancelled successfully!');
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel permit');
    } finally {
      setCancelling(null);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axiosInstance.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Profile picture updated successfully!');
      window.location.reload(); // Refresh to show new picture
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="profile-page">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Profile Header */}
        <Card className="mb-10 shadow-lg" data-testid="profile-header">
          <CardContent className="p-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.name}
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <User className="h-16 w-16 text-emerald-600" />
                    </div>
                  )}
                  <label 
                    htmlFor="profile-picture-upload" 
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition"
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900" data-testid="profile-name">{user.name}</h1>
                  <p className="text-lg text-gray-600 mt-1" data-testid="profile-email">{user.email}</p>
                  <p className="text-base text-gray-500 mt-2">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <span className="inline-block mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                    {user.role === 'hotel_owner' ? 'Hotel Owner' : user.role}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setShowEditProfile(true)}
                variant="outline"
                className="flex items-center space-x-2 h-12 px-6 text-base"
              >
                <Edit2 className="h-5 w-5" />
                <span>Edit Profile</span>
              </Button>
            </div>
            {uploading && (
              <div className="mt-6 text-blue-600 text-base">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Uploading photo...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Card data-testid="stat-card-bookings" className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Hotel className="h-6 w-6 text-emerald-600" />
                <span>{t('totalBookings')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-gray-900">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-card-permits" className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>{t('permitApplications')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-gray-900">{permits.length}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-card-approved" className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                <span>{t('approvedPermits')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-gray-900">
                {permits.filter(p => p.status === 'approved').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Bookings and Permits */}
        <Tabs defaultValue="bookings" data-testid="profile-tabs">
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger value="bookings" data-testid="bookings-tab">
              <Hotel className="h-4 w-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="permits" data-testid="permits-tab">
              <FileText className="h-4 w-4 mr-2" />
              My Permits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6" data-testid="bookings-content">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} data-testid={`booking-card-${booking.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {booking.hotel_name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <p className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Check-in: {new Date(booking.check_in).toLocaleDateString()}
                            </p>
                            <p className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Check-out: {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                            <p className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Guests: {booking.guests}
                            </p>
                            <p className="font-semibold text-emerald-600">
                              Total: ${booking.total_price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelling === booking.id}
                            className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                            data-testid={`cancel-booking-${booking.id}`}
                          >
                            {cancelling === booking.id ? 'Cancelling...' : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="permits" className="mt-6" data-testid="permits-content">
            {permits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No permit applications yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {permits.map((permit) => (
                  <Card key={permit.id} data-testid={`permit-card-${permit.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {permit.permit_type} - {permit.trek_area}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(permit.status)}`}>
                              {permit.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <p><strong>Name:</strong> {permit.full_name}</p>
                            <p><strong>Passport:</strong> {permit.passport_number}</p>
                            <p><strong>Nationality:</strong> {permit.nationality}</p>
                            <p className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {permit.start_date} to {permit.end_date}
                            </p>
                          </div>
                          {permit.admin_note && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-semibold text-blue-900">Admin Note:</p>
                              <p className="text-sm text-gray-700">{permit.admin_note}</p>
                            </div>
                          )}
                        </div>
                        {permit.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelPermit(permit.id)}
                            disabled={cancelling === permit.id}
                            className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                            data-testid={`cancel-permit-${permit.id}`}
                          >
                            {cancelling === permit.id ? 'Cancelling...' : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Profile Modal */}
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Name</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Email</Label>
                <Input
                  value={profileData.email}
                  disabled
                  className="h-12 bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    toast.info('Profile update feature coming soon!');
                    setShowEditProfile(false);
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setShowEditProfile(false)}
                  variant="outline"
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfilePage;