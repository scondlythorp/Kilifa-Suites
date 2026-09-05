import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { OverviewTab } from '../components/admin/OverviewTab';
import { SuitesTab } from '../components/admin/SuitesTab';
import { BookingsTab } from '../components/admin/BookingsTab';
import { GuestsTab } from '../components/admin/GuestsTab';
import { MediaTab } from '../components/admin/MediaTab';
import { AccessControlTab } from '../components/admin/AccessControlTab';
import { NotificationsTab } from '../components/admin/NotificationsTab';
import { AnalyticsTab } from '../components/admin/AnalyticsTab';
import { api } from '../services/apiClient';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data State
  const [stats, setStats] = useState<any>({
    todaysBookings: 0,
    upcomingBookings: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    pendingRequestsCount: 0,
    totalSuites: 0,
    totalGuests: 0,
  });

  const [suites, setSuites] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setErrorMsg(null);

    try {
      const [statsRes, suitesRes, bookingsRes, guestsRes, mediaRes] = await Promise.all([
        api.dashboard.getStats().catch(() => ({ data: null })),
        api.suites.getAll().catch(() => ({ data: [] })),
        api.bookings.getAll().catch(() => ({ data: [] })),
        api.guests.getAll().catch(() => ({ data: [] })),
        api.media.getAll(true).catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (suitesRes?.data) setSuites(suitesRes.data);
      if (bookingsRes?.data) setBookings(bookingsRes.data);
      if (guestsRes?.data) setGuests(guestsRes.data);
      if (mediaRes?.data) setMediaList(mediaRes.data);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to sync dashboard data from REST API.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // REST API Handlers for Suite Operations
  const handleCreateSuite = async (data: any) => {
    await api.suites.create(data);
    showNotification('Suite created successfully via REST API');
    await fetchDashboardData();
  };

  const handleUpdateSuite = async (id: string, data: any) => {
    await api.suites.update(id, data);
    showNotification('Suite updated successfully via REST API');
    await fetchDashboardData();
  };

  const handleDeleteSuite = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this suite?')) {
      await api.suites.delete(id);
      showNotification('Suite deleted successfully via REST API');
      await fetchDashboardData();
    }
  };

  // REST API Handler for Booking Status Updates
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    await api.bookings.updateStatus(id, status);
    showNotification(`Booking status updated to '${status}' via REST API`);
    await fetchDashboardData();
  };

  // REST API Handlers for Media Operations
  const handleCreateMedia = async (data: any) => {
    await api.media.create(data);
    showNotification('Media asset added successfully via REST API');
    await fetchDashboardData();
  };

  const handleUpdateMedia = async (id: string, data: any) => {
    await api.media.update(id, data);
    showNotification('Media asset updated successfully via REST API');
    await fetchDashboardData();
  };

  const handleDeleteMedia = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media asset?')) {
      await api.media.delete(id);
      showNotification('Media asset deleted via REST API');
      await fetchDashboardData();
    }
  };

  const handleTogglePublishMedia = async (id: string) => {
    await api.media.togglePublish(id);
    showNotification('Media publication status toggled via REST API');
    await fetchDashboardData();
  };

  // REST API Handlers for Guest Operations
  const handleUpdateGuestProfile = async (id: string, data: any) => {
    await api.guests.update(id, data);
    showNotification('Guest profile updated via REST API');
    await fetchDashboardData();
  };

  const handleCheckInGuest = async (bookingId: string) => {
    await api.guests.checkIn(bookingId);
    showNotification('Guest checked in successfully via REST API');
    await fetchDashboardData();
  };

  const handleCheckOutGuest = async (bookingId: string) => {
    await api.guests.checkOut(bookingId);
    showNotification('Guest checked out successfully via REST API');
    await fetchDashboardData();
  };

  const handleUpdateSpecialRequests = async (bookingId: string, specialRequests: string) => {
    await api.guests.updateSpecialRequests(bookingId, specialRequests);
    showNotification('Special requests updated via REST API');
    await fetchDashboardData();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
        <span className="font-mono text-xs text-white/50">Verifying session credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={stats.pendingRequestsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          activeTab={activeTab}
          onRefresh={fetchDashboardData}
          isRefreshing={isLoadingData}
          onTabChange={setActiveTab}
        />

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400/60 hover:text-emerald-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between font-mono animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400/60 hover:text-red-400">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab View Container */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewTab
              stats={stats}
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              onNavigateToBookings={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'suites' && (
            <SuitesTab
              suites={suites}
              onCreateSuite={handleCreateSuite}
              onUpdateSuite={handleUpdateSuite}
              onDeleteSuite={handleDeleteSuite}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab
              guests={guests}
              onUpdateProfile={handleUpdateGuestProfile}
              onCheckIn={handleCheckInGuest}
              onCheckOut={handleCheckOutGuest}
              onUpdateSpecialRequests={handleUpdateSpecialRequests}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              mediaList={mediaList}
              onCreateMedia={handleCreateMedia}
              onUpdateMedia={handleUpdateMedia}
              onDeleteMedia={handleDeleteMedia}
              onTogglePublish={handleTogglePublishMedia}
            />
          )}

          {activeTab === 'access' && <AccessControlTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </main>
      </div>
    </div>
  );
};
