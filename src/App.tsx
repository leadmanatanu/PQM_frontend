import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { UserProvider } from '@/contexts/user-context';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

import DashboardLayout from '@/app/dashboard/layout';
import { Layout as AuthLayout } from '@/components/auth/layout';

import DevicesPage from '@/app/dashboard/devices/page';
import SchedulingPage from '@/app/dashboard/scheduling/page';
import DeviceReadingsPage from '@/app/dashboard/devicereadings/page';
import EventReadingsPage from '@/app/dashboard/eventreadings/page';
import ReportPage from '@/app/dashboard/report/page';

import SignInPage from '@/app/auth/sign-in/page';
import SignUpPage from '@/app/auth/sign-up/page';
import ResetPasswordPage from '@/app/auth/reset-password/page';

import NotFoundPage from '@/app/not-found';

import '@/styles/global.css';

export default function App() {
  return (
    <LocalizationProvider>
      <UserProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/sign-in" element={<SignInPage />} />
              <Route path="/auth/sign-up" element={<SignUpPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Dashboard Layout Wrapper */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/devices" element={<DevicesPage />} />
                <Route path="/dashboard/scheduling" element={<SchedulingPage />} />
                <Route path="/dashboard/devicereadings" element={<DeviceReadingsPage />} />
                <Route path="/dashboard/eventreadings" element={<EventReadingsPage />} />
                <Route path="/dashboard/report" element={<ReportPage />} />
                {/* Redirect /dashboard to /dashboard/devices */}
                <Route path="/dashboard" element={<Navigate to="/dashboard/devices" replace />} />
              </Route>

              {/* Home redirect */}
              <Route path="/" element={<Navigate to="/dashboard/devices" replace />} />

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </UserProvider>
    </LocalizationProvider>
  );
}