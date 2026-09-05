import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = [
    { name: 'Alhaji Kilifa', role: 'OWNER', email: 'owner@kilifasuites.com' },
    { name: 'System Admin', role: 'ADMIN', email: 'admin@kilifasuites.com' },
    { name: 'Front Desk', role: 'RECEPTIONIST', email: 'receptionist@kilifasuites.com' },
    { name: 'Staff Member', role: 'STAFF', email: 'staff@kilifasuites.com' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('KilifaPass2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0E1525] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8 animate-fadeIn">
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
              Management Portal Login
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-white/70 mb-1.5">
              Email Address, Username, or Account Name
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@kilifasuites.com, admin, or Alhaji Kilifa"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#C5A059] focus:outline-none transition-all"
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

        {/* One-Click Quick Demo Credentials */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="text-[11px] font-mono text-white/50 text-center uppercase tracking-wider">
            Quick Select Role Account
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemoAccount(acc.email)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-[#C5A059]/20 hover:border-[#C5A059]/40 border border-white/10 transition-all text-left group"
              >
                <div className="text-xs font-medium text-white group-hover:text-[#C5A059] truncate">
                  {acc.name}
                </div>
                <div className="text-[10px] font-mono text-white/40 uppercase">{acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
