import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { Button } from '../components/common/Button';
import { SUITES_DATA, BUSINESS_CONFIG } from '../config/business';
import { Suite } from '../types';
import { api } from '../services/apiClient';
import {
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Info,
  Send,
  Building2,
  Phone,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Wallet,
  Globe,
  ArrowRight,
  QrCode,
} from 'lucide-react';

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  guestsCount?: string;
  preferredSuite?: string;
}

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedSuiteSlug = searchParams.get('suite');

  // Helper to format Date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const threeDaysLater = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d;
  }, []);

  const [selectedSuiteId, setSelectedSuiteId] = useState<string>(
    preSelectedSuiteSlug
      ? SUITES_DATA.find((s) => s.slug === preSelectedSuiteSlug || s.id === preSelectedSuiteSlug)?.id || SUITES_DATA[0].id
      : SUITES_DATA[0].id
  );

  const [checkIn, setCheckIn] = useState<string>(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(formatDate(threeDaysLater));
  const [guestsCount, setGuestsCount] = useState<number>(2);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('WAVE');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);

  const selectedSuite: Suite = useMemo(() => {
    return SUITES_DATA.find((s) => s.id === selectedSuiteId) || SUITES_DATA[0];
  }, [selectedSuiteId]);

  // Calculate night count safely
  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const totalPrice = selectedSuite.pricePerNight * nightCount;

  // Form Validation Logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // 2. Phone
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 6) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // 3. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 4. Check-in & Check-out dates
    if (!checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }
    if (!checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      if (isNaN(startDate.getTime())) {
        newErrors.checkIn = 'Invalid check-in date';
      }
      if (isNaN(endDate.getTime())) {
        newErrors.checkOut = 'Invalid check-out date';
      }

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (endDate <= startDate) {
          newErrors.checkOut = 'Check-out date must be after check-in date';
        }
      }
    }

    // 5. Guest Count
    if (!guestsCount || guestsCount < 1) {
      newErrors.guestsCount = 'Please select at least 1 guest';
    } else if (guestsCount > selectedSuite.maxOccupancy) {
      newErrors.guestsCount = `Maximum occupancy for ${selectedSuite.name} is ${selectedSuite.maxOccupancy} guests`;
    }

    // 6. Preferred Suite
    if (!selectedSuiteId) {
      newErrors.preferredSuite = 'Please select a preferred suite';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Submit Booking to REST API
      const bookingPayload = {
        fullName,
        email,
        phone,
        checkIn,
        checkOut,
        guestsCount,
        pricePerNight: selectedSuite.pricePerNight,
        totalNights: nightCount,
        totalEstimatedPrice: totalPrice,
        specialRequests,
        suiteId: selectedSuite.id,
      };

      const bookingRes = await api.bookings.create(bookingPayload);
      const bookingData = bookingRes.data || bookingRes;
      setCreatedBooking(bookingData);

      // 2. Initiate Payment through Payment Abstraction Layer
      const paymentRes = await api.payments.initiate({
        bookingId: bookingData.id,
        bookingReference: bookingData.bookingReference,
        amount: totalPrice,
        currency: 'USD',
        provider: selectedProvider,
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone,
        notes: specialRequests,
      });

      setPaymentResult(paymentRes.data || paymentRes);
      setSubmitted(true);
    } catch (err) {
      console.error('[BOOKING PAYMENT ERROR]', err);
      // Fallback submission display
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead configKey="booking" />

      <PageHeader
        title="Suite Reservation Inquiry"
        subtitle="Select your preferred suite from our 12 executive suites (DAR, SAMA, LAAWOL, EJAM, YERMANDE, BAJAM, SUUDU, WURO, YIDI, KENE, SAGO, NDIYA) and submit your reservation request directly to Kilifa Suites in Soma."
        breadcrumbs={[{ label: 'Booking Request' }]}
        bgTag="Reservation Center"
      />

      <Section background="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Reservation Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl">
                {submitted ? (
                  <div className="py-12 text-center space-y-6 animate-fadeIn">
                    <div className="w-20 h-20 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    {/* EXACT REQUESTED SUBMISSION CONFIRMATION MESSAGE */}
                    <div className="space-y-3 max-w-lg mx-auto">
                      <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
                        Booking Request Received
                      </h3>
                      <p className="text-sm sm:text-base text-[#C5A059] font-medium leading-relaxed p-4 rounded-xl bg-white/5 border border-[#C5A059]/30">
                        Thank you. Your booking request has been received. Our team will contact you to confirm availability and your reservation.
                      </p>
                    </div>

                    {/* Summary Card with Payment Details */}
                    <div className="p-5 rounded-xl bg-black/60 text-xs text-left max-w-md mx-auto space-y-2.5 border border-white/10 font-mono text-white/80">
                      {createdBooking && (
                        <div className="flex justify-between border-b border-white/10 pb-2 text-white">
                          <span className="text-white/50">Ref ID:</span>
                          <span className="font-bold text-[#C5A059]">{createdBooking.bookingReference}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-white/10 pb-2 text-[#C5A059]">
                        <span className="font-bold">SUITE:</span>
                        <span>{selectedSuite.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Guest Name:</span>
                        <span className="font-semibold text-white">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Check-In:</span>
                        <span>{checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Check-Out:</span>
                        <span>{checkOut} ({nightCount} {nightCount === 1 ? 'night' : 'nights'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Guests:</span>
                        <span>{guestsCount}</span>
                      </div>
                      {paymentResult && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5 bg-white/5 p-3 rounded-lg">
                          <div className="flex justify-between text-[#C5A059]">
                            <span>Payment Provider:</span>
                            <span className="font-bold">{paymentResult.provider}</span>
                          </div>
                          <div className="flex justify-between text-white/70">
                            <span>Transaction Ref:</span>
                            <span className="text-[10px] text-white/90">{paymentResult.transactionRef}</span>
                          </div>
                          <div className="flex justify-between text-white/70">
                            <span>Payment Status:</span>
                            <span className="font-bold text-emerald-400">{paymentResult.status}</span>
                          </div>
                          {paymentResult.instructions && (
                            <p className="text-[11px] text-white/60 italic border-t border-white/10 pt-1 mt-1">
                              {paymentResult.instructions}
                            </p>
                          )}
                          {paymentResult.redirectUrl && (
                            <a
                              href={paymentResult.redirectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 px-3 py-1.5 rounded bg-[#C5A059] text-black font-bold text-center w-full"
                            >
                              Complete Checkout on Gateway →
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-white/10 text-emerald-400 font-bold text-sm">
                        <span>Est. Total:</span>
                        <span>${totalPrice} USD (~{Math.round(totalPrice * 68)} GMD)</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          setFullName('');
                          setEmail('');
                          setPhone('');
                          setSpecialRequests('');
                          setErrors({});
                        }}
                      >
                        New Booking Request
                      </Button>
                      <Button
                        href={BUSINESS_CONFIG.contact.whatsappUrl}
                        variant="accent"
                        leftIcon={<Phone className="w-4 h-4" />}
                      >
                        Connect via WhatsApp
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-semibold uppercase tracking-widest mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Direct Booking System</span>
                      </div>
                      <h3 className="text-2xl font-serif italic text-white mb-1">
                        Submit Booking Request
                      </h3>
                      <p className="text-xs text-white/60 font-light">
                        Please complete all required fields below. Our staff will review availability and confirm your reservation.
                      </p>
                    </div>

                    {/* Preferred Suite Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1.5">
                        Preferred Suite *
                      </label>
                      <select
                        value={selectedSuiteId}
                        onChange={(e) => {
                          setSelectedSuiteId(e.target.value);
                          if (errors.preferredSuite) {
                            setErrors((prev) => ({ ...prev, preferredSuite: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-xl bg-black text-sm font-medium text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                          errors.preferredSuite ? 'border-red-500' : 'border-white/20'
                        }`}
                      >
                        {SUITES_DATA.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (House {s.houseNumber} • ${s.pricePerNight}/night)
                          </option>
                        ))}
                      </select>
                      {errors.preferredSuite && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.preferredSuite}
                        </p>
                      )}
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5">
                          Check-In Date *
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            if (errors.checkIn) {
                              setErrors((prev) => ({ ...prev, checkIn: undefined }));
                            }
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                            errors.checkIn ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        {errors.checkIn && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.checkIn}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5">
                          Check-Out Date *
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            if (errors.checkOut) {
                              setErrors((prev) => ({ ...prev, checkOut: undefined }));
                            }
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                            errors.checkOut ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        {errors.checkOut && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.checkOut}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Number of Guests Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5">
                        Number of Guests *
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => {
                          setGuestsCount(Number(e.target.value));
                          if (errors.guestsCount) {
                            setErrors((prev) => ({ ...prev, guestsCount: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                          errors.guestsCount ? 'border-red-500' : 'border-white/20'
                        }`}
                      >
                        {Array.from({ length: selectedSuite.maxOccupancy }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Guest' : 'Guests'} (Max {selectedSuite.maxOccupancy})
                          </option>
                        ))}
                      </select>
                      {errors.guestsCount && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.guestsCount}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                        Guest Details
                      </h4>

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) {
                              setErrors((prev) => ({ ...prev, fullName: undefined }));
                            }
                          }}
                          placeholder="e.g. Musa Njai"
                          className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                            errors.fullName ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        {errors.fullName && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-white/80 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors((prev) => ({ ...prev, email: undefined }));
                              }
                            }}
                            placeholder="name@example.com"
                            className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                              errors.email ? 'border-red-500' : 'border-white/20'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-white/80 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) {
                                setErrors((prev) => ({ ...prev, phone: undefined }));
                              }
                            }}
                            placeholder="+220 700 0000"
                            className={`w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border transition-colors focus:outline-none focus:border-[#C5A059] ${
                              errors.phone ? 'border-red-500' : 'border-white/20'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1">
                          Special Requests
                        </label>
                        <textarea
                          rows={2}
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Airport transport inquiry, late check-in notice, dietary preferences..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black text-sm text-white border border-white/20 transition-colors focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      {/* Payment Provider Selection Grid */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                            Select Payment Method
                          </h4>
                          <span className="text-[10px] font-mono text-white/40">
                            Multi-Gateway Abstraction
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {[
                            { id: 'WAVE', name: 'Wave', badge: 'Mobile Money', sub: 'Instant App' },
                            { id: 'AFRIMONEY', name: 'Afrimoney', badge: 'Gambia Mobile', sub: '*133# USSD' },
                            { id: 'APS_WALLET', name: 'APS Wallet', badge: 'Remittance', sub: 'Local/Diaspora' },
                            { id: 'VISA_CARD', name: 'Visa / Card', badge: 'PCI-DSS', sub: 'Tokenized' },
                            { id: 'PAYPAL', name: 'PayPal', badge: 'Global', sub: 'USD Express' },
                            { id: 'CASH', name: 'Cash / Wire', badge: 'Reception', sub: 'Pay at Desk' },
                          ].map((p) => {
                            const isSelected = selectedProvider === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedProvider(p.id)}
                                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 ${
                                  isSelected
                                    ? 'bg-[#C5A059]/15 border-[#C5A059] text-white shadow-lg shadow-[#C5A059]/10'
                                    : 'bg-black/40 border-white/10 text-white/70 hover:border-white/30 hover:bg-black/60'
                                }`}
                              >
                                <div className="flex items-start justify-between w-full">
                                  <span className="font-serif font-bold text-xs">{p.name}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                      isSelected ? 'bg-[#C5A059] text-black font-bold' : 'bg-white/10 text-white/50'
                                    }`}
                                  >
                                    {p.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] text-white/50 font-mono block mt-1">
                                  {p.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSubmitting}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Submit Booking Request
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Price & Suite Summary Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-28 p-6 rounded-2xl bg-[#111111] border border-[#C5A059]/40 shadow-2xl space-y-6">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C5A059] px-2.5 py-1 rounded bg-white/5 border border-[#C5A059]/30">
                    Preferred Suite Selection
                  </span>
                  <h3 className="text-2xl font-serif italic text-white mt-3">
                    {selectedSuite.name}
                  </h3>
                  <p className="text-xs text-white/60">
                    House {selectedSuite.houseNumber} • {selectedSuite.floor} Floor
                  </p>
                </div>

                <div className="space-y-3 text-xs border-y border-white/10 py-4 font-mono">
                  <div className="flex justify-between">
                    <span className="text-white/60">Rate / Night:</span>
                    <span className="font-semibold text-white">${selectedSuite.pricePerNight} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration:</span>
                    <span className="font-semibold text-white">{nightCount} {nightCount === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Max Occupancy:</span>
                    <span className="font-semibold text-white">{selectedSuite.maxOccupancy} Guests</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold">
                    <span className="text-[#C5A059]">Estimated Total:</span>
                    <span className="text-xl text-[#C5A059]">${totalPrice} USD</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>Dual Rooftop Solar Backup (24/7 Energy)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Keycard Access Control & Gated Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>Location: Tabokoto, Soma, The Gambia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};

