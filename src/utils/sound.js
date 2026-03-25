function createTone(audioContext, options) {
  const {
    frequency,
    duration = 0.18,
    type = 'sine',
    volume = 0.04,
    attack = 0.01,
    release = 0.12,
    frequencyEnd,
  } = options;

  const startTime = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  if (frequencyEnd) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(0.001, frequencyEnd),
      startTime + duration,
    );
  }

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, startTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + release + 0.02);
}

export function createSoundPlayer() {
  let audioContext = null;

  const getContext = async () => {
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return null;
      }
    }

    return audioContext;
  };

  const playSequence = async (tones) => {
    const context = await getContext();
    if (!context) return;

    let offset = 0;
    tones.forEach((tone) => {
      window.setTimeout(() => {
        createTone(context, tone);
      }, offset);
      offset += tone.delay ?? 90;
    });
  };

  return {
    unlock: () => getContext(),
    click: () =>
      playSequence([
        { frequency: 440, frequencyEnd: 520, type: 'triangle', duration: 0.07, volume: 0.025, delay: 0 },
      ]),
    start: () =>
      playSequence([
        { frequency: 392, frequencyEnd: 523, type: 'triangle', duration: 0.09, volume: 0.03, delay: 0 },
        { frequency: 523, frequencyEnd: 659, type: 'triangle', duration: 0.1, volume: 0.03, delay: 110 },
      ]),
    success: () =>
      playSequence([
        { frequency: 523, frequencyEnd: 659, type: 'sine', duration: 0.08, volume: 0.03, delay: 0 },
        { frequency: 659, frequencyEnd: 784, type: 'sine', duration: 0.1, volume: 0.03, delay: 100 },
      ]),
    error: () =>
      playSequence([
        { frequency: 320, frequencyEnd: 240, type: 'sawtooth', duration: 0.12, volume: 0.025, delay: 0 },
      ]),
    win: () =>
      playSequence([
        { frequency: 523, frequencyEnd: 659, type: 'triangle', duration: 0.1, volume: 0.04, delay: 0 },
        { frequency: 659, frequencyEnd: 784, type: 'triangle', duration: 0.12, volume: 0.04, delay: 120 },
        { frequency: 784, frequencyEnd: 1046, type: 'triangle', duration: 0.16, volume: 0.04, delay: 150 },
      ]),
    nextLevel: () =>
      playSequence([
        { frequency: 587, frequencyEnd: 740, type: 'triangle', duration: 0.09, volume: 0.03, delay: 0 },
        { frequency: 740, frequencyEnd: 988, type: 'triangle', duration: 0.12, volume: 0.03, delay: 100 },
      ]),
  };
}
