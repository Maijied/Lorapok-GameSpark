let ctx: AudioContext | null = null;
let _muted = false;

export function setSoundMuted(muted: boolean) {
  _muted = muted;
}

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

function tone(
  freq: number,
  type: OscillatorType,
  duration: number,
  vol = 0.12,
  delay = 0,
) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.01);
  } catch {
    // Audio blocked or unsupported — fail silently
  }
}

export function playFlip() {
  tone(480, "sine", 0.07, 0.08);
}

export function playMatch() {
  tone(523, "sine", 0.1, 0.12);
  tone(659, "sine", 0.12, 0.12, 0.09);
}

export function playCombo() {
  tone(523, "sine", 0.08, 0.15);
  tone(659, "sine", 0.08, 0.15, 0.07);
  tone(784, "sine", 0.08, 0.15, 0.14);
  tone(1047, "sine", 0.18, 0.15, 0.21);
}

export function playWrong() {
  tone(220, "sawtooth", 0.18, 0.1);
  tone(180, "sawtooth", 0.18, 0.08, 0.1);
}

export function playCorrect() {
  tone(659, "sine", 0.09, 0.12);
  tone(880, "sine", 0.12, 0.12, 0.09);
}

export function playVictory() {
  [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, "sine", 0.3, 0.15, i * 0.1),
  );
}

export function playTick() {
  tone(1200, "sine", 0.03, 0.06);
}

export function playTileClick() {
  tone(600, "sine", 0.05, 0.07);
}

export function playHint() {
  tone(880, "sine", 0.06, 0.1);
  tone(1100, "sine", 0.08, 0.1, 0.07);
}
