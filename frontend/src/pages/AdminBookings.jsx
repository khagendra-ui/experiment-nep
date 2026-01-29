import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Hotel, Calendar, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12" data-testid="admin-bookings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Hotel Bookings</h1>
          <p className="text-xl text-gray-600">View all hotel reservations and bookings</p>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3 gap-2">
            <TabsTrigger value="confirmed">
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({bookings.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="border-2 hover:shadow-xl transition" data-testid={`admin-booking-card-${booking.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Hotel className="h-6 w-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          {booking.hotel_name}
                        </h3>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize border-2 ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-gray-700">
                        <div>
                          <span className="font-semibold">Guest:</span> {booking.user_name}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span> {booking.user_email}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Check-in:</span>
                          <span className="ml-2">{new Date(booking.check_in).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Check-out:</span>
                          <span className="ml-2">{new Date(booking.check_out).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Guests:</span>
                          <span className="ml-2">{booking.guests}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-emerald-600">Total:</span>
                          <span className="ml-2 text-2xl font-bold text-emerald-600">${booking.total_price.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">Booked on:</span>
                          <span className="ml-2">{new Date(booking.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
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

export default AdminBookings;