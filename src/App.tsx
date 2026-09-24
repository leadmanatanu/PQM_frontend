import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ResetPasswordPage from "./app/auth/reset-password/page";
import SignInPage from "./app/auth/sign-in/page";
import SignUpPage from "./app/auth/sign-up/page";
import DevicesPage from "./app/dashboard/devices/page";
import DashboardLayout from "./app/dashboard/layout";
import LiveReadingsPage from "./app/dashboard/liveReadings/page";
import ReportPage from "./app/dashboard/report/page";
import SchedulingPage from "./app/dashboard/scheduling/page";
import NotFoundPage from "./app/not-found";
import { Layout as AuthLayout } from "./components/auth/layout";
import { LocalizationProvider } from "./components/core/localization-provider";
import { ThemeProvider } from "./components/core/theme-provider/theme-provider";
import { UserProvider } from "./contexts/user-context";
import { SignalRProvider } from "./managers/SignalRProvider";

import "@/styles/global.css";

import { useEffect } from "react";

export default function App() {
	

	return (
		<LocalizationProvider>
			<UserProvider>
				<ThemeProvider>
					<SignalRProvider>
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
									<Route path="/dashboard/liveReadings" element={<LiveReadingsPage />} />

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
					</SignalRProvider>
				</ThemeProvider>
			</UserProvider>
		</LocalizationProvider>
	);
}
