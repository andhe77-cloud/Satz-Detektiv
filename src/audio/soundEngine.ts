/**
 * Synthesized Web Audio API soundtrack & tactile SFX engine
 * with separate Music and SFX volume controls.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private stepIndex = 0;

  private musicVolume = 0.25;
  private sfxVolume = 0.55;
  private musicEnabled = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? this.musicVolume * 0.25 : 0;
      this.sfxGain.gain.value = this.sfxVolume;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public configure(opts: { musicVolume: number; sfxVolume: number; musicEnabled: boolean }) {
    this.musicVolume = opts.musicVolume;
    this.sfxVolume = opts.sfxVolume;
    this.musicEnabled = opts.musicEnabled;

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(
        this.musicEnabled ? this.musicVolume * 0.28 : 0,
        this.ctx.currentTime,
        0.08
      );
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }

    if (this.musicEnabled) {
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  public unlockAndMaybeStartMusic() {
    this.ensureContext();
    if (this.musicEnabled && this.musicTimer === null) {
      this.startMusicLoop();
    }
  }

  private startMusicLoop() {
    if (typeof window === 'undefined' || this.musicTimer !== null) return;
    // Gentle mysterious chamber motif (D Dorian lute/celesta arpeggio)
    const melody = [
      293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 349.23, 329.63,
      293.66, 349.23, 440.0, 587.33, 523.25, 440.0, 392.0, 329.63,
    ];

    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled || this.musicVolume <= 0.01) return;
      const ctx = this.ensureContext();
      if (!ctx || !this.musicGain) return;

      const freq = melody[this.stepIndex % melody.length];
      this.stepIndex++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      env.gain.setValueAtTime(0.001, now);
      env.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(env);
      env.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.45);
    }, 460);
  }

  private stopMusicLoop() {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, gainScale = 0.22) {
    if (this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.exponentialRampToValueAtTime(gainScale, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playWitnessSelect() {
    this.playTone(440, 0.09, 'triangle', 0, 0.18);
    this.playTone(554.37, 0.11, 'triangle', 0.04, 0.15);
  }

  public playMark(state: '' | 'true' | 'false') {
    if (state === 'true') {
      this.playTone(523.25, 0.1, 'sine', 0, 0.2);
      this.playTone(659.25, 0.14, 'sine', 0.05, 0.2);
    } else if (state === 'false') {
      this.playTone(329.63, 0.1, 'triangle', 0, 0.18);
      this.playTone(261.63, 0.14, 'triangle', 0.05, 0.18);
    } else {
      this.playTone(392, 0.08, 'sine', 0, 0.12);
    }
  }

  public playTilePlace() {
    this.playTone(587.33, 0.08, 'triangle', 0, 0.18);
  }

  public playTileRemove() {
    this.playTone(392.0, 0.07, 'sine', 0, 0.14);
  }

  public playHint() {
    this.playTone(523.25, 0.11, 'sine', 0, 0.16);
    this.playTone(659.25, 0.11, 'sine', 0.06, 0.16);
    this.playTone(783.99, 0.16, 'sine', 0.12, 0.18);
  }

  public playError() {
    this.playTone(246.94, 0.14, 'sawtooth', 0, 0.1);
    this.playTone(220.0, 0.18, 'sawtooth', 0.09, 0.1);
  }

  public playSolved() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', idx * 0.09, 0.22);
    });
  }
}

export const soundEngine = new SoundEngine();
