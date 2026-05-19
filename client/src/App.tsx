import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import BrandPage from "@/pages/brand-detail";
import { useGlobalClickSound } from "@/hooks/use-click-sound";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/905322664764"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7 fill-white stroke-none" />
    </motion.a>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/brand/:name" component={BrandPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClickSoundProvider({ children }: { children: React.ReactNode }) {
  useGlobalClickSound();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ClickSoundProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </ClickSoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
