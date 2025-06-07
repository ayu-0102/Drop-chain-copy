
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WalletConnection from "./components/WalletConnection";
import UserDashboard from "./pages/UserDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import UserOrders from "./pages/UserOrders";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import JobDetails from "./pages/JobDetails";
import OngoingDelivery from "./pages/OngoingDelivery";
import Profile from "./pages/Profile";
import DeliveryCompleted from "./pages/DeliveryCompleted";
import DAOGovernance from "./pages/DAOGovernance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WalletConnection />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/user-orders" element={<UserOrders />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/ongoing-delivery" element={<OngoingDelivery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/delivery-completed" element={<DeliveryCompleted />} />
          <Route path="/dao" element={<DAOGovernance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
