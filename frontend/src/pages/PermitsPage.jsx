import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PermitsPage = ({ user }) => {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    permit_type: 'TIMS',
    full_name: '',
    passport_number: '',
    nationality: '',
    trek_area: '',
    start_date: '',
    end_date: ''
  });
  const [document, setDocument] = useState(null);

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/permits');
      setPermits(response.data);
    } catch (error) {
      toast.error('Failed to fetch permits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (document) {
        formDataToSend.append('document', document);
      }

      await axiosInstance.post('/permits', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Permit application submitted successfully!');
      setShowForm(false);
      setFormData({
        permit_type: 'TIMS',
        full_name: '',
        passport_number: '',
        nationality: '',
        trek_area: '',
        start_date: '',
        end_date: ''
      });
      setDocument(null);
      fetchPermits();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="permits-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="permits-page-title">Trekking Permits</h1>
          <p className="text-lg text-gray-600 mb-4">
            Apply for TIMS cards and National Park entry permits
          </p>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              data-testid="apply-permit-button"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Apply for New Permit
            </Button>
          )}
        </div>

        {/* Application Form */}
        {showForm && (
          <Card className="mb-8" data-testid="permit-application-form">
            <CardHeader>
              <CardTitle>New Permit Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permit_type">Permit Type</Label>
                    <Select
                      value={formData.permit_type}
                      onValueChange={(value) => setFormData({ ...formData, permit_type: value })}
                    >
                      <SelectTrigger data-testid="permit-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIMS">TIMS Card</SelectItem>
                        <SelectItem value="Annapurna">Annapurna Conservation Area</SelectItem>
                        <SelectItem value="Everest">Sagarmatha National Park</SelectItem>
                        <SelectItem value="Langtang">Langtang National Park</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      data-testid="permit-fullname-input"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      data-testid="permit-passport-input"
                      value={formData.passport_number}
                      onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      data-testid="permit-nationality-input"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trek_area">Trek Area</Label>
                    <Input
                      id="trek_area"
                      data-testid="permit-trekarea-input"
                      placeholder="e.g., Annapurna Base Camp"
                      value={formData.trek_area}
                      onChange={(e) => setFormData({ ...formData, trek_area: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      data-testid="permit-startdate-input"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      data-testid="permit-enddate-input"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">Passport Copy (Optional)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="document"
                        data-testid="permit-document-input"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setDocument(e.target.files[0])}
                      />
                      {document && <Upload className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    data-testid="submit-permit-button"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-testid="cancel-permit-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Permits List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Applications</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : permits.length === 0 ? (
            <Card data-testid="no-permits-message">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No permit applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-testid="permits-list">
              {permits.map((permit) => (
                <Card key={permit.id} data-testid={`permit-card-${permit.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {permit.permit_type} - {permit.trek_area}
                          </h3>
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(permit.status)}`}>
                            {getStatusIcon(permit.status)}
                            <span className="text-sm font-medium capitalize">{permit.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><strong>Name:</strong> {permit.full_name}</p>
                          <p><strong>Passport:</strong> {permit.passport_number}</p>
                          <p><strong>Nationality:</strong> {permit.nationality}</p>
                          <p><strong>Duration:</strong> {permit.start_date} to {permit.end_date}</p>
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
    </div>
  );
};

export default PermitsPage;