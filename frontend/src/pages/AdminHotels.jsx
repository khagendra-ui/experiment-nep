import { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCheck, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchHotels(filter);
  }, [filter]);

  const fetchHotels = async (status) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/hotels', {
        params: { status: status === 'all' ? undefined : status }
      });
      setHotels(response.data);
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const updateApproval = async (status) => {
    if (!selectedHotel) return;
    setUpdating(true);
    try {
      await axiosInstance.patch(`/admin/hotels/${selectedHotel.id}/approval`, {
        status,
        admin_note: adminNote
      });
      toast.success('Hotel approval updated');
      setSelectedHotel(null);
      setAdminNote('');
      fetchHotels(filter);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update hotel');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Hotel Approvals</h1>
          <p className="text-xl text-gray-600">Review and approve hotel listings</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {hotels.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-xl">No hotels found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="border-2 hover:shadow-xl transition">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
                        <div className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold capitalize ${getStatusBadge(hotel.approval_status || 'approved')}`}>
                          {hotel.approval_status || 'approved'}
                        </div>
                      </div>
                      <div className="text-gray-700 space-y-2">
                        <div><span className="font-semibold">Owner:</span> {hotel.owner_name || 'Unknown'}</div>
                        <div><span className="font-semibold">City:</span> {hotel.city}</div>
                        <div><span className="font-semibold">Address:</span> {hotel.location}</div>
                        <div><span className="font-semibold">Price:</span> ${hotel.price_per_night}/night</div>
                      </div>
                      {hotel.approval_note && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Admin Note:</p>
                          <p className="text-gray-700">{hotel.approval_note}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setAdminNote(hotel.approval_note || '');
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Review Hotel Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Hotel</p>
              <p className="text-lg font-semibold text-gray-900">{selectedHotel?.name}</p>
            </div>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add admin note (optional)"
              className="min-h-28"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => updateApproval('approved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={updating}
              >
                <BadgeCheck className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => updateApproval('rejected')}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => updateApproval('pending')}
                variant="outline"
                disabled={updating}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Pending
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotels;
