import { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { destinationsData } from '@/pages/TouristDestinationsPage';

const emptyForm = {
  name: '',
  name_ne: '',
  category: '',
  description: '',
  latitude: '',
  longitude: '',
  location: '',
  rating: '',
  best_time_to_visit: '',
  region: '',
  altitude: '',
  permit: false,
  permit_type: '',
  difficulty: '',
  duration: '',
  attractions: '',
  cost: ''
};

const AdminDestinations = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [importing, setImporting] = useState(false);

  const getErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg || JSON.stringify(item)).join('; ');
    }
    if (typeof detail === 'object') return JSON.stringify(detail);
    return fallback;
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/tourist-spots');
      setSpots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleCheckboxChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startEdit = (spot) => {
    setEditingId(spot.id);
    setForm({
      name: spot.name || '',
      name_ne: spot.name_ne || '',
      category: spot.category || '',
      description: spot.description || '',
      latitude: String(spot.latitude ?? ''),
      longitude: String(spot.longitude ?? ''),
      location: spot.location || '',
      rating: String(spot.rating ?? ''),
      best_time_to_visit: spot.best_time_to_visit || '',
      region: spot.region || '',
      altitude: spot.altitude || '',
      permit: Boolean(spot.permit),
      permit_type: spot.permit_type || '',
      difficulty: spot.difficulty || '',
      duration: spot.duration || '',
      attractions: spot.attractions || '',
      cost: spot.cost || ''
    });
    setImageFile(null);
    setImagePreview(spot.image_url || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview('');
  };

  const saveSpot = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        name_ne: form.name_ne.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        location: form.location.trim(),
        rating: Number(form.rating),
        best_time_to_visit: form.best_time_to_visit.trim(),
        region: form.region.trim(),
        altitude: form.altitude.trim(),
        permit: Boolean(form.permit),
        permit_type: form.permit_type.trim(),
        difficulty: form.difficulty.trim(),
        duration: form.duration.trim(),
        attractions: form.attractions.trim(),
        cost: form.cost.trim()
      };

      if (!payload.name || !payload.category || !payload.description || !payload.location || !payload.best_time_to_visit) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude) || Number.isNaN(payload.rating)) {
        toast.error('Latitude, longitude, and rating must be valid numbers');
        return;
      }

      if (!editingId && !imageFile) {
        toast.error('Please upload an image for the destination');
        return;
      }

      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('name_ne', payload.name_ne);
      formData.append('category', payload.category);
      formData.append('description', payload.description);
      formData.append('latitude', String(payload.latitude));
      formData.append('longitude', String(payload.longitude));
      formData.append('location', payload.location);
      formData.append('rating', String(payload.rating));
      formData.append('best_time_to_visit', payload.best_time_to_visit);
      formData.append('region', payload.region);
      formData.append('altitude', payload.altitude);
      formData.append('permit', String(payload.permit));
      formData.append('permit_type', payload.permit_type);
      formData.append('difficulty', payload.difficulty);
      formData.append('duration', payload.duration);
      formData.append('attractions', payload.attractions);
      formData.append('cost', payload.cost);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        await axiosInstance.patch(`/admin/tourist-spots/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Destination updated');
      } else {
        await axiosInstance.post('/admin/tourist-spots', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Destination created');
      }

      cancelEdit();
      fetchSpots();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save destination'));
    } finally {
      setSaving(false);
    }
  };

  const deleteSpot = async (spotId) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await axiosInstance.delete(`/admin/tourist-spots/${spotId}`);
      toast.success('Destination deleted');
      fetchSpots();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete destination'));
    }
  };

  const importLegacyDestinations = async () => {
    if (!window.confirm('Import legacy destinations to the admin list?')) return;
    setImporting(true);
    try {
      const response = await axiosInstance.post('/admin/tourist-spots/import', destinationsData);
      const inserted = response.data?.inserted ?? 0;
      const updated = response.data?.updated ?? 0;
      toast.success(`Imported ${inserted}, updated ${updated} destinations`);
      fetchSpots();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to import destinations'));
    } finally {
      setImporting(false);
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Destination Management</h1>
          <p className="text-xl text-gray-600">Add, edit, or remove public tourist destinations.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={importLegacyDestinations} disabled={importing}>
              {importing ? 'Importing...' : 'Import Legacy Destinations'}
            </Button>
          </div>
        </div>

        <Card className="border-2 mb-10">
          <CardHeader>
            <CardTitle className="text-2xl">
              {editingId ? 'Edit Destination' : 'Add Destination'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={form.name} onChange={handleChange('name')} placeholder="Name" />
              <Input value={form.name_ne} onChange={handleChange('name_ne')} placeholder="Name (Nepali)" />
              <Input value={form.category} onChange={handleChange('category')} placeholder="Category (temple, mountain, lake, park)" />
              <Input value={form.location} onChange={handleChange('location')} placeholder="Location" />
              <Input value={form.best_time_to_visit} onChange={handleChange('best_time_to_visit')} placeholder="Best time to visit" />
              <Input value={form.latitude} onChange={handleChange('latitude')} placeholder="Latitude" />
              <Input value={form.longitude} onChange={handleChange('longitude')} placeholder="Longitude" />
              <Input value={form.rating} onChange={handleChange('rating')} placeholder="Rating" />
              <Input value={form.region} onChange={handleChange('region')} placeholder="Region" />
              <Input value={form.altitude} onChange={handleChange('altitude')} placeholder="Altitude" />
              <Input value={form.permit_type} onChange={handleChange('permit_type')} placeholder="Permit type" />
              <Input value={form.difficulty} onChange={handleChange('difficulty')} placeholder="Difficulty" />
              <Input value={form.duration} onChange={handleChange('duration')} placeholder="Duration" />
              <Input value={form.cost} onChange={handleChange('cost')} placeholder="Cost" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.permit} onChange={handleCheckboxChange('permit')} />
              Permit required
            </label>
            <div className="space-y-2">
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200">
                  <img src={imagePreview} alt="Destination preview" className="h-48 w-full object-cover" />
                </div>
              )}
            </div>
            <Textarea value={form.description} onChange={handleChange('description')} placeholder="Description" className="min-h-24" />
            <Textarea value={form.attractions} onChange={handleChange('attractions')} placeholder="Highlights / Attractions" className="min-h-24" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveSpot} disabled={saving} className="bg-nepal-blue-500 hover:bg-nepal-blue-600">
                {editingId ? 'Save Changes' : 'Create Destination'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {spots.length === 0 ? (
          <Card className="border-2">
            <CardContent className="text-center py-20">
              <p className="text-gray-500 text-xl">No destinations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {spots.map((spot) => (
              <Card key={spot.id} className="border-2 hover:shadow-xl transition">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    {spot.image_url && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-slate-200">
                        <img src={spot.image_url} alt={spot.name} className="h-40 w-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-nepal-blue-500" />
                      {spot.name}
                    </h3>
                    <p className="text-gray-600">{spot.location}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase font-semibold">
                        {spot.category}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                        Rating: {spot.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{spot.description}</p>
                    <p className="mt-2 text-xs text-slate-500">Best time: {spot.best_time_to_visit}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => startEdit(spot)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => deleteSpot(spot.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
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

export default AdminDestinations;
