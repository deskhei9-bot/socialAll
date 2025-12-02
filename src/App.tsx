import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useUserRole } from "./hooks/useUserRole";
import { ThemeProvider } from "./components/ThemeProvider";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import Scheduler from "./pages/Scheduler";
import Channels from "./pages/Channels";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import SystemAnalytics from "./pages/admin/SystemAnalytics";
import SystemSettings from "./pages/admin/SystemSettings";
import Status from "./pages/Status";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // If loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, redirect to appropriate dashboard
  const homeRoute = user ? (
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  ) : (
    <Route path="/" element={<Index />} />
  );

  return (
    <Routes>
      {homeRoute}
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/status" element={<Status />} />
      
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* User routes */}
        <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
        <Route path="/create" element={<UserRoute><CreatePost /></UserRoute>} />
        <Route path="/scheduler" element={<UserRoute><Scheduler /></UserRoute>} />
        <Route path="/channels" element={<UserRoute><Channels /></UserRoute>} />
        <Route path="/analytics" element={<UserRoute><Analytics /></UserRoute>} />
        <Route path="/templates" element={<UserRoute><Templates /></UserRoute>} />
        <Route path="/settings" element={<UserRoute><Settings /></UserRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><SystemAnalytics /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="social-auto-upload-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
