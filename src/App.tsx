import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SchoolPortal from "./pages/SchoolPortal";
import SeniorPortal from "./pages/SeniorPortal";
import SeniorProfile from "./pages/SeniorProfile";
import BrowseVideos from "./pages/BrowseVideos";
import StudentPortal from "./pages/StudentPortal";
import About from "./pages/About";
import Services from "./pages/Services";
import Help from "./pages/Help";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/AdminPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/school" element={<SchoolPortal />} />
          <Route path="/senior" element={<SeniorPortal />} />
          <Route path="/senior/profile" element={<SeniorProfile />} />
          <Route path="/senior/browse-videos" element={<BrowseVideos />} />
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/admin" element={<AdminPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
