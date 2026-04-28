import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { useKannadaLeakValidator } from "@/hooks/useKannadaLeakValidator";
import KannadaLeakOverlay from "@/components/KannadaLeakOverlay";
import KannadaPreviewAutoValidator from "@/components/KannadaPreviewAutoValidator";
import KannadaPreviewBlockingGate from "@/components/KannadaPreviewBlockingGate";
import Index from "./pages/Index";
import FindSchemes from "./pages/FindSchemes";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useKannadaLeakValidator();
  return (
    <>
      <KannadaPreviewBlockingGate>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/find-schemes" element={<FindSchemes />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </KannadaPreviewBlockingGate>
      <KannadaLeakOverlay />
      <KannadaPreviewAutoValidator />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
