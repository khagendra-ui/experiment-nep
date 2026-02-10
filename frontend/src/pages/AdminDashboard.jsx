import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Hotel, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOwners, setRecentOwners] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchSosAlerts();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      const users = Array.isArray(response.data) ? response.data : [];
      const sorted = users.slice().sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
      });
      setRecentUsers(sorted.filter(u => u.role === 'user').slice(0, 6));
      setRecentOwners(sorted.filter(u => u.role === 'hotel_owner').slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch users');
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
      link: '/admin/users?role=user&filter=all' 
    },
    { 
      label: 'Hotel Owners', 
      value: stats?.total_hotel_owners || 0, 
      sublabel: 'Verified partners',
      icon: Building2, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      link: '/admin/users?role=hotel_owner&filter=all' 
    },
    { 
      label: 'Total Hotels', 
      value: stats?.total_hotels || 0, 
      sublabel: 'Listed properties',
      icon: Hotel, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      link: '/admin/hotels' 
    },
    { 
      label: 'Destinations', 
      value: stats?.total_tourist_spots || 0, 
      sublabel: 'Tourist spots',
      icon: MapPin, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50',
      link: '/admin/destinations' 
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
    { 
      label: 'Pending Hotels', 
      value: stats?.pending_hotels || 0, 
      sublabel: 'Need approval',
      icon: Hotel, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      link: '/admin/hotels' 
    },
    { 
      label: 'Banned Users', 
      value: stats?.banned_users || 0, 
      sublabel: 'Restricted accounts',
      icon: XCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      link: '/admin/users?filter=banned' 
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
              <Link to="/admin/sos" className="ml-auto">
                <Button size="sm" className="bg-nepal-red-600 hover:bg-nepal-red-700">
                  Manage Alerts
                </Button>
              </Link>
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

        {/* Recent Users & Hotel Owners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-xl">Recent Users</CardTitle>
              <Link to="/admin/users?role=user&filter=all" className="text-xs font-semibold text-nepal-blue-600 hover:text-nepal-blue-700">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-slate-500">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{user.name || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-xl">Recent Hotel Owners</CardTitle>
              <Link to="/admin/users?role=hotel_owner&filter=all" className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentOwners.length === 0 ? (
                <p className="text-sm text-slate-500">No hotel owners found.</p>
              ) : (
                <div className="space-y-3">
                  {recentOwners.map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{owner.name || 'Unnamed Owner'}</p>
                        <p className="text-xs text-slate-500">{owner.email}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
