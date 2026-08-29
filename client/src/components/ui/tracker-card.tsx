import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Cpu, Calendar, User, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusStepper, STATUS_STEPS } from "./status-stepper";

interface TrackerCardProps {
  trackingNo: string;
  status: number;
  statusLabel?: string;
  deviceModel: string;
  customerName: string;
  updatedDate: string;
  technicianNote?: string | null;
  className?: string;
}

export function TrackerCard({
  trackingNo,
  status,
  deviceModel,
  customerName,
  updatedDate,
  technicianNote,
  className,
}: TrackerCardProps) {
  const qrCodeValue = `https://buremelektronik.com/takip?takip=${trackingNo}`;
  const activeStep = STATUS_STEPS.find((s) => s.id === status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Top image strip */}
      <div className="relative h-48 w-full overflow-hidden bg-[#e7eef8]">
        <img
          src="/service-tracker-card-bg.png"
          alt="Burem Elektronik servis atölyesinde devre kartı onarımı"
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

        {/* Status badge */}
        {activeStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${activeStep.bg} ${activeStep.border} ${activeStep.color}`}
          >
            <activeStep.icon className="h-3.5 w-3.5" />
            {activeStep.label}
          </motion.div>
        )}

        {/* Tracking number overlay */}
        <div className="absolute bottom-3 left-4">
          <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest mb-0.5">Takip No</p>
          <p className="text-lg font-bold font-mono text-white leading-none">{trackingNo}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Device + QR row */}
        <div className="flex items-start gap-4">
          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Cihaz</p>
                <p className="text-sm font-semibold leading-snug">{deviceModel}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Müşteri</p>
                <p className="text-sm font-semibold leading-snug">{customerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Son Güncelleme</p>
                <p className="text-sm font-semibold leading-snug">{updatedDate}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="rounded-xl border border-border bg-white p-2 shadow-sm">
              <QRCodeCanvas
                value={qrCodeValue}
                size={84}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Hash className="h-2.5 w-2.5" />
              <span>Takip QR</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Stepper */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Servis Aşaması</p>
          <StatusStepper status={status} />
        </div>

        {/* Technician note */}
        {technicianNote && (
          <>
            <div className="border-t border-border" />
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Teknisyen Notu</p>
              <p className="text-sm leading-relaxed">{technicianNote}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
