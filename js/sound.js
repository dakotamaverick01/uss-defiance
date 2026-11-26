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

// ---------- red alert klaxon ----------
// An original two-tone whoop: a buzzy rising sweep, then a short falling tail, through a
// band-pass "loudspeaker" and a short echo so it sounds like it is coming from the ship's PA.
let klaxonNodes = [];
function klaxonStop() {
  if (!AC) return; const t = AC.currentTime;
  klaxonNodes.forEach((n) => { try { if (n.gain) { n.gain.cancelScheduledValues(t); n.gain.setTargetAtTime(0.0001, t, 0.05); } else n.stop(t + 0.3); } catch (e) { /* already stopped */ } });
  klaxonNodes = [];
}
function klaxon(cycles) {
  if (!AC || !soundOn) return; klaxonStop(); cycles = cycles || 4;
  const t0 = AC.currentTime + 0.05, per = 1.25;
  const out = AC.createGain(); out.gain.value = 0.16; out.connect(master);
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.8; // small horn speaker
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260;
  const shaper = AC.createWaveShaper(); const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); } shaper.curve = curve; // gentle overdrive
  const echo = AC.createDelay(0.5); echo.delayTime.value = 0.17; const fb = AC.createGain(); fb.gain.value = 0.28; const wet = AC.createGain(); wet.gain.value = 0.35;
  shaper.connect(hp); hp.connect(bp); bp.connect(out); bp.connect(echo); echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(out);
  const env = AC.createGain(); env.gain.value = 0.0001; env.connect(shaper);
  const oA = AC.createOscillator(), oB = AC.createOscillator(); oA.type = 'sawtooth'; oB.type = 'square';
  const gB = AC.createGain(); gB.gain.value = 0.45; oA.connect(env); oB.connect(gB); gB.connect(env);
  for (let c = 0; c < cycles; c++) {
    const s = t0 + c * per;
    [[oA, 1], [oB, 1.007]].forEach(([o, k]) => {
      o.frequency.setValueAtTime(300 * k, s); o.frequency.exponentialRampToValueAtTime(690 * k, s + 0.62); // the whoop
      o.frequency.setValueAtTime(690 * k, s + 0.7); o.frequency.exponentialRampToValueAtTime(520 * k, s + 0.86); // the drop
    });
    env.gain.setValueAtTime(0.0001, s); env.gain.exponentialRampToValueAtTime(0.9, s + 0.06);
    env.gain.setValueAtTime(0.9, s + 0.8); env.gain.exponentialRampToValueAtTime(0.0001, s + 0.92);
  }
  const end = t0 + cycles * per + 0.8; oA.start(t0); oB.start(t0); oA.stop(end); oB.stop(end);
  klaxonNodes = [oA, oB, env, out];
}
