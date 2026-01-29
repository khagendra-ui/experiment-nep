import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/App';
import { Lock, Mail, User, Building2 } from 'lucide-react';

const AuthModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: 'user' });

  // Verification flow state
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      localStorage.setItem('token', response.data.token);
      if (response.data.verification_required) {
        setVerificationRequired(true);
        setVerificationEmail(response.data.user.email);
        toast('🔒 Email verification required — check your email or use Resend');
        return;
      }
      toast.success('✅ Welcome back!');
      onSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      localStorage.setItem('token', response.data.token);
      if (response.data.verification_required) {
        setVerificationRequired(true);
        setVerificationEmail(response.data.user.email);
        toast('🔒 Account created — please verify your email');
        return;
      }
      toast.success('🎉 Account created successfully!');
      onSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2" data-testid="auth-modal">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Welcome to NepSafe
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">Your journey starts here</p>
        </DialogHeader>
        {verificationRequired ? (
          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold text-center">Email verification required</h3>
            <p className="text-sm text-center text-gray-600 mt-2">We sent a 6-digit code to <strong>{verificationEmail}</strong>. Enter it below to continue.</p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-base font-semibold">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value)}
                  className="h-12 text-base border-2"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  className="flex-1"
                  onClick={async () => {
                    setVerifying(true);
                    try {
                      await axios.post(`${API}/auth/verify-email`, { email: verificationEmail, code: verificationCodeInput });
                      toast.success('✅ Email verified!');
                      // fetch updated user
                      const me = await axios.get(`${API}/auth/me`);
                      onSuccess(me.data);
                      setVerificationRequired(false);
                      setVerificationCodeInput('');
                    } catch (err) {
                      toast.error(err.response?.data?.detail || 'Verification failed');
                    } finally {
                      setVerifying(false);
                    }
                  }}
                  disabled={verifying || !verificationCodeInput}
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    setResending(true);
                    try {
                      await axios.post(`${API}/auth/resend-verification`, { email: verificationEmail });
                      toast('🔁 Verification code resent');
                    } catch (err) {
                      toast.error(err.response?.data?.detail || 'Resend failed');
                    } finally {
                      setResending(false);
                    }
                  }}
                  disabled={resending}
                >
                  {resending ? 'Resending...' : 'Resend'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="login" data-testid="login-tab" className="text-base font-semibold">Login</TabsTrigger>
            <TabsTrigger value="register" data-testid="register-tab" className="text-base font-semibold">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" data-testid="login-form">
            <form onSubmit={handleLogin} className="space-y-5 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-base font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-11 h-12 text-base border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-base font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-11 h-12 text-base border-2"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                data-testid="login-submit-button"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" data-testid="register-form">
            <form onSubmit={handleRegister} className="space-y-5 mt-6">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-base font-semibold">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    type="text"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="pl-11 h-12 text-base border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-base font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="pl-11 h-12 text-base border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-base font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pl-11 h-12 text-base border-2"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-role" className="text-base font-semibold">Register As</Label>
                <Select 
                  value={registerData.role} 
                  onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                >
                  <SelectTrigger className="h-12 text-base border-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Tourist / Traveler</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hotel_owner">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>Hotel Owner / Business</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {registerData.role === 'user' 
                    ? 'Book hotels, apply for permits, and access tourist services' 
                    : 'Register and manage your hotel properties'}
                </p>
              </div>
              <Button
                type="submit"
                data-testid="register-submit-button"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;