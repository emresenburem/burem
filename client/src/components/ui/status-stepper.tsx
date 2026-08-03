import { motion } from "framer-motion";
import { Search, CheckCircle2, Clock, AlertCircle, Package, Wrench, Truck, ChevronRight } from "lucide-react";

export const STATUS_STEPS = [
  { id: 1, label: "Teslim Alındı",           icon: Package,      color: "text-blue-500",  bg: "bg-blue-500/10",  border: "border-blue-500/30" },
  { id: 2, label: "Arıza Tespiti / İnceleme", icon: Search,       color: "text-purple-500",bg: "bg-purple-500/10",border: "border-purple-500/30" },
  { id: 3, label: "Müşteri Onayı Bekleniyor", icon: Clock,        color: "text-yellow-500",bg: "bg-yellow-500/10",border: "border-yellow-500/30" },
  { id: 4, label: "Parça Bekleniyor",         icon: AlertCircle,  color: "text-orange-500",bg: "bg-orange-500/10",border: "border-orange-500/30" },
  { id: 5, label: "Onarım & Yük Testinde",    icon: Wrench,       color: "text-cyan-500",  bg: "bg-cyan-500/10",  border: "border-cyan-500/30" },
  { id: 6, label: "Teslimata Hazır",          icon: Truck,        color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
];

export function StatusStepper({ status }: { status: number }) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-700"
          style={{ width: `${((status - 1) / 5) * 100}%` }}
        />
        {STATUS_STEPS.map((step) => {
          const Icon = step.icon;
          const done = step.id < status;
          const active = step.id === status;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.15 : 1 }}
                className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                    ? `${step.bg} ${step.border} ${step.color} border-2 shadow-lg`
                    : "bg-background border-border text-muted-foreground/40"
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </motion.div>
              <span className={`text-[10px] font-medium text-center max-w-[80px] leading-tight ${
                active ? step.color + " font-semibold" : done ? "text-green-600" : "text-muted-foreground/50"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-2 sm:hidden">
        {STATUS_STEPS.map((step) => {
          const Icon = step.icon;
          const done = step.id < status;
          const active = step.id === status;
          return (
            <div key={step.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
              active ? `${step.bg} ${step.border}` : done ? "border-green-500/20 bg-green-500/5" : "border-border bg-muted/20 opacity-40"
            }`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-green-500 text-white" : active ? `${step.bg} ${step.color}` : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-sm font-medium ${active ? step.color : done ? "text-green-600" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {active && <ChevronRight className={`ml-auto h-4 w-4 ${step.color}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
