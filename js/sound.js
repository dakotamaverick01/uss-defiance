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
// ---------- Stage 7: layered positional sound ----------
const soundSources = [];
function addPositional(x, y, z, type, baseVol) {
  if (!AC) return;
  const panner = AC.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1.5;
  panner.maxDistance = 12;
  panner.rolloffFactor = 1.2;
  panner.setPosition(x, y, z);
  const g = AC.createGain(); g.gain.value = baseVol || 0.04;
  g.connect(panner); panner.connect(master);
  soundSources.push({ panner, g, type, x, y, z });
  return { panner, g };
}
function startLayered() {
  if (!AC || window._layered) return;
  window._layered = true;
  // Room tone already exists. Add ventilation near ceiling, relays near consoles, door actuators.
  // Ventilation (low noise, ceiling)
  const vent = addPositional(0, 3.0, 0, 'vent', 0.03);
  if (vent) {
    const n = AC.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 280;
    n.connect(f); f.connect(vent.g); n.start();
  }
  // Relay clicks near ops console
  const relay = addPositional(1.4, 1.0, -3.0, 'relay', 0.02);
  // Door actuator near ready room door
  const door = addPositional(3.2, 1.2, 4.8, 'door', 0.015);
  // Console chirps near helm
  const chirpSrc = addPositional(0, 1.0, -4.0, 'chirp', 0.025);
  // Update positions relative to listener each frame (listener follows camera)
  window._soundUpdate = (cam) => {
    if (!AC || !soundOn) return;
    const lx = cam.position.x, ly = cam.position.y, lz = cam.position.z;
    if (AC.listener.positionX) {
      AC.listener.positionX.value = lx; AC.listener.positionY.value = ly; AC.listener.positionZ.value = lz;
    } else {
      AC.listener.setPosition(lx, ly, lz);
    }
  };
}
// Hook into init
const _origInit = initAudio;
initAudio = function () {
  _origInit();
  if (AC) startLayered();
};
