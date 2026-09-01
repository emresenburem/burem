import { Link } from "wouter";
import { MessageCircle, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_NUMBER, whatsappLink } from "@/lib/site-contact";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Ana sayfa">
          <img src="/logo.png" alt="Burem Elektronik" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent sm:flex"
            data-testid="link-phone-nav"
          >
            <Phone className="h-4 w-4" />
            {PHONE_DISPLAY}
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#20ba5a]"
            data-testid="link-wa-nav"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </nav>
    </header>
  );
}