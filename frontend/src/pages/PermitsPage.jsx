import { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Upload, Clock, CheckCircle, XCircle, MapPin, Mountain, Calendar, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// Tourism destinations that require permits
const PERMIT_DESTINATIONS = [
  {
    id: 'everest',
    name: 'Everest Base Camp',
    region: 'Sagarmatha National Park',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    altitude: '5,364m',
    duration: '12-14 days',
    difficulty: 'Moderate to Difficult',
    bestSeason: 'Mar-May, Sep-Nov',
    permits: ['TIMS Card', 'Sagarmatha National Park Entry'],
    fee: '$30 TIMS + $30 Park Entry',
    description: 'Trek to the base of the world\'s highest peak through Sherpa villages and stunning Himalayan scenery.',
    highlights: ['Kala Patthar viewpoint', 'Namche Bazaar', 'Tengboche Monastery', 'Khumbu Glacier']
  },
  {
    id: 'annapurna-circuit',
    name: 'Annapurna Circuit',
    region: 'Annapurna Conservation Area',
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80',
    altitude: '5,416m (Thorong La Pass)',
    duration: '15-20 days',
    difficulty: 'Moderate to Difficult',
    bestSeason: 'Mar-May, Oct-Nov',
    permits: ['TIMS Card', 'ACAP Entry Permit'],
    fee: '$20 TIMS + $30 ACAP',
    description: 'One of the world\'s best long-distance treks, circling the Annapurna massif through diverse landscapes.',
    highlights: ['Thorong La Pass', 'Muktinath Temple', 'Manang Valley', 'Hot springs at Tatopani']
  },
  {
    id: 'annapurna-base-camp',
    name: 'Annapurna Base Camp',
    region: 'Annapurna Conservation Area',
    image: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=800&q=80',
    altitude: '4,130m',
    duration: '7-10 days',
    difficulty: 'Moderate',
    bestSeason: 'Mar-May, Sep-Nov',
    permits: ['TIMS Card', 'ACAP Entry Permit'],
    fee: '$20 TIMS + $30 ACAP',
    description: 'A shorter but spectacular trek to the sanctuary surrounded by towering Annapurna peaks.',
    highlights: ['Annapurna Sanctuary', 'Machapuchare views', 'Gurung villages', 'Rhododendron forests']
  },
  {
    id: 'langtang',
    name: 'Langtang Valley',
    region: 'Langtang National Park',
    image: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800&q=80',
    altitude: '4,984m (Kyanjin Ri)',
    duration: '7-10 days',
    difficulty: 'Moderate',
    bestSeason: 'Mar-May, Oct-Nov',
    permits: ['TIMS Card', 'Langtang National Park Entry'],
    fee: '$20 TIMS + $30 Park Entry',
    description: 'Beautiful valley trek north of Kathmandu with Tibetan-influenced culture and stunning mountain views.',
    highlights: ['Kyanjin Gompa', 'Langtang Glacier', 'Cheese factory', 'Tamang heritage']
  },
  {
    id: 'manaslu',
    name: 'Manaslu Circuit',
    region: 'Manaslu Conservation Area',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
    altitude: '5,106m (Larkya La)',
    duration: '14-18 days',
    difficulty: 'Difficult',
    bestSeason: 'Mar-May, Sep-Nov',
    permits: ['Restricted Area Permit', 'MCAP Entry Permit', 'TIMS Card'],
    fee: '$70/week RAP + $30 MCAP + $20 TIMS',
    description: 'Remote and challenging trek around the world\'s eighth highest peak with restricted area access.',
    highlights: ['Larkya La Pass', 'Birendra Lake', 'Buddhist monasteries', 'Traditional villages']
  },
  {
    id: 'upper-mustang',
    name: 'Upper Mustang',
    region: 'Mustang District',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    altitude: '3,840m (Lo Manthang)',
    duration: '10-14 days',
    difficulty: 'Moderate',
    bestSeason: 'Mar-Nov (including monsoon)',
    permits: ['Restricted Area Permit', 'ACAP Entry Permit'],
    fee: '$500/10 days RAP + $30 ACAP',
    description: 'Explore the ancient forbidden kingdom of Lo with its Tibetan Buddhist culture and dramatic landscapes.',
    highlights: ['Lo Manthang walled city', 'Cave dwellings', 'Sky burial sites', 'Ancient monasteries']
  },
  {
    id: 'dolpo',
    name: 'Dolpo Region',
    region: 'Shey Phoksundo National Park',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    altitude: '5,360m (Kang La)',
    duration: '18-25 days',
    difficulty: 'Very Difficult',
    bestSeason: 'May-Oct',
    permits: ['Restricted Area Permit', 'National Park Entry'],
    fee: '$500/10 days RAP + $30 Park Entry',
    description: 'One of Nepal\'s most remote and pristine regions with pristine Tibetan culture.',
    highlights: ['Phoksundo Lake', 'Crystal Mountain', 'Bon Buddhist culture', 'Shey Gompa']
  },
  {
    id: 'kanchenjunga',
    name: 'Kanchenjunga Base Camp',
    region: 'Kanchenjunga Conservation Area',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
    altitude: '5,143m (North BC)',
    duration: '20-25 days',
    difficulty: 'Difficult',
    bestSeason: 'Mar-May, Oct-Nov',
    permits: ['Restricted Area Permit', 'KCA Entry Permit'],
    fee: '$20/week RAP + $30 KCA',
    description: 'Trek to the base of the world\'s third highest peak in Nepal\'s far eastern wilderness.',
    highlights: ['North and South Base Camps', 'Rhododendron blooms', 'Limbu culture', 'Remote wilderness']
  }
];

const PermitsPage = ({ user }) => {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
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

  const handleApplyFromDestination = (destination) => {
    setFormData({
      ...formData,
      trek_area: destination.name,
      permit_type: destination.permits[0].includes('TIMS') ? 'TIMS' : 
                   destination.name.includes('Annapurna') ? 'Annapurna' :
                   destination.name.includes('Everest') ? 'Everest' :
                   destination.name.includes('Langtang') ? 'Langtang' : 'TIMS'
    });
    setSelectedDestination(null);
    setShowForm(true);
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
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-nepal-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-nepal-red-500 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="permits-page">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1920&q=80"
          alt="Nepal Mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 rounded-full text-sm font-accent font-medium mb-4">
              <FileText className="h-4 w-4" />
              Official Permit Portal
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-semibold text-white mb-3">
              Trekking Permits
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Apply for TIMS cards, national park entry, and restricted area permits for Nepal's most iconic destinations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Destinations Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-accent font-bold text-nepal-blue-500 mb-2 block">
                Popular Destinations
              </span>
              <h2 className="font-heading text-3xl font-normal text-slate-900">
                Destinations Requiring Permits
              </h2>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                data-testid="apply-permit-button"
                className="h-12 px-6 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
              >
                <FileText className="h-4 w-4 mr-2" />
                Apply for Permit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERMIT_DESTINATIONS.map((destination, index) => (
              <div 
                key={destination.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedDestination(destination)}
              >
                <Card className="h-full bg-white border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block px-2 py-1 bg-nepal-blue-500 text-white text-xs font-medium rounded-full mb-2">
                        {destination.difficulty}
                      </span>
                      <h3 className="text-white font-semibold text-lg leading-tight">{destination.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{destination.region}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mountain className="h-3 w-3" />
                        <span>{destination.altitude}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span>{destination.duration}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {destination.permits.slice(0, 2).map((permit, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-nepal-blue-50 text-nepal-blue-600 rounded-full">
                            {permit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <Card className="mb-12 rounded-2xl border border-slate-100 shadow-sm" data-testid="permit-application-form">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="font-heading text-2xl">New Permit Application</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">Permit Type</Label>
                    <Select
                      value={formData.permit_type}
                      onValueChange={(value) => setFormData({ ...formData, permit_type: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl" data-testid="permit-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIMS">TIMS Card (Trekkers Information Management System)</SelectItem>
                        <SelectItem value="Annapurna">Annapurna Conservation Area Permit (ACAP)</SelectItem>
                        <SelectItem value="Everest">Sagarmatha National Park Entry</SelectItem>
                        <SelectItem value="Langtang">Langtang National Park Entry</SelectItem>
                        <SelectItem value="Manaslu">Manaslu Restricted Area Permit</SelectItem>
                        <SelectItem value="Upper Mustang">Upper Mustang Restricted Area Permit</SelectItem>
                        <SelectItem value="Dolpo">Dolpo Restricted Area Permit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Full Name (as per passport)</Label>
                    <Input
                      data-testid="permit-fullname-input"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="h-12 rounded-xl"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Passport Number</Label>
                    <Input
                      data-testid="permit-passport-input"
                      value={formData.passport_number}
                      onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                      className="h-12 rounded-xl"
                      placeholder="e.g., AB1234567"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Nationality</Label>
                    <Input
                      data-testid="permit-nationality-input"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="h-12 rounded-xl"
                      placeholder="e.g., United States"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Trek Area / Destination</Label>
                    <Input
                      data-testid="permit-trekarea-input"
                      placeholder="e.g., Everest Base Camp, Annapurna Circuit"
                      value={formData.trek_area}
                      onChange={(e) => setFormData({ ...formData, trek_area: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Start Date</Label>
                    <Input
                      data-testid="permit-startdate-input"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="h-12 rounded-xl"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">End Date</Label>
                    <Input
                      data-testid="permit-enddate-input"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="h-12 rounded-xl"
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Passport Copy (Optional)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        data-testid="permit-document-input"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setDocument(e.target.files[0])}
                        className="h-12 rounded-xl"
                      />
                      {document && <Upload className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Important Information</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li>TIMS cards are mandatory for all trekking routes</li>
                        <li>Restricted Area Permits require a minimum of 2 trekkers with a licensed guide</li>
                        <li>Permit processing takes 1-3 business days</li>
                        <li>Bring your original passport and 2 passport-sized photos for collection</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    data-testid="submit-permit-button"
                    className="h-12 px-6 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-testid="cancel-permit-button"
                    className="h-12 px-6 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* User's Applications */}
        <div>
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest font-accent font-bold text-nepal-blue-500 mb-2 block">
              My Applications
            </span>
            <h2 className="font-heading text-2xl font-normal text-slate-900">Your Permit Applications</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepal-blue-500"></div>
            </div>
          ) : permits.length === 0 ? (
            <Card className="rounded-2xl border border-slate-100" data-testid="no-permits-message">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">You haven't applied for any permits yet</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600"
                >
                  Apply for Your First Permit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-testid="permits-list">
              {permits.map((permit) => (
                <Card key={permit.id} className="rounded-2xl border border-slate-100" data-testid={`permit-card-${permit.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-heading font-semibold text-slate-900">
                            {permit.permit_type} - {permit.trek_area}
                          </h3>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(permit.status)}`}>
                            {getStatusIcon(permit.status)}
                            <span className="text-sm font-medium capitalize">{permit.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
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

      {/* Destination Detail Modal */}
      <Dialog open={!!selectedDestination} onOpenChange={() => setSelectedDestination(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          {selectedDestination && (
            <>
              <div className="relative h-64">
                <img 
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="inline-block px-3 py-1 bg-nepal-blue-500 text-white text-sm font-medium rounded-full mb-2">
                    {selectedDestination.difficulty}
                  </span>
                  <DialogTitle className="text-3xl font-heading font-semibold text-white">
                    {selectedDestination.name}
                  </DialogTitle>
                  <DialogDescription className="text-white/80">
                    {selectedDestination.region}
                  </DialogDescription>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6">{selectedDestination.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <Mountain className="h-5 w-5 mx-auto mb-1 text-nepal-blue-500" />
                    <p className="text-xs text-slate-500">Max Altitude</p>
                    <p className="font-semibold text-slate-900">{selectedDestination.altitude}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-nepal-blue-500" />
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="font-semibold text-slate-900">{selectedDestination.duration}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-nepal-blue-500" />
                    <p className="text-xs text-slate-500">Permit Fee</p>
                    <p className="font-semibold text-slate-900 text-xs">{selectedDestination.fee}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-nepal-blue-500" />
                    <p className="text-xs text-slate-500">Best Season</p>
                    <p className="font-semibold text-slate-900 text-xs">{selectedDestination.bestSeason}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Required Permits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.permits.map((permit, idx) => (
                      <span key={idx} className="px-3 py-1 bg-nepal-blue-50 text-nepal-blue-600 rounded-full text-sm font-medium">
                        {permit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.highlights.map((highlight, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleApplyFromDestination(selectedDestination)}
                  className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
                >
                  Apply for Permit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermitsPage;
