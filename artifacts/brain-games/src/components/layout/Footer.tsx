import { ExternalLink, Mail, Github, Download } from "lucide-react";
import { motion } from "framer-motion";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { label: "GitHub",      href: "https://github.com/Lorapok",          icon: Github,       custom: false },
  { label: "X / Twitter", href: "https://twitter.com/LorapokLabs",     icon: XIcon,        custom: true  },
  { label: "Email",       href: "mailto:lorapokdev@gmail.com",         icon: Mail,         custom: false },
  { label: "Website",     href: "https://lorapok.github.io",           icon: ExternalLink, custom: false },
];

export function Footer() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <a href="https://lorapok.github.io" target="_blank" rel="noopener noreferrer" className="block">
              <motion.div
                className="relative"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute -inset-3 rounded-full bg-primary/15 blur-lg"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Lorapok BrainSpark"
                  className="relative h-14 w-auto object-contain"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 10px rgba(124,58,237,0.5))",
                      "drop-shadow(0 0 22px rgba(124,58,237,0.8))",
                      "drop-shadow(0 0 10px rgba(124,58,237,0.5))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </a>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs leading-relaxed">
              8 brain training games for students, scientists, gamers, and curious minds.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Lorapok Labs · Bangladesh
            </p>

            {/* PWA install in footer */}
            {!isInstalled && canInstall && (
              <button
                onClick={install}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            {isInstalled && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                App installed
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Connect
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <a
                href="https://github.com/Maijied/Lorapok-GameSpark"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Github className="w-3 h-3" /> Open Source
              </a>
              <p className="text-xs text-muted-foreground/50">
                &copy; {year} Lorapok Labs. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
