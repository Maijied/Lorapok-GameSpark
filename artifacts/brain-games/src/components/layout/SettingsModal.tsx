import { X, Volume2, VolumeX, Smartphone, Vibrate, Download, Info, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/contexts/SettingsContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${on ? "bg-primary" : "bg-zinc-700"}`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}

export function SettingsModal() {
  const { settingsOpen, closeSettings, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled } = useSettings();
  const { canInstall, isInstalled, install } = usePWAInstall();

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={closeSettings}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: "100%", x: "-50%" }}
            animate={{ opacity: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, y: "100%", x: "-50%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed top-1/2 left-1/2 z-[101] w-full max-w-sm mx-auto"
          >
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  onClick={closeSettings}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Audio & Feedback */}
                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Audio & Feedback</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-primary" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-zinc-500" />
                        )}
                        <div>
                          <div className="font-semibold text-sm text-white">Sound Effects</div>
                          <div className="text-xs text-zinc-500">Game audio cues & music</div>
                        </div>
                      </div>
                      <Toggle on={soundEnabled} onChange={setSoundEnabled} />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Vibrate className={`w-5 h-5 ${hapticsEnabled ? "text-primary" : "text-zinc-500"}`} />
                        <div>
                          <div className="font-semibold text-sm text-white">Haptic Feedback</div>
                          <div className="text-xs text-zinc-500">Vibration on tap (mobile)</div>
                        </div>
                      </div>
                      <Toggle on={hapticsEnabled} onChange={setHapticsEnabled} />
                    </div>
                  </div>
                </section>

                {/* Install App */}
                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">App</p>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white mb-1">Install App</div>
                        <div className="text-xs text-zinc-500 leading-relaxed mb-3">
                          Add to your home screen for instant access and offline play.
                        </div>
                        {isInstalled ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Installed on this device
                          </div>
                        ) : canInstall ? (
                          <Button
                            size="sm"
                            className="h-8 text-xs font-bold gap-1.5"
                            onClick={async () => { await install(); }}
                          >
                            <Download className="w-3.5 h-3.5" /> Install Now
                          </Button>
                        ) : (
                          <div className="text-xs text-zinc-600">
                            Open in your browser's menu → "Add to Home Screen"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* About */}
                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">About</p>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="text-white font-mono">v2.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Games</span>
                      <span className="text-white font-mono">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Source</span>
                      <a
                        href="https://github.com/Maijied/Lorapok-GameSpark"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                      >
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </section>

                {/* Lorapok branding */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-800">
                  <img
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="Lorapok BrainSpark"
                    className="h-6 w-auto"
                    style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.5))" }}
                  />
                  <span className="text-xs text-zinc-600">Lorapok Labs · Bangladesh</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
