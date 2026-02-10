import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { axiosInstance } from '@/App';
import { Hotel, AlertTriangle, MapPin, Navigation, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const mapColors = {
  hotel: 'hsl(var(--primary))',
  emergency: 'hsl(var(--destructive))',
  spot: 'hsl(var(--secondary))',
  user: 'hsl(var(--accent))',
  route: 'hsl(var(--primary))',
  poiPrimary: 'hsl(var(--accent))',
  poiSecondary: 'hsl(var(--secondary))',
  weather: 'hsl(var(--accent))'
};

const createCustomIcon = (bgColor, icon, fgColor = 'white') => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${bgColor}; color: ${fgColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        ${icon}
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const hotelIcon = createCustomIcon(mapColors.hotel, '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>');
const emergencyIcon = createCustomIcon(mapColors.emergency, '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>');
const spotIcon = createCustomIcon(mapColors.spot, '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>');
const userIcon = createCustomIcon(mapColors.user, '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>');

const hasValidCoords = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng);

function RoutingMachine({ start, end, onRouteFound }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Clean up existing routing control
    if (routingControlRef.current) {
      try {
        const control = routingControlRef.current;
        map.removeControl(control);
        routingControlRef.current = null;
      } catch (e) {
        console.log('Error removing control:', e);
      }
    }

    // Small delay to ensure map is ready
    const timer = setTimeout(() => {
      try {
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
          ],
          routeWhileDragging: false,
          showAlternatives: false,
          addWaypoints: false,
          lineOptions: {
            styles: [{ color: mapColors.route, weight: 6, opacity: 0.9 }],
            extendToWaypoints: false,
            missingRouteTolerance: 0
          },
          createMarker: function() { return null; },
          fitSelectedRoutes: true,
          show: false
        });

        routingControl.on('routesfound', function(e) {
          try {
            const routes = e.routes;
            if (routes && routes[0] && routes[0].summary) {
              const summary = routes[0].summary;
              onRouteFound({
                distance: (summary.totalDistance / 1000).toFixed(2),
                duration: Math.round(summary.totalTime / 60)
              });
            }
          } catch (err) {
            console.log('Route calculation error:', err);
          }
        });

        routingControl.on('routingerror', function(e) {
          console.log('Routing error:', e);
          onRouteFound({
            distance: '0.00',
            duration: 0
          });
        });

        routingControl.addTo(map);
        routingControlRef.current = routingControl;
      } catch (e) {
        console.log('Error creating routing control:', e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [map, start, end]);

  return null;
}

function MapControls({ onFindPois, onFindWeather, onFindTourist }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const control = L.control({ position: 'topleft' });
    control.onAdd = function() {
      const div = L.DomUtil.create('div', 'map-controls p-2');
      div.style.background = 'white';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
      div.style.padding = '6px';

      const poisBtn = L.DomUtil.create('button', 'btn btn-pois', div);
      poisBtn.innerText = 'Search POIs here';
      poisBtn.style.margin = '4px';
      poisBtn.style.padding = '6px 8px';
      poisBtn.style.cursor = 'pointer';

      const weatherBtn = L.DomUtil.create('button', 'btn btn-weather', div);
      weatherBtn.innerText = 'Show Weather here';
      weatherBtn.style.margin = '4px';
      weatherBtn.style.padding = '6px 8px';
      weatherBtn.style.cursor = 'pointer';

      const touristBtn = L.DomUtil.create('button', 'btn btn-tourist', div);
      touristBtn.innerText = 'Load Nepal tourist spots';
      touristBtn.style.margin = '4px';
      touristBtn.style.padding = '6px 8px';
      touristBtn.style.cursor = 'pointer';

      L.DomEvent.on(poisBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onFindPois(map.getCenter());
      });

      L.DomEvent.on(weatherBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onFindWeather(map.getCenter());
      });

      L.DomEvent.on(touristBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onFindTourist({ country: 'Nepal' });
      });

      return div;
    };

    control.addTo(map);

    return () => {
      try { control.remove(); } catch (e) {}
    };
  }, [map, onFindPois, onFindWeather, onFindTourist]);

  return null;
}

