import { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminSosAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('active');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAlerts(filter);
  }, [filter]);

  const fetchAlerts = async (status) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/sos-alerts', {
        params: { status: status === 'all' ? undefined : status }
      });
      setAlerts(response.data);
    } catch (error) {
      toast.error('Failed to load SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (status) => {
    if (!selectedAlert) return;
    setUpdating(true);
    try {
      await axiosInstance.patch(`/admin/sos-alerts/${selectedAlert.id}`, {
        status,
        admin_note: adminNote
      });
      toast.success('Alert updated');
      setSelectedAlert(null);
      setAdminNote('');
      fetchAlerts(filter);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update alert');
    } finally {
      setUpdating(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SOS Alerts</h1>
          <p className="text-xl text-gray-600">Monitor and resolve emergency alerts</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3 gap-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {alerts.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-xl">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-2">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-xl font-bold text-gray-900">{alert.emergency_type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{alert.user_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                    {alert.google_maps_link && (
                      <a href={alert.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                        View location
                      </a>
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setAdminNote(alert.admin_note || '');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Update SOS Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add admin note"
              className="min-h-24"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => updateAlert('resolved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={updating}
              >
                Mark Resolved
              </Button>
              <Button
                onClick={() => updateAlert('active')}
                variant="outline"
                disabled={updating}
              >
                Keep Active
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSosAlerts;
