// USS Defiance · sound.js
// Synthesised ambience and interface sounds (Web Audio, no files).
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- sound ----------
let AC = null, master = null, soundOn = true, noiseBuf = null, nextChirp = 4;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
  try {
    AC = new Ctx(); master = AC.createGain(); master.gain.value = soundOn ? 0.7 : 0; master.connect(AC.destination);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360; lp.connect(master);
    [[50, 0.055], [100.3, 0.024], [150.2, 0.009]].forEach(([f, gv]) => { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = AC.createGain(); g.gain.value = gv; o.connect(g); g.connect(lp); o.start(); });
    const len = AC.sampleRate * 4; noiseBuf = AC.createBuffer(1, len, AC.sampleRate); const d = noiseBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const nf = AC.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 480; const ng = AC.createGain(); ng.gain.value = 0.07;
    n.connect(nf); nf.connect(ng); ng.connect(master); n.start();
    $('sound-btn').hidden = false;
  } catch (e) { AC = null; }
}
function beep(freqs, dur, vol) {
  if (!AC || !soundOn) return; const t0 = AC.currentTime; dur = dur || 0.07; vol = vol || 0.05;
  freqs.forEach((f, i) => {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + i * dur); g.gain.linearRampToValueAtTime(vol, t0 + i * dur + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
    o.connect(g); g.connect(master); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.03);
  });
}
function whoosh(up) {
  if (!AC || !soundOn || !noiseBuf) return; const t0 = AC.currentTime;
  const n = AC.createBufferSource(); n.buffer = noiseBuf; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2;
  bp.frequency.setValueAtTime(up ? 180 : 1800, t0); bp.frequency.exponentialRampToValueAtTime(up ? 2400 : 160, t0 + 1.4);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
  n.connect(bp); bp.connect(g); g.connect(master); n.start(t0); n.stop(t0 + 1.7);
}
$('sound-btn').addEventListener('click', () => {
  soundOn = !soundOn; if (master) master.gain.value = soundOn ? 0.7 : 0;
  $('sound-btn').setAttribute('aria-pressed', String(soundOn));
  if (soundOn) { $('snd-wave').removeAttribute('hidden'); $('snd-off').setAttribute('hidden', ''); } else { $('snd-wave').setAttribute('hidden', ''); $('snd-off').removeAttribute('hidden'); }
});
