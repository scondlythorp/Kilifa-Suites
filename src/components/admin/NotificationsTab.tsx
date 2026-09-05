import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import {
  BellRing,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<string>('BOOKING_CONFIRMED');
  const [selectedChannels, setSelectedChannels] = useState<{ email: boolean; whatsapp: boolean; sms: boolean }>({
    email: true,
    whatsapp: true,
    sms: false,
  });

  const [formRecipient, setFormRecipient] = useState({
    name: 'Fatou Ceesay',
    email: 'fatou.ceesay@example.com',
    phone: '+2207001020',
    bookingRef: 'KS-910234',
    suiteName: 'Ambassador Executive Suite 2',
    checkIn: '2026-08-15',
    checkOut: '2026-08-18',
    amount: '300',
    accessPin: '7821',
  });

  const loadNotificationData = async () => {
    setIsLoading(true);
    try {
      const [provRes, histRes] = await Promise.all([
        api.notifications.getProvidersStatus().catch(() => ({ data: [] })),
        api.notifications.getHistory(50).catch(() => ({ data: [] })),
      ]);

      if (provRes?.data) setProviders(provRes.data);
      if (histRes?.data) setHistory(histRes.data);
    } catch (err) {
      console.warn('[NOTIFICATIONS TAB] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationData();
  }, []);

  const handleToggleChannel = (channel: 'email' | 'whatsapp' | 'sms') => {
    setSelectedChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setFeedback(null);

    const channelsToUse: string[] = [];
    if (selectedChannels.email) channelsToUse.push('EMAIL');
    if (selectedChannels.whatsapp) channelsToUse.push('WHATSAPP');
    if (selectedChannels.sms) channelsToUse.push('SMS');

    if (channelsToUse.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one delivery channel (Email, WhatsApp, or SMS).' });
      setIsSending(false);
      return;
    }

    try {
      const payload = {
        type: selectedType,
        channels: channelsToUse,
        recipient: {
          name: formRecipient.name,
          email: formRecipient.email,
          phone: formRecipient.phone,
        },
        bookingReference: formRecipient.bookingRef,
        suiteName: formRecipient.suiteName,
        checkInDate: formRecipient.checkIn,
        checkOutDate: formRecipient.checkOut,
        amount: parseFloat(formRecipient.amount) || 0,
        accessPin: formRecipient.accessPin,
      };

      const res = await api.notifications.send(payload);
      setFeedback({
        type: 'success',
        message: `Notification dispatched successfully across ${res.data?.length || 1} channel(s)!`,
      });
      await loadNotificationData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: (err as Error).message || 'Failed to dispatch notification.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'SMS':
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      default:
        return <BellRing className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">
              Multi-Provider Notification System
            </h2>
            <p className="text-xs text-white/60 font-mono mt-0.5">
              Provider Abstraction Layer &bull; Email, WhatsApp, SMS Dispatches &bull; Real-Time Audit Logs
            </p>
          </div>
        </div>

        <button
          onClick={loadNotificationData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh System</span>
        </button>
      </div>

      {/* Provider Abstraction Health Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-serif font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            Registered Channel Providers
          </h3>
          <span className="text-[10px] font-mono text-white/40">Clean Fallback Architecture Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div
              key={p.providerName}
              className="p-5 rounded-2xl bg-[#0B101D] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(p.channel)}
                    <span className="text-xs font-mono font-bold text-white uppercase">{p.channel} Provider</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-semibold ${
                      p.configured
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {p.configured ? 'LIVE API' : 'SIMULATED / LOCAL'}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white/90 mb-1">{p.providerName}</h4>
                <p className="text-xs text-white/50 leading-relaxed font-mono">{p.statusText}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Abstraction: INotificationProvider</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Notification Dispatcher & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Test Notification Sender */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C5A059]" />
              Trigger Notification Dispatch
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Test multi-channel notifications across Email, WhatsApp, and SMS templates.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSendTestNotification} className="space-y-4 text-xs">
            {/* Notification Type Selector */}
            <div>
              <label className="block text-white/70 font-medium mb-1.5">Notification Event Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="BOOKING_RECEIVED" className="bg-[#0B101D]">Booking Received (BOOKING_RECEIVED)</option>
                <option value="BOOKING_CONFIRMED" className="bg-[#0B101D]">Booking Confirmed (BOOKING_CONFIRMED)</option>
                <option value="PAYMENT_RECEIVED" className="bg-[#0B101D]">Payment Received (PAYMENT_RECEIVED)</option>
                <option value="CHECK_IN_REMINDER" className="bg-[#0B101D]">Check-in Reminder (CHECK_IN_REMINDER)</option>
                <option value="CHECK_OUT_REMINDER" className="bg-[#0B101D]">Check-out Reminder (CHECK_OUT_REMINDER)</option>
                <option value="BOOKING_CANCELLATION" className="bg-[#0B101D]">Booking Cancellation (BOOKING_CANCELLATION)</option>
                <option value="ACCESS_CARD_INFO" className="bg-[#0B101D]">Access Card Info (ACCESS_CARD_INFO)</option>
              </select>
            </div>

            {/* Delivery Channels Checklist */}
            <div>
              <label className="block text-white/70 font-medium mb-1.5">Target Delivery Channels</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleChannel('email')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all font-mono text-[11px] ${
                    selectedChannels.email
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChannel('whatsapp')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all font-mono text-[11px] ${
                    selectedChannels.whatsapp
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChannel('sms')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all font-mono text-[11px] ${
                    selectedChannels.sms
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> SMS
                </button>
              </div>
            </div>

            {/* Recipient Details Fields */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-white/50 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  value={formRecipient.name}
                  onChange={(e) => setFormRecipient({ ...formRecipient, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">Booking Ref</label>
                <input
                  type="text"
                  value={formRecipient.bookingRef}
                  onChange={(e) => setFormRecipient({ ...formRecipient, bookingRef: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={formRecipient.email}
                  onChange={(e) => setFormRecipient({ ...formRecipient, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">Recipient Phone</label>
                <input
                  type="text"
                  value={formRecipient.phone}
                  onChange={(e) => setFormRecipient({ ...formRecipient, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-white/50 mb-1">Suite Name</label>
                <input
                  type="text"
                  value={formRecipient.suiteName}
                  onChange={(e) => setFormRecipient({ ...formRecipient, suiteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5A059]/20"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Notification Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Audit Dispatch History Log */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B101D] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059]" />
                Dispatch Audit History
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Real-time log of sent and simulated notification payloads across all channels.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-mono bg-white/5 border border-white/10 rounded-full text-white/60">
              {history.length} Logged
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs font-mono">
                No notification audit logs found.
              </div>
            ) : (
              history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-xs font-mono space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(log.channel)}
                      <span className="font-bold text-white uppercase">{log.channel}</span>
                      <span className="text-white/40">&bull;</span>
                      <span className="text-[#C5A059] font-bold">{log.type}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        log.status === 'SENT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'SIMULATED'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="text-white/80 line-clamp-2 text-[11px] font-sans leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5">
                    {log.bodyPreview}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                    <span>To: {log.recipient}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
