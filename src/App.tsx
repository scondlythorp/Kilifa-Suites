import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SuitesPage } from './pages/SuitesPage';
import { SuiteDetailPage } from './pages/SuiteDetailPage';
import { AboutPage } from './pages/AboutPage';
import { AmenitiesPage } from './pages/AmenitiesPage';
import { GuestExperiencePage } from './pages/GuestExperiencePage';
import { GalleryPage } from './pages/GalleryPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { LocationPage } from './pages/LocationPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { SecurityPage } from './pages/SecurityPage';

// Lazy-load Admin Dashboard to isolate admin logic from the public guest bundle
const AdminDashboardPage = React.lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin Management Route - Code-split from public bundle */}
          <Route
            path="/admin"
            element={
              <React.Suspense
                fallback={
                  <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-[#C5A059] font-mono text-xs tracking-widest uppercase">
                    Initializing Kilifa Suites Portal...
                  </div>
                }
              >
                <AdminDashboardPage />
              </React.Suspense>
            }
          />

          {/* Public Guest Pages */}
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/suites" element={<SuitesPage />} />
                  <Route path="/suites/:suiteSlug" element={<SuiteDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/amenities" element={<AmenitiesPage />} />
                  <Route path="/guest-experience" element={<GuestExperiencePage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/workshops" element={<WorkshopsPage />} />
                  <Route path="/location" element={<LocationPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
