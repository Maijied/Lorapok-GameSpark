import { ExternalLink, Mail, Github } from "lucide-react";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Lorapok",
    icon: Github,
    custom: false,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/LorapokLabs",
    icon: XIcon,
    custom: true,
  },
  {
    label: "Email",
    href: "mailto:lorapokdev@gmail.com",
    icon: Mail,
    custom: false,
  },
  {
    label: "Website",
    href: "https://lorapok.github.io",
    icon: ExternalLink,
    custom: false,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <a
              href="https://lorapok.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Lorapok BrainSpark"
                className="h-12 w-auto object-contain"
                style={{ imageRendering: "auto" }}
              />
            </a>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs leading-relaxed">
              An open ecosystem built for everyone.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Lorapok Labs &middot; Bangladesh
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                  className="w-9 h-9 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary text-muted-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/50">
              &copy; {year} Lorapok Labs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
