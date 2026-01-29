import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Hotel, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/stats');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Government Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Nepal Tourism & Safety Administration</p>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link to="/admin/bookings">
            <Card className="border-2 hover:shadow-xl transition card-hover cursor-pointer hover:border-blue-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Total Users</CardTitle>
                <Users className="h-8 w-8 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">{stats?.total_users || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Registered tourists</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/bookings">
            <Card className="border-2 hover:shadow-xl transition card-hover cursor-pointer hover:border-emerald-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Hotel Bookings</CardTitle>
                <Hotel className="h-8 w-8 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">{stats?.total_bookings || 0}</div>
                <p className="text-sm text-gray-600 mt-1">{stats?.cancelled_bookings || 0} cancelled</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/permits">
            <Card className="border-2 hover:shadow-xl transition card-hover cursor-pointer hover:border-purple-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Permit Applications</CardTitle>
                <FileText className="h-8 w-8 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">{stats?.total_permits || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Total applications</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/permits">
            <Card className="border-2 hover:shadow-xl transition card-hover bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer hover:border-yellow-400">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Pending Permits</CardTitle>
                <Clock className="h-8 w-8 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-yellow-700">{stats?.pending_permits || 0}</div>
                <p className="text-sm text-yellow-700 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/permits">
            <Card className="border-2 hover:shadow-xl transition card-hover bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:border-green-400">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Approved Permits</CardTitle>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-700">{stats?.approved_permits || 0}</div>
                <p className="text-sm text-green-700 mt-1">Successfully processed</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/bookings">
            <Card className="border-2 hover:shadow-xl transition card-hover bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:border-red-400">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Cancelled Bookings</CardTitle>
                <XCircle className="h-8 w-8 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-700">{stats?.cancelled_bookings || 0}</div>
                <p className="text-sm text-red-700 mt-1">User cancellations</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Review Permit Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">Approve or reject pending trekking permit applications</p>
              <Link to="/admin/permits">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-12">
                  Review Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Manage Permit Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">Add new permit types and view existing permits</p>
              <Link to="/admin/permit-types">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold h-12">
                  Manage Types
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">View system statistics and bookings data</p>
              <Link to="/admin/bookings">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold h-12">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;