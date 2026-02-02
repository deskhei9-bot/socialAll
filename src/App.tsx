import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useUserRole } from "./hooks/useUserRole";
import { ThemeProvider } from "./components/ThemeProvider";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Scheduler = lazy(() => import("./pages/Scheduler"));
const Channels = lazy(() => import("./pages/Channels"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Templates = lazy(() => import("./pages/Templates"));
const Auth = lazy(() => import("./pages/Auth"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const SystemAnalytics = lazy(() => import("./pages/admin/SystemAnalytics"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const Status = lazy(() => import("./pages/Status"));

const queryClient = new QueryClient();

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

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
    <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Index /></Suspense>} />
  );

  return (
    <Routes>
      {homeRoute}
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
      <Route path="/status" element={<Suspense fallback={<LoadingFallback />}><Status /></Suspense>} />
      
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* User routes */}
        <Route path="/dashboard" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense></UserRoute>} />
        <Route path="/create" element={<UserRoute><Suspense fallback={<LoadingFallback />}><CreatePost /></Suspense></UserRoute>} />
        <Route path="/scheduler" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Scheduler /></Suspense></UserRoute>} />
        <Route path="/channels" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Channels /></Suspense></UserRoute>} />
        <Route path="/analytics" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Analytics /></Suspense></UserRoute>} />
        <Route path="/templates" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Templates /></Suspense></UserRoute>} />
        <Route path="/settings" element={<UserRoute><Suspense fallback={<LoadingFallback />}><Settings /></Suspense></UserRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><ManageUsers /></Suspense></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><SystemAnalytics /></Suspense></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><SystemSettings /></Suspense></AdminRoute>} />
      </Route>
      
      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
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
