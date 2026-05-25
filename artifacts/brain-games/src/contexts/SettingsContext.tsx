import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setSoundMuted } from "@/lib/sound";

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (v: boolean) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, _setSoundEnabled] = useState(() => {
    const v = localStorage.getItem("bs_sound");
    return v === null ? true : v === "1";
  });
  const [hapticsEnabled, _setHapticsEnabled] = useState(() => {
    const v = localStorage.getItem("bs_haptics");
    return v === null ? true : v === "1";
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setSoundMuted(!soundEnabled);
  }, [soundEnabled]);

  const setSoundEnabled = (v: boolean) => {
    _setSoundEnabled(v);
    localStorage.setItem("bs_sound", v ? "1" : "0");
    setSoundMuted(!v);
  };

  const setHapticsEnabled = (v: boolean) => {
    _setHapticsEnabled(v);
    localStorage.setItem("bs_haptics", v ? "1" : "0");
  };

  return (
    <SettingsContext.Provider value={{
      soundEnabled,
      setSoundEnabled,
      hapticsEnabled,
      setHapticsEnabled,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
