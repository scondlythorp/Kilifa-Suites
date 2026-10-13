import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const AdminLoginPage: React.FC = () => {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('modoulaminthorp4@gmail.com');
  const [loginPassword, setLoginPassword] = useState('Scondly7210@');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Create Account State
  const [regName, setRegName] = useState('System Administrator');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('modoulaminthorp4@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill default system admin credentials
  const fillAdminByEmail = () => {
    setLoginIdentifier('modoulaminthorp4@gmail.com');
    setLoginPassword('Scondly7210@');
    setError(null);
    setSuccess(null);
  };

  const fillAdminByUsername = () => {
    setLoginIdentifier('kilifasuites');
    setLoginPassword('Scondly7210@');
    setError(null);
    setSuccess(null);
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please provide your email/username and password.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await login(loginIdentifier.trim(), loginPassword.trim());
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Create Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regEmail.trim() || !regPassword.trim()) {
      setError('Please provide an email address and password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: regName.trim() || 'System Administrator',
        email: regEmail.trim(),
        username: regUsername.trim() || regEmail.split('@')[0],
        password: regPassword.trim(),
      });
      setSuccess('System Admin account created successfully! Signing you in...');
    } catch (err) {
      setError((err as Error).message || 'Failed to create account.');
      setIsSubmitting(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const target = forgotIdentifier.trim();
    if (!target) {
      setError('Please enter your account email address or username.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const msg = await forgotPassword({
        email: target,
        newPassword: newPassword.trim(),
      });
      setSuccess(`${msg} You can now sign in with your new password.`);
      // Switch back to login mode with the new password pre-filled
      setMode('login');
      setLoginIdentifier(target);
      setLoginPassword(newPassword.trim());
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0E1525] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto shadow-lg shadow-[#C5A059]/10">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white font-bold tracking-wide">
              KILIFA SUITES
            </h1>
            <p className="text-xs font-mono text-[#C5A059] uppercase tracking-widest mt-1">
              Management Portal {mode === 'register' ? '• Create Account' : mode === 'forgot' ? '• Reset Password' : 'Login'}
            </p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex rounded-xl bg-black/40 border border-white/10 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'login'
                ? 'bg-[#C5A059] text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'register'
                ? 'bg-[#C5A059] text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
              mode === 'forgot'
                ? 'bg-[#C5A059] text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 1: SIGN IN FORM */}
        {/* ============================================================ */}
        {mode === 'login' && (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. modoulaminthorp4@gmail.com or kilifasuites"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-white/70">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] text-[#C5A059] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 pt-3 mt-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* DEFAULT CREDENTIALS QUICK SELECT */}
            <div className="pt-5 border-t border-white/10 space-y-3">
              <div className="text-[11px] font-mono text-white/50 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Default System Admin Credentials</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillAdminByEmail}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-[#C5A059]/15 hover:border-[#C5A059]/50 border border-[#C5A059]/30 transition-all flex items-center justify-between group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#C5A059]">
                        System Admin
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        modoulaminthorp4@gmail.com
                      </div>
                      <div className="text-[10px] text-[#C5A059]/80 font-mono mt-0.5">
                        Password: <strong>Scondly7210@</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C5A059] text-black uppercase">
                    AUTO-FILL
                  </span>
                </button>

                <div className="flex justify-between items-center text-[11px] text-white/50 pt-1 px-1 font-mono">
                  <span>Username: <strong className="text-white/80">kilifasuites</strong></span>
                  <button
                    type="button"
                    onClick={fillAdminByUsername}
                    className="text-[#C5A059] hover:underline cursor-pointer"
                  >
                    Fill by username →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* MODE 2: CREATE ACCOUNT FORM */}
        {/* ============================================================ */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="System Administrator"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. admin@kilifasuites.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <UserPlus className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. kilifasuites_admin"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-3 text-white/40 hover:text-white"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 mt-3 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 3: FORGOT PASSWORD FORM */}
        {/* ============================================================ */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Account Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="modoulaminthorp4@gmail.com or kilifasuites"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (e.g. Scondly7210@)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-white/40 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 mt-3 cursor-pointer"
            >
              <span>{isSubmitting ? 'Updating Password...' : 'Reset Password & Return to Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
