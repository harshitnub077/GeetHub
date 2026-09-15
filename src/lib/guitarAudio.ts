/**
 * guitarAudio.ts
 * Real-time Web Audio API synthesizer for GeetHub.
 * Synthesizes guitar string vibrations, chord strumming, arpeggios,
 * and pitch-perfect tuning reference tones.
 */

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.85;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMasterVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getMasterVolume(): number {
    return this.volume;
  }

  // Converts note name + octave (e.g. "E2", "A2", "D3", "G3", "B3", "E4") to Hz frequency
  noteToFreq(note: string, octave: number = 4): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatMap: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
    const cleanNote = flatMap[note] || note;
    const semitone = notes.indexOf(cleanNote);
    if (semitone === -1) return 440;
    // A4 = 440Hz, note index 9 in octave 4
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Plays a single plucked guitar string note
  playPluck(freq: number, duration: number = 1.6, startTime?: number) {
    if (typeof window === 'undefined') return;
    const ctx = this.getContext();
    const t = startTime || ctx.currentTime;

    // Dual oscillator for rich harmonic acoustic body sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.002, t); // subtle chorusing

    // Dynamic lowpass filter to mimic acoustic body resonance
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 5, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, t + duration);

    // Amplitude envelope with sharp attack and natural acoustic string decay
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Strums a 6-string guitar chord voicing: array of fret numbers [-1, 0, 2, 2, 1, 0]
  // Standard tuning strings: E2 (82.41Hz), A2 (110Hz), D3 (146.83Hz), G3 (196Hz), B3 (246.94Hz), E4 (329.63Hz)
  strumVoicing(frets: number[], downstroke: boolean = true) {
    if (typeof window === 'undefined') return;
    const ctx = this.getContext();
    const baseFreqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];
    const order = downstroke ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];

    order.forEach((stringIndex, i) => {
      const fret = frets[stringIndex];
      if (fret !== undefined && fret >= 0) {
        const base = baseFreqs[stringIndex];
        const freq = base * Math.pow(2, fret / 12);
        const delay = ctx.currentTime + i * 0.035; // 35ms stagger for natural human strum
        this.playPluck(freq, 2.0, delay);
      }
    });
  }

  // Plays an arpeggio sequence of frets or frequencies
  playArpeggio(frets: number[], bpm: number = 100) {
    if (typeof window === 'undefined') return;
    const ctx = this.getContext();
    const baseFreqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];
    const stepDuration = 60 / bpm / 2; // eighth notes

    let noteCount = 0;
    frets.forEach((fret, stringIndex) => {
      if (fret >= 0) {
        const base = baseFreqs[stringIndex];
        const freq = base * Math.pow(2, fret / 12);
        const time = ctx.currentTime + noteCount * stepDuration;
        this.playPluck(freq, 1.8, time);
        noteCount++;
      }
    });
  }

  // Generates clean metronome click
  playClick(accent: boolean = false) {
    if (typeof window === 'undefined') return;
    const ctx = this.getContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1600 : 880, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const guitarAudio = new GuitarAudioEngine();
