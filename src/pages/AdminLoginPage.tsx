import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserPlus, KeyRound, User } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const AdminLoginPage: React.FC = () => {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('System Administrator');
  const [username, setUsername] = useState('kilifasuites');
  const [email, setEmail] = useState('modoulaminthorp4@gmail.com');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ONLY allow System Admin role
  const fillAdminAccount = () => {
    setIdentifier('modoulaminthorp4@gmail.com');
    setPassword('Scondly7210@');
    setError(null);
    setSuccess(null);
  };

  const fillAdminByUsername = () => {
    setIdentifier('kilifasuites');
    setPassword('Scondly7210@');
    setError(null);
    setSuccess(null);
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide your email/username and password.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await login(identifier.trim(), password.trim());
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

    if (!email.trim() || !password.trim()) {
      setError('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim() || 'System Administrator',
        email: email.trim(),
        username: username.trim() || 'kilifasuites',
        password: password.trim(),
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

    const targetEmail = identifier.trim() || email.trim();
    if (!targetEmail) {
      setError('Please enter your account email address or username.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your new password.');
      return;
    }

    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      const msg = await forgotPassword({
        email: targetEmail,
        newPassword: password.trim(),
      });
      setSuccess(msg || 'Password updated successfully! You can now log in.');
      setMode('login');
      setIdentifier(targetEmail);
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0E1525] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-7 animate-fadeIn">
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
              Management Portal {mode === 'register' ? '• Create Account' : mode === 'forgot' ? '• Password Reset' : 'Login'}
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
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 animate-fadeIn">
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 pt-3 mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ONLY ROLE ALLOWED: SYSTEM ADMIN */}
            <div className="pt-5 border-t border-white/10 space-y-3">
              <div className="text-[11px] font-mono text-white/50 text-center uppercase tracking-wider">
                Quick Select Role Account
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillAdminAccount}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-[#C5A059]/15 hover:border-[#C5A059]/50 border border-[#C5A059]/30 transition-all flex items-center justify-between group text-left"
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
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C5A059] text-black uppercase">
                    ADMIN
                  </span>
                </button>

                <div className="flex justify-between items-center text-[11px] text-white/40 pt-1 px-1 font-mono">
                  <span>Username: <strong className="text-white/70">kilifasuites</strong></span>
                  <button
                    type="button"
                    onClick={fillAdminByUsername}
                    className="text-[#C5A059] hover:underline"
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="modoulaminthorp4@gmail.com"
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kilifasuites"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Scondly7210@"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 mt-3"
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
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="modoulaminthorp4@gmail.com or kilifasuites"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (e.g. Scondly7210@)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 mt-3"
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
