import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import BrandPage from "@/pages/brand-detail";
import { useGlobalClickSound } from "@/hooks/use-click-sound";
import { useTabFavicon } from "@/hooks/use-tab-favicon";
import { motion } from "framer-motion";

function BlinqButton() {
  return (
    <motion.a
      href="https://s1.blinq.me/cmq6jvgm5042j0bs658lq2m1j?bs=icl"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 z-[9999] flex h-16 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg shadow-black/30 border border-zinc-700 transition-shadow"
      data-testid="button-blinq"
      title="Dijital Kartvizit"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.4"/>
        <rect x="2" y="4" width="20" height="5" rx="3" fill="white" fillOpacity="0.18"/>
        <rect x="2" y="7" width="20" height="2" fill="white" fillOpacity="0.10"/>
        <circle cx="7.5" cy="15" r="2.2" fill="white" fillOpacity="0.85"/>
        <path d="M12 13.5h5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M12 16h3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </motion.a>
  );
}

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
      <svg viewBox="0 0 32 32" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="white"
          d="M16.003 3C9.376 3 4 8.373 4 15.003c0 2.15.576 4.16 1.577 5.894L4 29l8.344-1.547A11.95 11.95 0 0 0 16.003 28C22.629 28 28 22.628 28 16.003 28 9.374 22.629 3 16.003 3zm0 21.857a9.88 9.88 0 0 1-5.063-1.395l-.362-.215-3.755.983 1.003-3.654-.237-.375A9.845 9.845 0 0 1 6.13 15c0-5.44 4.431-9.87 9.873-9.87C21.444 5.13 25.87 9.56 25.87 15c0 5.44-4.427 9.857-9.867 9.857zm5.42-7.385c-.297-.149-1.758-.867-2.03-.967-.273-.099-.47-.148-.668.15-.197.298-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.15-.174.2-.298.3-.496.099-.198.05-.372-.025-.521-.075-.149-.668-1.611-.916-2.206-.241-.579-.486-.5-.668-.51l-.57-.01c-.198 0-.52.075-.792.372-.272.298-1.04 1.016-1.04 2.478s1.065 2.875 1.213 3.073c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"
        />
      </svg>
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
  useTabFavicon();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ClickSoundProvider>
          <Toaster />
          <Router />
          <BlinqButton />
          <WhatsAppButton />
        </ClickSoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
