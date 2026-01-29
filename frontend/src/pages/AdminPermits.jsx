import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPermits = () => {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', admin_note: '' });
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/permits');
      setPermits(response.data);
    } catch (error) {
      toast.error('Failed to fetch permits');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermitDetails = async (permitId) => {
    try {
      const response = await axiosInstance.get(`/admin/permits/${permitId}`);
      setSelectedPermit(response.data);
    } catch (error) {
      toast.error('Failed to fetch permit details');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.patch(`/admin/permits/${selectedPermit.id}`, updateData);
      toast.success('Permit updated successfully!');
      setSelectedPermit(null);
      setUpdateData({ status: '', admin_note: '' });
      fetchPermits();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update permit');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const filteredPermits = permits.filter(permit => {
    if (filter === 'all') return true;
    return permit.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12" data-testid="admin-permits-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Permit Applications</h1>
          <p className="text-xl text-gray-600">Review and manage trekking permit requests</p>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({permits.filter(p => p.status === 'pending').length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved ({permits.filter(p => p.status === 'approved').length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({permits.filter(p => p.status === 'rejected').length})</span>
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({permits.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Permits List */}
        {filteredPermits.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">No permits found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPermits.map((permit) => (
              <Card key={permit.id} className="border-2 hover:shadow-xl transition" data-testid={`admin-permit-card-${permit.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {permit.permit_type} - {permit.trek_area}
                        </h3>
                        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border-2 ${getStatusColor(permit.status)}`}>
                          {getStatusIcon(permit.status)}
                          <span className="text-sm font-semibold capitalize">{permit.status}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-gray-700 mb-4">
                        <div>
                          <span className="font-semibold">Applicant:</span> {permit.full_name}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span> {permit.user_email}
                        </div>
                        <div>
                          <span className="font-semibold">Passport:</span> {permit.passport_number}
                        </div>
                        <div>
                          <span className="font-semibold">Nationality:</span> {permit.nationality}
                        </div>
                        <div>
                          <span className="font-semibold">Duration:</span> {permit.start_date} to {permit.end_date}
                        </div>
                        <div>
                          <span className="font-semibold">Applied:</span> {new Date(permit.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {permit.admin_note && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Admin Note:</p>
                          <p className="text-gray-700">{permit.admin_note}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button
                        onClick={() => {
                          fetchPermitDetails(permit.id);
                          setUpdateData({ status: '', admin_note: '' });
                        }}
                        variant={permit.status === 'pending' ? 'default' : 'outline'}
                        className={permit.status === 'pending' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold' : ''}
                        data-testid={`review-permit-button-${permit.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal with Full Details */}
      <Dialog open={!!selectedPermit} onOpenChange={() => setSelectedPermit(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="permit-review-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Permit Application Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Applicant Info */}
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-xl border-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Applicant Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.user_email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Passport Number</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.passport_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Nationality</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.nationality}</p>
                </div>
              </div>
            </div>

            {/* Trek Details */}
            <div className="bg-gradient-to-br from-purple-50 to-gray-50 p-6 rounded-xl border-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trek Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Permit Type</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.permit_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trek Area</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.trek_area}</p>
                </div>
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.start_date}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.end_date}</p>
                </div>
                <div>
                  <p className="text-gray-600">Application Date</p>
                  <p className="font-semibold text-gray-900">{selectedPermit?.created_at ? new Date(selectedPermit.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedPermit?.status}</p>
                </div>
              </div>
            </div>

            {/* Passport Photo */}
            {selectedPermit?.document_data && (
              <div className="bg-gradient-to-br from-green-50 to-gray-50 p-6 rounded-xl border-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Passport Photo</h3>
                <div className="flex justify-center">
                  <img 
                    src={`data:image/jpeg;base64,${selectedPermit.document_data}`}
                    alt="Passport Photo"
                    className="max-w-md max-h-96 rounded-lg border-4 border-white shadow-xl object-contain"
                  />
                </div>
              </div>
            )}

            {/* Admin Note if exists */}
            {selectedPermit?.admin_note && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">Previous Admin Note:</p>
                <p className="text-gray-700">{selectedPermit.admin_note}</p>
              </div>
            )}

            {/* Review Form - Only show for pending permits */}
            {selectedPermit?.status === 'pending' && (
              <form onSubmit={handleUpdate} className="space-y-4 border-t-2 pt-6">
                <h3 className="text-lg font-bold text-gray-900">Review Decision</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-semibold">Decision</Label>
                  <Select value={updateData.status} onValueChange={(value) => setUpdateData({ ...updateData, status: value })} required>
                    <SelectTrigger className="h-12 border-2" data-testid="permit-status-select">
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">✅ Approve</SelectItem>
                      <SelectItem value="rejected">❌ Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_note" className="text-base font-semibold">Admin Note (Optional)</Label>
                  <Textarea
                    id="admin_note"
                    data-testid="permit-admin-note"
                    placeholder="Add any notes or instructions for the applicant..."
                    value={updateData.admin_note}
                    onChange={(e) => setUpdateData({ ...updateData, admin_note: e.target.value })}
                    className="min-h-24 border-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    data-testid="submit-permit-decision"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base"
                    disabled={updating || !updateData.status}
                  >
                    {updating ? 'Submitting...' : 'Submit Decision'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedPermit(null)}
                    className="h-12 border-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Close button for non-pending permits */}
            {selectedPermit?.status !== 'pending' && (
              <Button
                onClick={() => setSelectedPermit(null)}
                className="w-full h-12 border-2"
                variant="outline"
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPermits;