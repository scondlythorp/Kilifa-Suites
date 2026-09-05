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
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin Management Route */}
          <Route path="/admin" element={<AdminDashboardPage />} />

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
