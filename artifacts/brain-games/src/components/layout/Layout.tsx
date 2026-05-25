import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { SettingsModal } from "./SettingsModal";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
      <SettingsModal />
    </div>
  );
}
