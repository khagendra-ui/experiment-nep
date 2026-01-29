import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Hotel, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Building2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosAlerts, setSosAlerts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchSosAlerts();
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

  const fetchSosAlerts = async () => {
    try {
      const response = await axiosInstance.get('/admin/sos-alerts');
      setSosAlerts(response.data.filter(a => a.status === 'active').slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch SOS alerts');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F9F9F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepal-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.total_users || 0, 
      sublabel: 'Registered tourists',
      icon: Users, 
      color: 'text-nepal-blue-500', 
      bg: 'bg-nepal-blue-50',
      link: '/admin/bookings' 
    },
    { 
      label: 'Hotel Owners', 
      value: stats?.total_hotel_owners || 0, 
      sublabel: 'Verified partners',
      icon: Building2, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      link: '/admin/bookings' 
    },
    { 
      label: 'Total Hotels', 
      value: stats?.total_hotels || 0, 
      sublabel: 'Listed properties',
      icon: Hotel, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      link: '/admin/bookings' 
    },
    { 
      label: 'Total Bookings', 
      value: stats?.total_bookings || 0, 
      sublabel: `${stats?.confirmed_bookings || 0} confirmed`,
      icon: CheckCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-50',
      link: '/admin/bookings' 
    },
    { 
      label: 'Permit Applications', 
      value: stats?.total_permits || 0, 
      sublabel: 'All time',
      icon: FileText, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50',
      link: '/admin/permits' 
    },
    { 
      label: 'Pending Permits', 
      value: stats?.pending_permits || 0, 
      sublabel: 'Awaiting review',
      icon: Clock, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      link: '/admin/permits' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs uppercase tracking-widest font-accent font-bold text-nepal-blue-500 mb-2 block">
            Administration Portal
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-normal text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-500">Nepal Tourism & Safety Administration</p>
        </div>

        {/* Active SOS Alerts */}
        {sosAlerts.length > 0 && (
          <div className="mb-8 p-4 bg-nepal-red-50 border border-nepal-red-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-nepal-red-500 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-nepal-red-700">Active Emergency Alerts</h3>
                <p className="text-sm text-nepal-red-600">{sosAlerts.length} alert(s) require attention</p>
              </div>
            </div>
            <div className="space-y-2">
              {sosAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">{alert.user_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500">{alert.emergency_type} - {new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  <a 
                    href={alert.google_maps_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-nepal-red-500 text-white text-xs font-medium rounded-full hover:bg-nepal-red-600"
                  >
                    View Location
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {statCards.map((stat, idx) => (
            <Link key={idx} to={stat.link}>
              <Card className="group bg-white border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-heading font-semibold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{stat.sublabel}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} strokeWidth={1.5} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-xl">Review Permits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                {stats?.pending_permits || 0} pending applications awaiting your review
              </p>
              <Link to="/admin/permits">
                <Button className="w-full h-11 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold">
                  Review Applications
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-xl">Manage Permit Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Add or modify available trekking permit types
              </p>
              <Link to="/admin/permit-types">
                <Button className="w-full h-11 rounded-full bg-purple-600 hover:bg-purple-700 font-semibold">
                  Manage Types
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-xl">View Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Monitor all hotel bookings and user activity
              </p>
              <Link to="/admin/bookings">
                <Button className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  View Details
                  <ArrowUpRight className="ml-2 h-4 w-4" />
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
