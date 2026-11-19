// All sound effects are synthesized on the fly with the Web Audio API --
// no external audio files are bundled, so there is nothing to license or
// mis-attribute. Each effect is a short envelope over one or two
// oscillators, tuned by ear to read as "game show" stingers.

type SfxName =
  | "buzz"
  | "armed"
  | "correct"
  | "wrong"
  | "point"
  | "qualified"
  | "eliminated"
  | "matchStart"
  | "victory"
  | "champion"
  | "tick3"
  | "tick2"
  | "tick1";

class SfxEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.5;

  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  private tone(freq: number, duration: number, opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {}) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const start = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = opts.type ?? "square";
    osc.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) osc.frequency.linearRampToValueAtTime(opts.slideTo, start + duration);
    const peak = (opts.gain ?? 0.25) * this.volume;
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  play(name: SfxName): void {
    switch (name) {
      case "buzz":
        this.tone(880, 0.09, { type: "square", gain: 0.3 });
        break;
      case "armed":
        this.tone(520, 0.12, { type: "triangle", gain: 0.2 });
        this.tone(780, 0.12, { type: "triangle", gain: 0.15, delay: 0.08 });
        break;
      case "correct":
        this.tone(520, 0.1, { type: "triangle", gain: 0.25 });
        this.tone(780, 0.12, { type: "triangle", gain: 0.25, delay: 0.1 });
        this.tone(1040, 0.16, { type: "triangle", gain: 0.25, delay: 0.2 });
        break;
      case "wrong":
        this.tone(300, 0.28, { type: "sawtooth", gain: 0.25, slideTo: 140 });
        break;
      case "point":
        this.tone(660, 0.1, { type: "square", gain: 0.2 });
        break;
      case "qualified":
        this.tone(440, 0.1, { gain: 0.22 });
        this.tone(660, 0.1, { gain: 0.22, delay: 0.09 });
        this.tone(880, 0.18, { gain: 0.22, delay: 0.18 });
        break;
      case "eliminated":
        this.tone(220, 0.4, { type: "sawtooth", gain: 0.25, slideTo: 80 });
        break;
      case "matchStart":
        this.tone(220, 0.12, { gain: 0.2 });
        this.tone(440, 0.12, { gain: 0.2, delay: 0.1 });
        this.tone(660, 0.2, { gain: 0.25, delay: 0.2 });
        break;
      case "victory":
        this.tone(523, 0.14, { gain: 0.25 });
        this.tone(659, 0.14, { gain: 0.25, delay: 0.12 });
        this.tone(784, 0.14, { gain: 0.25, delay: 0.24 });
        this.tone(1046, 0.3, { gain: 0.28, delay: 0.36 });
        break;
      case "champion":
        [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.22, { gain: 0.26, delay: i * 0.13 }));
        break;
      case "tick3":
        this.tone(440, 0.18, { type: "square", gain: 0.3 });
        break;
      case "tick2":
        this.tone(550, 0.18, { type: "square", gain: 0.32 });
        break;
      case "tick1":
        this.tone(700, 0.24, { type: "square", gain: 0.36 });
        break;
    }
  }
}

export const sfx = new SfxEngine();
