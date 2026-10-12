import React, { useState } from 'react';
import { api } from '../../services/apiClient';
import {
  Search,
  Filter,
  CheckCircle2,
  LogIn,
  LogOut,
  XCircle,
  Clock,
  User,
  Calendar,
  Building,
  DollarSign,
  Eye,
  Key,
  X,
  CreditCard,
  RotateCcw,
  PlusCircle,
  Check,
} from 'lucide-react';
import { formatGMD } from '../../utils/currency';

interface BookingsTabProps {
  bookings: any[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onRefresh?: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onUpdateStatus, onRefresh }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [partialAmount, setPartialAmount] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const handleRecordPartial = async () => {
    if (!selectedBooking || !partialAmount) return;
    setIsActionLoading(true);
    setActionSuccessMsg('');
    try {
      const paymentId = selectedBooking.payment?.id || selectedBooking.id;
      await api.payments.recordPartial(paymentId, Number(partialAmount), 'Partial deposit collected at desk');
      setActionSuccessMsg(`Partial payment of D ${Number(partialAmount).toLocaleString()} recorded successfully.`);
      setPartialAmount('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record partial payment');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (status: string) => {
    if (!selectedBooking) return;
    setIsActionLoading(true);
    setActionSuccessMsg('');
    try {
      const paymentId = selectedBooking.payment?.id || selectedBooking.id;
      await api.payments.updateStatus(paymentId, status, `Payment status updated to ${status} by receptionist`);
      setActionSuccessMsg(`Payment marked as ${status}.`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedBooking) return;
    if (!confirm(`Are you sure you want to refund this transaction for ${selectedBooking.fullName}?`)) return;
    setIsActionLoading(true);
    setActionSuccessMsg('');
    try {
      const paymentId = selectedBooking.payment?.id || selectedBooking.id;
      await api.payments.refund(paymentId);
      setActionSuccessMsg('Payment refunded successfully.');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const statusOptions = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'CHECKED_IN', label: 'Checked In' },
    { id: 'CHECKED_OUT', label: 'Checked Out' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.suiteName && b.suiteName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CHECKED_IN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CHECKED_OUT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter & Search Bar */}
      <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif text-white font-semibold">Reservations & Guest Stays</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Review requests, process guest check-ins/check-outs, manage access keys, and update reservation status.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ref, guest, or suite..."
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#C5A059] focus:outline-none"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-t border-white/10">
          {statusOptions.map((opt) => {
            const count =
              opt.id === 'ALL'
                ? bookings.length
                : bookings.filter((b) => b.status === opt.id).length;
            const isActive = selectedStatus === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedStatus(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-semibold shadow-md shadow-[#C5A059]/20'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#131A2E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-white/50 font-mono">
                <th className="p-4 font-normal">REF</th>
                <th className="p-4 font-normal">GUEST NAME</th>
                <th className="p-4 font-normal">SUITE</th>
                <th className="p-4 font-normal">CHECK-IN / OUT</th>
                <th className="p-4 font-normal">GUESTS</th>
                <th className="p-4 font-normal">PRICE</th>
                <th className="p-4 font-normal">STATUS</th>
                <th className="p-4 text-right font-normal">STATUS ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/50 font-mono">
                    No reservations matching current filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono font-bold text-[#C5A059]">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {b.bookingReference}
                        <Eye className="w-3 h-3 text-white/40" />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{b.fullName}</div>
                      <div className="text-[11px] text-white/50">{b.email}</div>
                    </td>
                    <td className="p-4 text-white/80 font-medium">{b.suiteName}</td>
                    <td className="p-4 text-white/70 font-mono">
                      <div>{b.checkIn}</div>
                      <div className="text-[10px] text-white/40">to {b.checkOut} ({b.totalNights}n)</div>
                    </td>
                    <td className="p-4 text-white/70 font-mono">{b.guestsCount} Guests</td>
                    <td className="p-4 font-bold text-emerald-400">{formatGMD(b.totalEstimatedPrice)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider border font-bold ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Confirm
                          </button>
                        )}

                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CHECKED_IN')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-all font-medium flex items-center gap-1"
                          >
                            <LogIn className="w-3 h-3" /> Check In
                          </button>
                        )}

                        {b.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CHECKED_OUT')}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 transition-all font-medium flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" /> Check Out
                          </button>
                        )}

                        {b.status !== 'CANCELLED' && b.status !== 'CHECKED_OUT' && (
                          <button
                            onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                            title="Cancel Reservation"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest block">
                  Reservation Voucher
                </span>
                <h3 className="text-xl font-serif text-white font-bold">
                  {selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Guest Full Name:</span>
                  <span className="text-white font-semibold">{selectedBooking.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Email:</span>
                  <span className="text-white">{selectedBooking.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Phone:</span>
                  <span className="text-white">{selectedBooking.phone}</span>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Assigned Suite:</span>
                  <span className="text-[#C5A059] font-bold">{selectedBooking.suiteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Check-In Date:</span>
                  <span className="text-white font-mono">{selectedBooking.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Check-Out Date:</span>
                  <span className="text-white font-mono">{selectedBooking.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Duration:</span>
                  <span className="text-white">{selectedBooking.totalNights} Night(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-mono">Total Price:</span>
                  <span className="text-emerald-400 font-bold">{formatGMD(selectedBooking.totalEstimatedPrice)}</span>
                </div>
              </div>

              {/* Payment Abstraction Layer Section */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#C5A059]" /> Payment Gateway Layer
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#C5A059]/20 text-[#C5A059] font-bold border border-[#C5A059]/30">
                    {selectedBooking.payment?.provider || 'WAVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/80">
                  <div>
                    <span className="text-white/40 block">Payment State:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedBooking.payment?.status || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Paid Amount:</span>
                    <span className="font-bold text-white">
                      {formatGMD(selectedBooking.payment?.paidAmount || 0)} / {formatGMD(selectedBooking.totalEstimatedPrice)}
                    </span>
                  </div>
                  {selectedBooking.payment?.transactionRef && (
                    <div className="col-span-2">
                      <span className="text-white/40 block">Transaction Reference:</span>
                      <span className="text-white/90 text-[10px]">
                        {selectedBooking.payment.transactionRef}
                      </span>
                    </div>
                  )}
                </div>

                {actionSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 font-mono">
                    {actionSuccessMsg}
                  </p>
                )}

                {/* Reception Payment Action Tools */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[10px] text-white/50 font-mono block">
                    Record Partial Deposit or Update Status:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Amount (GMD)"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      className="w-28 px-2.5 py-1.5 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#C5A059] focus:outline-none"
                    />
                    <button
                      onClick={handleRecordPartial}
                      disabled={isActionLoading || !partialAmount}
                      className="px-3 py-1.5 rounded-lg bg-[#C5A059] text-black font-semibold text-xs hover:bg-[#b08e4c] transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Deposit
                    </button>
                    <button
                      onClick={() => handleUpdatePaymentStatus('SUCCESSFUL')}
                      disabled={isActionLoading}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                    <button
                      onClick={handleRefund}
                      disabled={isActionLoading}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Refund
                    </button>
                  </div>
                </div>
              </div>

              {selectedBooking.accessCard && (
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                    <Key className="w-4 h-4" /> Smart Access RFID Card Issued
                  </div>
                  <div className="flex justify-between text-[#C5A059] font-mono pt-1">
                    <span>Card ID: {selectedBooking.accessCard.cardNumber}</span>
                    <span>Status: {selectedBooking.accessCard.status}</span>
                  </div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/80">
                  <span className="text-[10px] text-[#C5A059] uppercase font-mono block mb-1">
                    Special Requests:
                  </span>
                  <p className="italic">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-all"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
