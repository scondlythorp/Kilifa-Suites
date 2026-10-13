import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

type AuthMode = 'login' | 'forgot' | 'reset';

export const AdminLoginPage: React.FC = () => {
  const { login, requestPasswordReset, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 2. Handle Request Reset Token
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const email = forgotEmail.trim();
    if (!email) {
      setError('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await requestPasswordReset(email);
      setSuccess(`${msg} If you received a reset token, enter it below.`);
      setMode('reset');
    } catch (err) {
      setError((err as Error).message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Execute Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resetToken.trim()) {
      setError('Please enter your password reset token.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await resetPassword(resetToken.trim(), newPassword.trim());
      setSuccess(`${msg} You can now sign in with your new password.`);
      setMode('login');
      setLoginIdentifier(forgotEmail.trim());
      setLoginPassword('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password.');
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
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Kilifa Suites
            </h1>
            <p className="text-xs text-[#C5A059] uppercase tracking-widest font-mono mt-1">
              Management Portal
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          <span>Authorized Personnel Only</span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 1: SIGN IN FORM */}
        {/* ============================================================ */}
        {mode === 'login' && (
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
                  placeholder="admin@kilifasuites.gm or username"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                  autoComplete="username"
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
                  autoComplete="current-password"
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
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 pt-3 mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 2: FORGOT PASSWORD (REQUEST RESET) */}
        {/* ============================================================ */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@kilifasuites.gm"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-white/40 mt-1.5">
                Enter your administrative email address to receive password reset instructions.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending Request...' : 'Send Reset Link / Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError(null);
                }}
                className="text-[#C5A059] hover:underline"
              >
                Already have a reset token?
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-white/50 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 3: RESET PASSWORD WITH TOKEN */}
        {/* ============================================================ */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Password Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter 64-character reset token"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
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
              className="w-full py-3 px-6 rounded-xl bg-[#C5A059] text-black font-semibold hover:bg-[#D4AF37] transition-all text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20 mt-3 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Updating Password...' : 'Reset Password & Return to Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-white/50 hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
