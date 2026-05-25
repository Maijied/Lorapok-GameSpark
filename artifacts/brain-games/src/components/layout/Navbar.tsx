import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Trophy, Home, LogOut, User, Zap, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { openSettings } = useSettings();
  const [authOpen, setAuthOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/scores", label: "Leaderboard", icon: Trophy },
  ];

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              className="relative"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute -inset-2 rounded-full bg-primary/20 blur-md"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Lorapok BrainSpark"
                className="relative h-10 sm:h-12 w-auto object-contain"
                style={{ maxWidth: "180px" }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 8px rgba(124,58,237,0.5)) drop-shadow(0 0 20px rgba(124,58,237,0.2))",
                    "drop-shadow(0 0 16px rgba(124,58,237,0.8)) drop-shadow(0 0 35px rgba(124,58,237,0.35))",
                    "drop-shadow(0 0 8px rgba(124,58,237,0.5)) drop-shadow(0 0 20px rgba(124,58,237,0.2))",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.span
              className="hidden sm:flex items-center gap-1 text-[10px] font-black tracking-[0.2em] uppercase text-primary/70 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Zap className="w-2.5 h-2.5" /> v2
            </motion.span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Settings (desktop) */}
            <button
              onClick={openSettings}
              className="hidden md:flex w-8 h-8 rounded-xl hover:bg-secondary/60 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="pl-1 border-l border-border">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/40 transition-all outline-none">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.photoURL ?? undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold truncate">{user.displayName ?? "Player"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={openSettings}
                      className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-border text-sm font-medium gap-1.5"
                  onClick={() => setAuthOpen(true)}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign in</span>
                  <span className="sm:hidden">In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
