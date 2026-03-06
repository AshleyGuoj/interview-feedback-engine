import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { JobsProvider } from "@/contexts/JobsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import JobBoard from "./pages/JobBoard";
import JobDetail from "./pages/JobDetail";
import Timeline from "./pages/Timeline";
import Analytics from "./pages/Analytics";
import Archive from "./pages/Archive";
import TimeTracker from "./pages/TimeTracker";
import AnalyzeInterview from "./pages/AnalyzeInterview";
import InterviewAnalysis from "./pages/InterviewAnalysis";
import PromoVideo from "./pages/PromoVideo";
import WorkflowImage from "./pages/WorkflowImage";

import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <JobsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
              {/* Legacy route - redirects to Analytics */}
              <Route path="/jobs/:jobId/stages/:stageId/analyze" element={<ProtectedRoute><InterviewAnalysis /></ProtectedRoute>} />
              <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
              <Route path="/time-tracker" element={<ProtectedRoute><TimeTracker /></ProtectedRoute>} />
              <Route path="/analyze" element={<ProtectedRoute><AnalyzeInterview /></ProtectedRoute>} />
              <Route path="/promo-video" element={<ProtectedRoute><PromoVideo /></ProtectedRoute>} />
              <Route path="/workflow-image" element={<ProtectedRoute><WorkflowImage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </JobsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
