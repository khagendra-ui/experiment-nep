import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/App';
import { Lock, Mail, User, Building2, Mountain, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

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

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // email, code, success
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      localStorage.setItem('token', response.data.token);
      if (response.data.verification_required) {
        setVerificationRequired(true);
        setVerificationEmail(response.data.user.email);
        toast.info('Email verification required. Please check your email.');
        return;
      }
      toast.success('Welcome back!');
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
        toast.info('Account created! Please verify your email.');
        return;
      }
      toast.success('Account created successfully!');
      onSuccess(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      await axios.post(`${API}/auth/verify-email`, { email: verificationEmail, code: verificationCodeInput });
      toast.success('Email verified!');
      const token = localStorage.getItem('token');
      if (token) {
        const me = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        onSuccess(me.data);
      }
      setVerificationRequired(false);
      setVerificationCodeInput('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await axios.post(`${API}/auth/resend-verification`, { email: verificationEmail });
      toast.success('Verification code resent');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      toast.success('Reset code sent to your email');
      setForgotPasswordStep('code');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { 
        email: forgotEmail, 
        code: resetCode, 
        new_password: newPassword 
      });
      toast.success('Password reset successfully!');
      setForgotPasswordStep('success');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotEmail('');
    setResetCode('');
    setNewPassword('');
  };

  const handleClose = () => {
    setVerificationRequired(false);
    setVerificationCodeInput('');
    resetForgotPassword();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden" data-testid="auth-modal">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-nepal-blue-500 to-nepal-blue-600 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Mountain className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-heading font-semibold text-white">
            {showForgotPassword ? 'Reset Password' : verificationRequired ? 'Verify Email' : 'Welcome to NepSafe'}
          </DialogTitle>
          <DialogDescription className="text-white/70 mt-1">
            {showForgotPassword 
              ? 'Enter your email to receive a reset code' 
              : verificationRequired 
                ? 'Enter the code sent to your email'
                : 'Your journey to Nepal starts here'}
          </DialogDescription>
        </div>

        <div className="p-6">
          {/* Forgot Password Flow */}
          {showForgotPassword ? (
            <div className="space-y-4">
              {forgotPasswordStep === 'email' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="forgot-email-input"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleForgotPassword}
                    disabled={resetLoading || !forgotEmail}
                    className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600"
                    data-testid="send-reset-code-btn"
                  >
                    {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Code'}
                  </Button>
                </>
              )}

              {forgotPasswordStep === 'code' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Reset Code</Label>
                    <Input
                      placeholder="Enter 6-digit code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="h-12 rounded-xl text-center text-lg tracking-widest"
                      maxLength={6}
                      data-testid="reset-code-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="new-password-input"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    disabled={resetLoading || !resetCode || !newPassword}
                    className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600"
                    data-testid="reset-password-btn"
                  >
                    {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                  </Button>
                </>
              )}

              {forgotPasswordStep === 'success' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Password Reset!</h3>
                  <p className="text-slate-500 text-sm mb-4">You can now login with your new password.</p>
                  <Button
                    onClick={resetForgotPassword}
                    className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600"
                  >
                    Back to Login
                  </Button>
                </div>
              )}

              {forgotPasswordStep !== 'success' && (
                <button
                  onClick={resetForgotPassword}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-nepal-blue-500 mx-auto mt-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>
              )}
            </div>
          ) : verificationRequired ? (
            /* Email Verification */
            <div className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                We sent a 6-digit code to <strong>{verificationEmail}</strong>
              </p>
              <Input
                placeholder="Enter verification code"
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value)}
                className="h-14 rounded-xl text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                data-testid="verification-code-input"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyEmail}
                  disabled={verifying || verificationCodeInput.length !== 6}
                  className="flex-1 h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600"
                  data-testid="verify-btn"
                >
                  {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="flex-1 h-12 rounded-full"
                  data-testid="resend-btn"
                >
                  {resending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Resend'}
                </Button>
              </div>
            </div>
          ) : (
            /* Login / Register Tabs */
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="login" data-testid="login-tab" className="rounded-lg font-semibold">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab" className="rounded-lg font-semibold">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" data-testid="login-form">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="login-email-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="login-password-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-nepal-blue-500 hover:underline"
                      data-testid="forgot-password-link"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
                    data-testid="login-submit-button"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" data-testid="register-form">
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="register-name-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="register-email-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-11 h-12 rounded-xl"
                        data-testid="register-password-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Register As</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl" data-testid="register-role-select">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Tourist / Traveler</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hotel_owner">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Hotel Owner</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-nepal-blue-500 hover:bg-nepal-blue-600 font-semibold"
                    data-testid="register-submit-button"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
