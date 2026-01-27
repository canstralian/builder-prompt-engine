import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppLayout } from "@/components/layout/AppLayout";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import PricingPage from "@/pages/PricingPage";
import AuthPage from "@/pages/AuthPage";
import LearnPage from "@/pages/LearnPage";
import LearnPostPage from "@/pages/LearnPostPage";
import PublicLibraryPage from "@/pages/PublicLibraryPage";

// App Pages
import DashboardPage from "@/pages/app/DashboardPage";
import PromptLibraryPage from "@/pages/app/PromptLibraryPage";
import PromptBuilderPage from "@/pages/app/PromptBuilderPage";
import TestRunsPage from "@/pages/app/TestRunsPage";
import WorkspacePage from "@/pages/app/WorkspacePage";
import BillingPage from "@/pages/app/BillingPage";
import AdminPage from "@/pages/app/AdminPage";

import NotFound from "@/pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public routes with marketing layout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:slug" element={<LearnPostPage />} />
                <Route path="/library" element={<PublicLibraryPage />} />
              </Route>

              {/* Auth page (standalone layout) */}
              <Route path="/auth" element={<AuthPage />} />

              {/* App routes with dashboard layout - Protected */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="library" element={<PromptLibraryPage />} />
                <Route path="prompts/new" element={<PromptBuilderPage />} />
                <Route path="prompts/:id" element={<PromptLibraryPage />} />
                <Route path="tests" element={<TestRunsPage />} />
                <Route path="workspace" element={<WorkspacePage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
