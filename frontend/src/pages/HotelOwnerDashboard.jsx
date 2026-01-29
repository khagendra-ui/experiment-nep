import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, BookCheck, XCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const HotelOwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/hotel-owner/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12" data-testid="hotel-owner-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Hotel Owner Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your properties and bookings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-2 hover:shadow-xl transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">My Hotels</CardTitle>
              <Hotel className="h-8 w-8 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{stats?.total_hotels || 0}</div>
              <p className="text-sm text-gray-600 mt-1">Registered properties</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Total Bookings</CardTitle>
              <BookCheck className="h-8 w-8 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{stats?.total_bookings || 0}</div>
              <p className="text-sm text-gray-600 mt-1">All-time bookings</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Confirmed</CardTitle>
              <BookCheck className="h-8 w-8 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-700">{stats?.confirmed_bookings || 0}</div>
              <p className="text-sm text-green-700 mt-1">Active bookings</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Cancelled</CardTitle>
              <XCircle className="h-8 w-8 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-700">{stats?.cancelled_bookings || 0}</div>
              <p className="text-sm text-red-700 mt-1">Cancelled bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Manage Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">View and edit your registered hotels</p>
              <Link to="/hotel-owner/hotels">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12">
                  <Hotel className="h-5 w-5 mr-2" />
                  My Hotels
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Register New Hotel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">Add a new property to your portfolio</p>
              <Link to="/hotel-owner/add-hotel">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold h-12">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Hotel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">View Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">See all bookings for your hotels</p>
              <Link to="/hotel-owner/bookings">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold h-12">
                  <BookCheck className="h-5 w-5 mr-2" />
                  View All Bookings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerDashboard;
