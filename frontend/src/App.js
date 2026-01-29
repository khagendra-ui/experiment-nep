import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "@/pages/HomePage";
import HotelsPage from "@/pages/HotelsPage";
import PermitsPage from "@/pages/PermitsPage";
import MapPage from "@/pages/MapPage";
import SafetyPage from "@/pages/SafetyPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPermits from "@/pages/AdminPermits";
import AdminBookings from "@/pages/AdminBookings";
import AdminPermitTypes from "@/pages/AdminPermitTypes";
import HotelOwnerDashboard from "@/pages/HotelOwnerDashboard";
import AddHotelPage from "@/pages/AddHotelPage";
import ManageHotelsPage from "@/pages/ManageHotelsPage";
import HotelOwnerBookingsPage from "@/pages/HotelOwnerBookingsPage";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import SOSButton from "@/components/SOSButton";
import Chatbot from "@/components/Chatbot";
import CookieConsent from "@/components/CookieConsent";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
export const API = `${BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: API,
});

// Add auth interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed data on first load
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed-data`);
      } catch (error) {
        console.error('Error seeding data:', error);
      }
    };
    seedData();

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Navbar user={user} onLogout={handleLogout} onShowAuth={() => setShowAuth(true)} />
          <Routes>
            <Route path="/" element={<HomePage user={user} onShowAuth={() => setShowAuth(true)} />} />
            <Route path="/hotels" element={<HotelsPage user={user} />} />
            <Route path="/permits" element={user ? <PermitsPage user={user} /> : <Navigate to="/" />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/" />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/permits" element={user?.role === 'admin' ? <AdminPermits /> : <Navigate to="/" />} />
            <Route path="/admin/bookings" element={user?.role === 'admin' ? <AdminBookings /> : <Navigate to="/" />} />
            <Route path="/admin/permit-types" element={user?.role === 'admin' ? <AdminPermitTypes /> : <Navigate to="/" />} />
            
            {/* Hotel Owner Routes */}
            <Route path="/hotel-owner" element={user?.role === 'hotel_owner' ? <HotelOwnerDashboard /> : <Navigate to="/" />} />
            <Route path="/hotel-owner/add-hotel" element={user?.role === 'hotel_owner' ? <AddHotelPage /> : <Navigate to="/" />} />
            <Route path="/hotel-owner/hotels" element={user?.role === 'hotel_owner' ? <ManageHotelsPage /> : <Navigate to="/" />} />
            <Route path="/hotel-owner/bookings" element={user?.role === 'hotel_owner' ? <HotelOwnerBookingsPage /> : <Navigate to="/" />} />
          </Routes>
          
          {/* Global Components */}
          <SOSButton />
          <Chatbot />
        </BrowserRouter>
        <AuthModal 
          open={showAuth} 
          onClose={() => setShowAuth(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowAuth(false);
          }}
        />
        <Toaster position="top-right" />
        <CookieConsent />
      </div>
    </LanguageProvider>
  );
}

export default App;