import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import {
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  Cpu,
  Wifi,
  Radio,
  Server,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  UserCheck,
  UserMinus,
  FileCode2,
} from 'lucide-react';

export const AccessControlTab: React.FC = () => {
  const [hardwareSpec, setHardwareSpec] = useState<any | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [doorLogs, setDoorLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-demo-102');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchAccessData = async () => {
    setIsLoading(true);
    try {
      const [specRes, cardsRes, logsRes] = await Promise.all([
        api.access.getHardwareSpec().catch(() => ({ data: null })),
        api.access.getAllCards().catch(() => ({ data: [] })),
        api.access.getLogs().catch(() => ({ data: [] })),
      ]);

      if (specRes?.data) setHardwareSpec(specRes.data);
      if (cardsRes?.data) setCards(cardsRes.data);
      if (logsRes?.data) setDoorLogs(logsRes.data);
    } catch (err) {
      console.warn('[ACCESS TAB] Error loading access control data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessData();
  }, []);

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4500);
  };

  const handleActivateCard = async (cardId: string) => {
    setIsProcessing(true);
    try {
      await api.access.activateCard(cardId);
      notify(`Access card '${cardId}' successfully ACTIVATED in lock controller.`);
      await fetchAccessData();
    } catch (err: any) {
      alert(err.message || 'Failed to activate card');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async (cardId: string) => {
    setIsProcessing(true);
    try {
      const res = await api.access.processCheckIn(cardId);
      notify(`Guest Check-in executed for '${cardId}'. Suite door unlatched!`);
      await fetchAccessData();
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async (cardId: string) => {
    setIsProcessing(true);
    try {
      await api.access.processCheckOut(cardId);
      notify(`Guest Checkout executed for '${cardId}'. Card expired in hardware memory.`);
      await fetchAccessData();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async (cardId: string) => {
    if (!confirm(`Are you sure you want to forcibly REVOKE access card '${cardId}'?`)) return;
    setIsProcessing(true);
    try {
      await api.access.revokeCard(cardId, 'Security admin manual lockout');
      notify(`Access card '${cardId}' REVOKED.`);
      await fetchAccessData();
    } catch (err: any) {
      alert(err.message || 'Revoke failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateDoorTap = async (cardId: string) => {
    setIsProcessing(true);
    try {
      const logRes = await api.access.simulateEntry({ cardId });
      const log = logRes.data || logRes;
      notify(
        log.accessGranted
          ? `[LOCK READER TAP] GRANTED: Unlatched solenoid for 5s.`
          : `[LOCK READER TAP] DENIED: Access card is inactive/expired.`
      );
      await fetchAccessData();
    } catch (err: any) {
      alert(err.message || 'Door tap simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B101D] p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">
              Electronic Guest Access & Lock Integration
            </h2>
          </div>
          <p className="text-xs text-white/60 font-sans mt-1">
            SALTO Systems / Dormakaba Hardware Abstraction Layer & RFID/BLE Card Lifecycle Software Engine
          </p>
        </div>

        <button
          onClick={fetchAccessData}
          disabled={isLoading}
          className="px-4 py-2 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Lock Mesh
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Hardware Integration Specifications Documentation */}
      <div className="bg-[#0B101D] p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <Cpu className="w-5 h-5" />
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
              Access-Control Hardware & Software Architecture
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
            GATEWAY ONLINE (TCP/IP)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Lock Manufacturer</span>
            <span className="text-xs font-bold text-white block">
              {hardwareSpec?.lockManufacturer || 'SALTO Systems / Dormakaba'}
            </span>
            <span className="text-[10px] text-[#C5A059] font-mono block">Hardware Partner</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Hardware Model</span>
            <span className="text-xs font-bold text-white block">
              {hardwareSpec?.hardwareModel || 'XS4 Original Escutcheon & Gate Lock'}
            </span>
            <span className="text-[10px] text-white/60 font-mono block">RFID + Solenoid Latch</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Card Technology</span>
            <span className="text-xs font-bold text-white block">
              {hardwareSpec?.cardTechnology || 'RFID MIFARE DESFire EV2 + NFC / BLE'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block">13.56 MHz Encrypted 4K</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-white/40 uppercase block">Access Software & API</span>
            <span className="text-xs font-bold text-white block">
              {hardwareSpec?.accessControlSoftware || 'SALTO ProAccess SPACE v6.4'}
            </span>
            <span className="text-[10px] text-white/60 font-mono block">REST API v2.1 & SHIP Protocol</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
            <Wifi className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Network Transport Method</span>
              <p className="text-[11px] text-white/60 font-mono mt-0.5">
                {hardwareSpec?.networkMethod ||
                  'TCP/IP Ethernet Central Gateway with 868MHz RF Mesh Node Connections to Door Locks.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
            <Server className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">Authentication Method</span>
              <p className="text-[11px] text-white/60 font-mono mt-0.5">
                {hardwareSpec?.authMethod ||
                  'OAuth 2.0 Bearer Token + Mutual TLS (mTLS) Client Certificates for Gateway Nodes.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Access Card Lifecycle Workflow Diagram */}
      <div className="bg-[#0B101D] p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#C5A059]">
          Software Abstraction Lifecycle Workflow
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-black/40 rounded-xl border border-white/10 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
            <span>Booking Confirmed</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px]">2</span>
            <span>Card Created (Inactive)</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">3</span>
            <span>Card Activated</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">4</span>
            <span>Guest Checks In</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">5</span>
            <span>Remains Active</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px]">6</span>
            <span>Checkout</span>
          </div>
          <span className="text-[#C5A059]">→</span>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">7</span>
            <span>Card Expired</span>
          </div>
        </div>
      </div>

      {/* 3. Access Cards Management Table */}
      <div className="bg-[#0B101D] p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#C5A059]" /> Programmed Guest Access Cards ({cards.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/10 text-[#C5A059] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Card / Ref</th>
                <th className="py-3 px-3">Guest & Suite</th>
                <th className="py-3 px-3">PIN & Token</th>
                <th className="py-3 px-3">Validity Window</th>
                <th className="py-3 px-3">Card Status</th>
                <th className="py-3 px-3 text-right">Lifecycle Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {cards.map((c) => {
                const isActive = c.status === 'ACTIVE';
                const isInactive = c.status === 'INACTIVE';
                const isExpired = c.status === 'EXPIRED';
                const isRevoked = c.status === 'REVOKED';

                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{c.cardNumber}</span>
                      <span className="text-[10px] text-white/50 block">Ref: {c.bookingReference}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#C5A059] block">{c.guestName}</span>
                      <span className="text-[10px] text-white/70 block">{c.suiteName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-black border border-white/10 text-emerald-400 font-bold text-[10px] inline-block">
                        PIN: {c.pinCode}
                      </span>
                      <span className="text-[9px] text-white/40 block mt-0.5 truncate max-w-[120px]">
                        {c.digitalKeyToken || 'NFC/BLE Token'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[10px] text-white/70">
                      <div>From: {c.validFrom ? new Date(c.validFrom).toLocaleDateString() : 'N/A'}</div>
                      <div>To: {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase inline-block ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isInactive
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isExpired
                            ? 'bg-white/10 text-white/50 border border-white/20'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isInactive && (
                          <button
                            onClick={() => handleActivateCard(c.id)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Unlock className="w-3 h-3" /> Activate
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => handleCheckIn(c.id)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" /> Check-In
                          </button>
                        )}
                        <button
                          onClick={() => handleSimulateDoorTap(c.id)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded bg-[#C5A059]/20 text-[#C5A059] hover:bg-[#C5A059]/30 border border-[#C5A059]/30 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" /> Tap Lock
                        </button>
                        {isActive && (
                          <button
                            onClick={() => handleCheckOut(c.id)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <UserMinus className="w-3 h-3" /> Checkout
                          </button>
                        )}
                        {!isRevoked && (
                          <button
                            onClick={() => handleRevoke(c.id)}
                            disabled={isProcessing}
                            className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px]"
                            title="Revoke Card"
                          >
                            <AlertOctagon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Live Door Reader Audit Logs Stream */}
      <div className="bg-[#0B101D] p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#C5A059]" /> Real-time Lock Mesh Door Audit Stream
          </h3>
          <span className="text-[10px] font-mono text-white/50">SALTO SPACE Event Bus</span>
        </div>

        <div className="space-y-2">
          {doorLogs.length === 0 ? (
            <p className="text-xs text-white/40 font-mono p-4 text-center">No door access events logged yet.</p>
          ) : (
            doorLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  {log.accessGranted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.doorName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          log.accessGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.eventType}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 block">
                      Guest: {log.guestName} ({log.cardNumber}) — {log.notes}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-white/40 block">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[9px] text-[#C5A059] block">Battery: {log.batteryLevel}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
