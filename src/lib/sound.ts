/**
 * High-fidelity Web Audio API Sound Generator for Blue Bell Mobile Shop
 * Produces crisp, celebratory bell chimes without relying on external audio assets.
 */

export function playOrderSuccessSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Celebratory 4-note ascending major chime (C5 -> E5 -> G5 -> C6)
    // Creating a resonant, premium "bell" tone matching Blue Bell Mobile
    const frequencies = [523.25, 659.25, 783.99, 1046.50];

    frequencies.forEach((freq, idx) => {
      const startTime = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with slight triangle harmonic for a rich bell timbre
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Volume envelope: instant strike, natural acoustic exponential decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  } catch (err) {
    console.warn('Audio chime playback note:', err);
  }
}
