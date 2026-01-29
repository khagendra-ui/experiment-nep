import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Hotel, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const HotelOwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/hotel-owner/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The guest will be notified.')) return;
    
    setCancelling(bookingId);
    try {
      await axiosInstance.patch(`/hotel-owner/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Hotel Bookings</h1>
          <p className="text-gray-600 mt-2">View all bookings for your properties</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.hotel_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <p className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <strong>Guest:</strong>&nbsp;{booking.user_name}
                          </p>
                          <p className="ml-6">{booking.user_email}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <strong>Check-in:</strong>&nbsp;{new Date(booking.check_in).toLocaleDateString()}
                          </p>
                          <p className="flex items-center ml-6">
                            <strong>Check-out:</strong>&nbsp;{new Date(booking.check_out).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <strong>Guests:</strong>&nbsp;{booking.guests}
                        </p>
                        
                        <p className="font-semibold text-emerald-600">
                          Total: ${booking.total_price.toFixed(2)}
                        </p>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-3">
                        Booked on {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        className="border-2 border-red-300 text-red-600 hover:bg-red-50 ml-4"
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
      </div>
    </div>
  );
};

export default HotelOwnerBookingsPage;
