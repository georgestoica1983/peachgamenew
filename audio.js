// audio.js - Advanced Procedural Synthesizer & Rhythm Engine for Peach Sensory Symphony

class SymphonyAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bpm = 75;
    this.isPlayingBeat = false;
    this.beatInterval = null;
    this.currentStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlayingBeat) {
      this.stopBeatLoop();
    }
    return this.isMuted;
  }

  setBPM(newBPM) {
    this.bpm = newBPM;
    if (this.isPlayingBeat) {
      this.stopBeatLoop();
      this.startBeatLoop();
    }
  }

  // --- Procedural Rhythm Percussion & Harmony ---

  playKick(time) {
    if (this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.18);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  playSnare(time) {
    if (this.isMuted) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(time);
  }

  playChordPad(step, time) {
    if (this.isMuted) return;
    // Warm morning lo-fi progression: Fmaj7 -> Cmaj7 -> Dm7 -> Gsus4
    const progressions = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [392.00, 440.00, 523.25, 587.33]  // Gsus4
    ];
    const chord = progressions[Math.floor((step / 4) % 4)];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.6);
    });
  }

  startBeatLoop() {
    if (this.isPlayingBeat) return;
    this.init();
    this.isPlayingBeat = true;

    const intervalMs = (60 / this.bpm) * 1000;
    this.beatInterval = setInterval(() => {
      if (this.isMuted) return;
      const now = this.ctx.currentTime;
      const step = this.currentStep % 16;

      // Kick on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        this.playKick(now);
      }
      // Snare on beats 2, 6, 10, 14
      if (step % 4 === 2) {
        this.playSnare(now);
      }
      // Chord pad every 4 beats
      if (step % 4 === 0) {
        this.playChordPad(step, now);
      }

      this.currentStep++;
    }, intervalMs);
  }

  stopBeatLoop() {
    this.isPlayingBeat = false;
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  // --- Hit Rating Sound Effects ---

  playPerfectHit() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(783.99, now); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.08); // C6

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playGreatHit() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playMiss() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Specialized: Pleasure Spot Shimmer Sound
  playPleasureSpotShimmer() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const sparkleFreqs = [1174.66, 1318.51, 1567.98, 1760.00];
    sparkleFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.18, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.25);
    });
  }

  // Specialized: Tongue Glide Tone
  playGlideTone(pitch = 440) {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.linearRampToValueAtTime(pitch * 1.25, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Heartbeat pulse sound
  playHeartbeat() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    [0, 0.12].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 80 : 65, now + offset);
      osc.frequency.exponentialRampToValueAtTime(36, now + offset + 0.09);

      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  // Grand Climax Victory Chime
  playVictoryFanfare() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.22, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }
}

window.symphonyAudio = new SymphonyAudioEngine();
