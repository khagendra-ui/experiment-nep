import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminPermitTypes = () => {
  const [permitTypes, setPermitTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    fetchPermitTypes();
  }, []);

  const fetchPermitTypes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/permit-types');
      setPermitTypes(response.data);
    } catch (error) {
      toast.error('Failed to fetch permit types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price)
      };
      await axiosInstance.post('/admin/permit-types', data);
      toast.success('Permit type created successfully!');
      setFormData({ name: '', description: '', price: '' });
      fetchPermitTypes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create permit type');
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Manage Permit Types</h1>
          <p className="text-xl text-gray-600">Create and view available trekking permits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Permit Type */}
          <div>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <Plus className="h-6 w-6" />
                  <span>Add New Permit Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">Permit Name *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g., TIMS Card, Annapurna Permit"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what this permit is for and any requirements..."
                      value={formData.description}
                      onChange={handleChange}
                      className="min-h-32 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-base font-semibold">Price (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="20.00"
                        value={formData.price}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Permit Type'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Existing Permit Types */}
          <div>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Existing Permit Types ({permitTypes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {permitTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No permit types yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {permitTypes.map((permit) => (
                      <Card key={permit.id} className="border hover:shadow-lg transition">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{permit.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{permit.description}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                  ${permit.price.toFixed(2)}
                                </span>
                                <span className="text-gray-500">
                                  Created: {new Date(permit.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPermitTypes;
