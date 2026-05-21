import React, { useEffect, useState } from "react";

export function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#DEDBC8",
        fontFamily: "'Almarai', sans-serif",
      }}
    >
      <style>{`
        @keyframes pullUp {
          0% {
            transform: translateY(40px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-pull-up {
          animation: pullUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Noise Overlay */}
      <div className="noise-overlay"></div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "py-4 bg-[#0a0a0a]/80 backdrop-blur-md" : "py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-bold tracking-wider">BUREM ELEKTRONIK</div>
          <a
            href="https://wa.me/905322664764"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: "#25D366", color: "#ffffff" }}
          >
            WhatsApp
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 relative container mx-auto pt-20">
        <div className="max-w-5xl">
          <h1 className="text-[12vw] md:text-[96px] font-extrabold leading-[0.9] tracking-[-0.02em] mb-6 flex flex-col">
            <span className="block animate-pull-up">ENDUSTRIYEL</span>
            <span className="block animate-pull-up delay-100 flex flex-wrap items-center gap-4">
              ELEKTRONIK{" "}
              <span
                style={{ fontFamily: "'Instrument Serif', serif" }}
                className="italic font-normal text-[#8a8778]"
              >
                Onarim
              </span>
            </span>
          </h1>
          <p
            className="text-lg md:text-xl max-w-xl animate-pull-up delay-200"
            style={{ color: "#8a8778" }}
          >
            20 yili askin deneyimle surucu, PLC ve PCB tamiri
          </p>
        </div>
        
        <div 
          className="absolute bottom-12 left-6 right-6 h-[1px]" 
          style={{ backgroundColor: "rgba(222, 219, 200, 0.2)" }}
        ></div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 container mx-auto">
        <h2 className="text-sm font-bold tracking-widest mb-12 uppercase" style={{ color: "#8a8778" }}>
          Hizmetlerimiz
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory">
          {[
            { title: "Surucu Tamiri", img: "/__mockup/images/drive.jpg", desc: "Tum marka inverter ve suruculerin profesyonel onarimi." },
            { title: "PCB Tamiri", img: "/__mockup/images/pcb.jpg", desc: "Elektronik kartlarin detayli analiz ve tamiri." },
            { title: "PLC Tamiri", img: "/__mockup/images/plc.jpg", desc: "Endustriyel otomasyon PLC sistem onarimlari." },
            { title: "Ariza Tespiti", img: "/__mockup/images/diagnostic.jpg", desc: "Gelistirilmis test cihazlari ile hizli ariza tespiti." },
            { title: "Ultrasonik Yikama", img: "/__mockup/images/ultrasonic.jpg", desc: "Kart ve bilesenlerin derinlemesine temizligi." }
          ].map((service, i) => (
            <div 
              key={i}
              className="min-w-[300px] w-[320px] h-[420px] rounded-2xl relative overflow-hidden group snap-start shrink-0 cursor-pointer"
              style={{ backgroundColor: "#111110" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-luminosity"
                style={{ backgroundImage: "url(" + service.img + ")" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8a8778" }}>
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-24 px-6 border-y" style={{ borderColor: "rgba(222, 219, 200, 0.1)" }}>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {[
            { num: "20+", label: "Yillik Deneyim" },
            { num: "5.000+", label: "Onarilan Cihaz" },
            { num: "%98", label: "Musteri Memnuniyeti" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span 
                className="text-6xl md:text-7xl mb-2" 
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                {stat.num}
              </span>
              <span className="text-sm uppercase tracking-widest" style={{ color: "#8a8778" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-6 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Hizli Tespit", desc: "Ariza 24 saat icinde", icon: "01" },
            { title: "Orijinal Parca", desc: "Sertifikali parcalar", icon: "02" },
            { title: "Garantili Servis", desc: "6 ay garanti", icon: "03" },
            { title: "Hizli Teslimat", desc: "Anlasmali kargo", icon: "04" }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="p-10 rounded-2xl flex flex-col justify-between h-48 group transition-colors hover:bg-[#1a1a19]"
              style={{ backgroundColor: "#111110" }}
            >
              <span className="text-xs font-mono" style={{ color: "#8a8778" }}>{feature.icon}</span>
              <div>
                <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                <p style={{ color: "#8a8778" }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center container mx-auto">
        <h2 
          className="text-5xl md:text-7xl mb-12"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          Arizani Bize Anlat
        </h2>
        
        <a
          href="https://wa.me/905322664764"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:-translate-y-1"
          style={{ backgroundColor: "#25D366", color: "#ffffff" }}
        >
          WhatsApp ile Ulas: +90 532 266 47 64
        </a>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm border-t" style={{ borderColor: "rgba(222, 219, 200, 0.1)", color: "#8a8778" }}>
        <p>&copy; {new Date().getFullYear()} Burem Elektronik. Tum haklari saklidir.</p>
      </footer>
    </div>
  );
}
