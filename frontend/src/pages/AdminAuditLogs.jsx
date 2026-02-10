import { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/audit-logs');
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to load audit logs');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Admin Activity Log</h1>
          <p className="text-xl text-gray-600">Track important administrative actions</p>
        </div>

        {logs.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-xl">No audit logs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                      <p className="text-lg font-semibold text-slate-900">{log.action}</p>
                      <p className="text-sm text-slate-600">{log.entity_type} {log.entity_id || ''}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p><span className="font-semibold">Admin:</span> {log.admin_id}</p>
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

export default AdminAuditLogs;