// MarkerCluster helper component using leaflet.markercluster
function MarkerCluster({ items = [], iconColor = mapColors.spot, popupRenderer, onItemClick }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // clean up previous layer
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
      layerRef.current = null;
    }

    const group = typeof L.markerClusterGroup === 'function' ? L.markerClusterGroup() : L.layerGroup();

    items.forEach((item) => {
      if (!item || !item.latitude || !item.longitude) return;
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createCustomIcon(iconColor, '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>')
      });

      const content = popupRenderer ? popupRenderer(item) : `<div class="min-w-[200px] p-2"><h3 class="font-bold">${item.name || item.type || 'Point'}</h3><p class="text-sm text-gray-600">${item.type || ''}</p></div>`;
      marker.bindPopup(content);
      marker.on('click', () => onItemClick && onItemClick(item));
      group.addLayer(marker);
    });

    layerRef.current = group;
    map.addLayer(group);

    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
        layerRef.current = null;
      }
    };
  }, [map, items, iconColor, popupRenderer, onItemClick]);

  return null;
}

const MapPage = () => {
    const { t } = useLanguage();
  const [hotels, setHotels] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [touristSpots, setTouristSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLayers, setShowLayers] = useState({
    hotels: true,
    emergency: true,
    spots: true
  });
  const [pois, setPois] = useState([]);
  const [showPOIs, setShowPOIs] = useState(false);
  const [weather, setWeather] = useState(null);
  const [showWeather, setShowWeather] = useState(false);

  const [touristPois, setTouristPois] = useState([]);
  const [showTouristPois, setShowTouristPois] = useState(false);

  useEffect(() => {
    fetchMapData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('📍 Location detected!');
        },
        (error) => {
          console.log('Location error:', error);
          setUserLocation({ lat: 27.7172, lng: 85.3240 });
        }
      );
    } else {
      setUserLocation({ lat: 27.7172, lng: 85.3240 });
    }
  };

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, emergencyRes, spotsRes] = await Promise.all([
        axiosInstance.get('/hotels'),
        axiosInstance.get('/emergency-contacts'),
        axiosInstance.get('/tourist-spots')
      ]);
      setHotels(hotelsRes.data);
      setEmergencyContacts(emergencyRes.data);
      setTouristSpots(spotsRes.data);
    } catch (error) {
      // Log detailed error for debugging
      console.error('Map fetch error:', error);
      const msg = error?.response?.data?.detail || error?.message || 'Unknown error';
      toast.error(`Failed to load map data: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPOIs = async (center) => {
    try {
      const res = await axiosInstance.get('/pois', { params: { lat: center.lat, lon: center.lng, radius: 2000, types: 'restaurant|hotel|cafe|bar|pub|atm|bank' } });
      setPois(res.data.slice(0, 300)); // limit to 300 markers
      toast.success(`Found ${res.data.length} nearby places`);
    } catch (err) {
      console.error('POI fetch error:', err);
      toast.error('Failed to fetch POIs');
    }
  };

  const fetchTouristPois = async ({ country, bbox } = {}) => {
    try {
      const params = {};
      if (country) params.country = country;
      if (bbox) params.bbox = bbox;
      params.limit = 2000;
      const res = await axiosInstance.get('/tourist-pois', { params });
      setTouristPois(res.data);
      toast.success(`Loaded ${res.data.length} tourist spots`);
    } catch (err) {
      console.error('Tourist POIs fetch error:', err);
      toast.error('Failed to load tourist spots');
    }
  };

  const fetchWeather = async (center) => {
    try {
      const res = await axiosInstance.get('/weather', { params: { lat: center.lat, lon: center.lng } });
      setWeather(res.data);
      if (res.data.alerts && res.data.alerts.length > 0) {
        toast.warn('Weather alerts present in this area');
      } else {
        toast.success('No weather alerts in this area');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to fetch weather';
      const shouldFallback = err?.response?.status === 400 || (msg && msg.toString().includes('OPENWEATHER_API_KEY'));
      if (shouldFallback) {
        toast('Using fallback weather (no alerts).');
        try {
          const fallback = await axiosInstance.get('/weather/fallback', { params: { lat: center.lat, lon: center.lng } });
          setWeather(fallback.data);
          toast.success('Loaded basic weather (fallback)');
        } catch (fbErr) {
          console.error('Fallback weather fetch error:', fbErr);
          toast.error('Failed to fetch fallback weather');
        }
        return;
      }
      toast.error(msg);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search in hotels
    hotels.forEach(hotel => {
      if (!hasValidCoords(hotel.latitude, hotel.longitude)) return;
      if (hotel.name.toLowerCase().includes(lowerQuery) || hotel.location.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: hotel.id,
          name: hotel.name,
          location: hotel.location,
          type: 'hotel',
          icon: '🏨',
          coordinates: { lat: hotel.latitude, lng: hotel.longitude }
        });
      }
    });

    // Search in tourist spots
    touristSpots.forEach(spot => {
      if (!hasValidCoords(spot.latitude, spot.longitude)) return;
      if (spot.name.toLowerCase().includes(lowerQuery) || spot.location.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: spot.id,
          name: spot.name,
          location: spot.location,
          type: 'spot',
          icon: '📍',
          coordinates: { lat: spot.latitude, lng: spot.longitude }
        });
      }
    });

    // Search in emergency contacts
    emergencyContacts.forEach(contact => {
      if (!hasValidCoords(contact.latitude, contact.longitude)) return;
      if (contact.name.toLowerCase().includes(lowerQuery) || contact.location.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: contact.id,
          name: contact.name,
          location: contact.location,
          type: 'emergency',
          icon: '🚨',
          coordinates: { lat: contact.latitude, lng: contact.longitude }
        });
      }
    });

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const handleSelectSearchResult = (result) => {
    if (!userLocation) {
      toast.error('Unable to detect your location');
      return;
    }
    setSelectedDestination({
      lat: result.coordinates.lat,
      lng: result.coordinates.lng,
      name: result.name
    });
    setRouteInfo(null);
    setShowSearchResults(false);
    setSearchQuery('');
    toast.success(`🧭 Finding route to ${result.name}`);
  };

  const handleGetDirections = (destination) => {
    if (!userLocation) {
      toast.error('Unable to detect your location');
      return;
    }
    setSelectedDestination(destination);
    setRouteInfo(null);
    toast.success('🧭 Calculating route...');
  };

  const clearRoute = () => {
    setSelectedDestination(null);
    setRouteInfo(null);
    toast.info('Route cleared');
  };

  if (loading || !userLocation) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">{t('loadingMap')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('preparingDestinations')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Search Bar */}
      <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-2xl shadow-2xl">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder={t('mapSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-base border-2 focus:border-blue-500 rounded-xl"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-3 hover:bg-blue-50 text-left flex items-center space-x-3 border-b last:border-b-0 transition"
                >
                  <span className="text-2xl">{result.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{result.name}</p>
                    <p className="text-sm text-gray-500">{result.location}</p>
                  </div>
                  <Navigation className="h-5 w-5 text-blue-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Map */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-bold text-lg mb-1">📍 {t('youAreHere')}</p>
                <p className="text-xs text-gray-500">{t('yourCurrentLocation')}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hotels */}
        {showLayers.hotels && hotels.filter((hotel) => hasValidCoords(hotel.latitude, hotel.longitude)).map((hotel) => (
          <Marker
            key={hotel.id}
            position={[hotel.latitude, hotel.longitude]}
            icon={hotelIcon}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <h3 className="font-bold text-lg mb-2 text-blue-900">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hotel.location}
                </p>
                <p className="text-blue-600 font-bold text-lg mb-3">${hotel.price_per_night}/{t('night')}</p>
                <Button
                  onClick={() => handleGetDirections({ lat: hotel.latitude, lng: hotel.longitude, name: hotel.name })}
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('getDirections')}
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency Contacts */}
        {showLayers.emergency && emergencyContacts.filter((contact) => hasValidCoords(contact.latitude, contact.longitude)).map((contact) => (
          <Marker
            key={contact.id}
            position={[contact.latitude, contact.longitude]}
            icon={emergencyIcon}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <h3 className="font-bold text-lg mb-2 text-red-900">{contact.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{contact.location}</p>
                <p className="text-red-600 font-bold mb-2 flex items-center">
                  📞 {contact.phone}
                </p>
                <p className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded mb-3 inline-block">{contact.category}</p>
                <Button
                  onClick={() => handleGetDirections({ lat: contact.latitude, lng: contact.longitude, name: contact.name })}
                  size="sm"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 h-10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tourist Spots */}
        {showLayers.spots && touristSpots.filter((spot) => hasValidCoords(spot.latitude, spot.longitude)).map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={spotIcon}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <h3 className="font-bold text-lg mb-2 text-green-900">{spot.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
                <p className="text-sm text-yellow-600 mb-3 flex items-center">
                  ⭐ {t('rating')}: {spot.rating}/5
                </p>
                <Button
                  onClick={() => handleGetDirections({ lat: spot.latitude, lng: spot.longitude, name: spot.name })}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routing */}
        {selectedDestination && userLocation && (
          <RoutingMachine
            start={userLocation}
            end={selectedDestination}
            onRouteFound={setRouteInfo}
          />
        )}

        {/* POIs (clustered) */}
        {showPOIs && pois.length > 0 && (
          <MarkerCluster
            items={pois}
            iconColor="#f97316"
            popupRenderer={(p) => `<div class="min-w-[200px] p-2"><h3 class="font-bold text-lg mb-1">${p.name || 'POI'}</h3><p class="text-sm text-gray-600 mb-2">${p.type || ''}</p><button style="width:100%;background:linear-gradient(90deg,#6366f1,#4f46e5);color:white;padding:8px;border-radius:6px;border:none;">Get Directions</button></div>`}
            onItemClick={(p) => handleGetDirections({ lat: p.latitude, lng: p.longitude, name: p.name })}
          />
        )}

        {/* Tourist POIs (clustered) */}
        {showTouristPois && touristPois.length > 0 && (
          <MarkerCluster
            items={touristPois}
            iconColor="#10b981"
            popupRenderer={(p) => `<div class="min-w-[200px] p-2"><h3 class="font-bold">${p.name || 'Tourist Spot'}</h3><p class="text-sm text-gray-600">${p.type || ''}</p></div>`}
            onItemClick={(p) => handleGetDirections({ lat: p.latitude, lng: p.longitude, name: p.name })}
          />
        )}

        {/* Weather marker */}
        {showWeather && weather && hasValidCoords(weather.lat, weather.lon) && (
          <Marker position={[weather.lat, weather.lon]} icon={createCustomIcon('#f59e0b', '<path d="M12 2l2 4 4 .5-3 3 .7 4-3.7-1.8L8 19l.7-4L6 12l4-.5z"></path>')}>
            <Popup>
              <div className="min-w-[220px] p-2">
                <h3 className="font-bold text-lg mb-1">Weather</h3>
                <p className="text-sm text-gray-600 mb-2">Temp: {weather.current.temp}°C • Humidity: {weather.current.humidity}%</p>
                {weather.alerts && weather.alerts.length > 0 && (
                  <div className="bg-red-50 text-red-700 p-2 rounded">
                    <strong>Alerts:</strong>
                    <ul className="mt-2 list-disc ml-5 text-sm">
                      {weather.alerts.map((a, idx) => (
                        <li key={idx}>{a.event}: {a.description?.slice(0, 150)}{a.description && a.description.length > 150 ? '...' : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Map Controls (search POIs / weather at map center) */}
        <MapControls
          onFindPois={(center) => { fetchPOIs(center); setShowPOIs(true); }}
          onFindWeather={(center) => { fetchWeather(center); setShowWeather(true); }}
          onFindTourist={(opts) => { fetchTouristPois(opts); setShowTouristPois(true); }}
        />
      </MapContainer>

      {/* Layer Controls */}
      <Card className="absolute top-24 right-4 z-[1000] shadow-2xl">
        <div className="p-4">
          <h3 className="font-bold mb-3 text-base text-gray-900">{t('mapLayers')}</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={showLayers.hotels}
                onChange={() => setShowLayers({ ...showLayers, hotels: !showLayers.hotels })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <Hotel className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{t('hotels')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={showLayers.emergency}
                onChange={() => setShowLayers({ ...showLayers, emergency: !showLayers.emergency })}
                className="w-5 h-5 text-red-600 rounded"
              />
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">{t('emergency')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={showLayers.spots}
                onChange={() => {
                  const newVal = !showLayers.spots;
                  setShowLayers({ ...showLayers, spots: newVal });
                  if (newVal) {
                    if (touristPois.length === 0) fetchTouristPois({ country: 'Nepal' });
                    setShowTouristPois(true);
                  } else {
                    setShowTouristPois(false);
                  }
                }}
                className="w-5 h-5 text-green-600 rounded"
              />
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{t('touristSpots')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={showPOIs}
                onChange={() => { if (!showPOIs) { fetchPOIs({ lat: userLocation.lat, lng: userLocation.lng }); } setShowPOIs(!showPOIs); }}
                className="w-5 h-5 text-indigo-600 rounded"
              />
              <MapPin className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">{t('nearbyPOIs')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={showWeather}
                onChange={() => { if (!showWeather) { fetchWeather({ lat: userLocation.lat, lng: userLocation.lng }); } setShowWeather(!showWeather); }}
                className="w-5 h-5 text-yellow-600 rounded"
              />
              <MapPin className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">{t('weatherAlerts')}</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Route Info Card */}
      {routeInfo && selectedDestination && (
        <Card className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] shadow-2xl bg-white border-4 border-blue-500 min-w-[400px] animate-slideUp">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">🧭 {t('routeTo')} {selectedDestination.name}</h3>
                <p className="text-sm text-gray-500">{t('followBluePath')}</p>
              </div>
              <button onClick={clearRoute} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border-2 border-blue-200">
                <p className="text-xs text-blue-700 font-semibold mb-1">{t('distance').toUpperCase()}</p>
                <p className="text-3xl font-bold text-blue-600">{routeInfo.distance}</p>
                <p className="text-sm text-blue-700 mt-1">{t('kilometers')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border-2 border-green-200">
                <p className="text-xs text-green-700 font-semibold mb-1">{t('estTime').toUpperCase()}</p>
                <p className="text-3xl font-bold text-green-600">{routeInfo.duration}</p>
                <p className="text-sm text-green-700 mt-1">{t('minutes')}</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-600 text-center">
                🚗 {t('basedOnDrivingSpeed')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-6 right-4 z-[1000] shadow-2xl">
        <div className="p-4">
          <h3 className="font-bold mb-3 text-base text-gray-900">{t('legend')}</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow"></div>
              <span className="text-sm font-medium">{t('hotels')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow"></div>
              <span className="text-sm font-medium">{t('emergency')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-white shadow"></div>
              <span className="text-sm font-medium">{t('touristSpots')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-purple-600 border-2 border-white shadow"></div>
              <span className="text-sm font-medium">{t('yourLocation')}</span>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MapPage;