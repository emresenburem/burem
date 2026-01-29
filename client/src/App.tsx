import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import BrandPage from "@/pages/brand-detail";
import { useGlobalClickSound } from "@/hooks/use-click-sound";

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
        </ClickSoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
