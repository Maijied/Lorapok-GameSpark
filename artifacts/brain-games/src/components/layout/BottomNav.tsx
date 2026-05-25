import { useLocation, Link } from "wouter";
import { Home, Trophy, Settings } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { motion } from "framer-motion";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
}

function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 min-w-[64px]">
      {active && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute inset-0 bg-primary/10 rounded-xl"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        />
      )}
      <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? "text-primary" : "text-zinc-500"}`} />
      <span className={`text-[10px] font-semibold relative z-10 transition-colors ${active ? "text-primary" : "text-zinc-500"}`}>
        {label}
      </span>
    </div>
  );
}

export function BottomNav() {
  const [location] = useLocation();
  const { openSettings } = useSettings();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around py-1 pb-safe">
        <Link href="/">
          <NavItem icon={Home} label="Home" active={location === "/"} />
        </Link>
        <Link href="/scores">
          <NavItem icon={Trophy} label="Scores" active={location === "/scores"} />
        </Link>
        <button onClick={openSettings}>
          <NavItem icon={Settings} label="Settings" active={false} />
        </button>
      </div>
    </nav>
  );
}
