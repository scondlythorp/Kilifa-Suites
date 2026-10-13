import React, { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { PageHeader } from '../components/common/PageHeader';
import { Container } from '../components/common/Container';
import { Section } from '../components/common/Section';
import { Button } from '../components/common/Button';
import { BUSINESS_CONFIG } from '../config/business';
import { api } from '../services/apiClient';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.contact.sendMessage({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject,
        message: formData.message.trim(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(
        (err as Error).message ||
          'Failed to submit your inquiry. Please try again or reach us directly via WhatsApp / telephone.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead configKey="contact" />

      <PageHeader
        title="Contact Kilifa Suites Management"
        subtitle="We welcome direct inquiries for reservations, workshop bookings, and general guest assistance."
        breadcrumbs={[{ label: 'Contact' }]}
        bgTag="Direct Communication"
      />

      <Section background="default">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-style-label text-[var(--color-secondary)]">GET IN TOUCH</span>
                <h2 className="text-style-h2 text-[var(--color-text)] mt-1">
                  Direct Guest Assistance
                </h2>
                <p className="text-style-body text-sm text-[var(--color-text-muted)] mt-2">
                  Our team in Tabokoto, Soma is available to respond promptly to all reservation inquiries and travel questions.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Estate Address
                    </h4>
                    <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5">
                      {BUSINESS_CONFIG.location.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Telephone & WhatsApp
                    </h4>
                    <a
                      href={BUSINESS_CONFIG.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline mt-0.5 block"
                    >
                      {BUSINESS_CONFIG.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Email Address
                    </h4>
                    <a
                      href={`mailto:${BUSINESS_CONFIG.contact.email}`}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline mt-0.5 block"
                    >
                      {BUSINESS_CONFIG.contact.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Owner Note */}
              <div className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
                <p className="font-bold text-[var(--color-text)]">
                  Kilifa Suites Leadership: {BUSINESS_CONFIG.owner}
                </p>
                <p>
                  12 Executive Suites across House 1 and House 2 in Tabokoto, Soma.
                </p>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-2xl bg-white border border-[var(--color-border)] shadow-md">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-style-h2 text-[var(--color-text)]">
                      Inquiry Sent Successfully!
                    </h3>
                    <p className="text-style-body text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                      Thank you for contacting Kilifa Suites. Your message has been forwarded directly to management (<span className="font-semibold text-[var(--color-text)]">modoulaminthorp4@gmail.com</span>). Our team will review your questions and reply promptly.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', country: '', subject: 'General Inquiry', message: '' });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >

                    <div>
                      <h3 className="text-style-h3 text-[var(--color-text)] mb-1">
                        Send Us a Direct Message
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Fill in your details below and our team will assist you immediately.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Lamin Touray"
                          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+220 700 0000"
                          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                          Subject / Inquiry Type
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Suite Availability">Suite Availability Inquiry</option>
                          <option value="Workshop Hire">Workshop / Event Space Hire</option>
                          <option value="Airport Shuttle">Airport & Transit Shuttle</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                        Your Message / Questions *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write your questions or preferred dates..."
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSubmitting}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Submit Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};
