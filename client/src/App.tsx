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
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function BusinessCardModal() {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      {/* Trigger button — dikey kartvizit şekli */}
      <motion.button
        onClick={() => { setOpen(true); setFlipped(false); }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-24 right-6 z-[9999] flex h-16 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg shadow-black/30 border border-zinc-700"
        data-testid="button-businesscard"
        title="Kartvizit"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.4"/>
          <rect x="2" y="4" width="20" height="5" rx="3" fill="white" fillOpacity="0.18"/>
          <rect x="2" y="7" width="20" height="2" fill="white" fillOpacity="0.10"/>
          <circle cx="7.5" cy="15" r="2.2" fill="white" fillOpacity="0.85"/>
          <path d="M12 13.5h5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M12 16h3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card wrapper */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Flip hint */}
              <p className="text-center text-white/50 text-xs mb-3 select-none">
                Kartı çevirmek için tıkla
              </p>

              {/* 3D flip container */}
              <div
                className="cursor-pointer select-none"
                style={{ perspective: "1000px", width: 340, height: 190 }}
                onClick={() => setFlipped((f) => !f)}
              >
                <motion.div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transformStyle: "preserve-3d",
                  }}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* FRONT — contact info */}
                  <div
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="w-full h-full bg-white flex flex-col">
                      {/* Main area */}
                      <div className="flex flex-1 px-5 py-4 gap-4">
                        {/* Logo left */}
                        <div className="flex flex-col items-center justify-center w-[90px] flex-shrink-0">
                          <img src="/logo.png" alt="Burem Elektronik" className="w-full object-contain" />
                        </div>
                        {/* Divider */}
                        <div className="w-px bg-[#1a2a6c]/20 self-stretch my-1" />
                        {/* Info right */}
                        <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
                          <p className="text-[#1a2a6c] font-bold text-sm tracking-wide">BURHANETTİN ŞEN</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#1a2a6c] text-[10px]">📞</span>
                            <span className="text-[#1a2a6c] text-[11px]">0532 266 47 64</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#1a2a6c] text-[10px]">✉</span>
                            <span className="text-[#1a2a6c] text-[11px]">info@buremelektronik.com</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#1a2a6c] text-[10px] mt-0.5">📍</span>
                            <span className="text-[#1a2a6c] text-[10px] leading-tight">
                              Alaaddinbey Mah. 626. Sk. No:22<br />
                              SAM 1 Plaza İç Kapı No:B14<br />
                              Nilüfer / Bursa
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Bottom strip */}
                      <div className="bg-[#1a2a6c] py-2 px-5 flex items-center justify-center">
                        <span className="text-white text-[11px] tracking-widest">www.buremelektronik.com</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK — logo only */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <img
                      src="/card-back.png"
                      alt="Burem Elektronik"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="mt-4 block mx-auto text-white/40 hover:text-white/80 text-xs transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
          <BusinessCardModal />
          <WhatsAppButton />
        </ClickSoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
