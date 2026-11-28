// USS Defiance · perf.js
// A small performance readout, opened with the P key (or a #perf address): frames per second, frame time (average
// and the slowest frame each second), the graphics chip and the render size, plus switches for the expensive parts of
// the picture so their cost can be seen live on the machine at hand. Choices are remembered in this browser.
// Files share one global scope and load in order (see index.html); this one loads last.
'use strict';
(function () {
  const KEY = 'defiance-perf', DPR = Math.min(window.devicePixelRatio || 1, 2);
  const opt = Object.assign({ res: 'standard', ao: false, aa: true, screens: 'normal' }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(opt)); } catch (e) { /* storage may be unavailable */ } };
  // settings version 2 (Nov 27): edge smoothing on by default. It costs little frame rate on a desktop and looks much
  // better, so a choice saved under the old settings (often switched off while testing) is reset to on, once.
  if ((opt.v || 1) < 2) { opt.aa = true; opt.v = 2; save(); }
  const RES = { full: DPR, standard: 1, low: 0.75 };
  // Quality presets (roadmap F5). Phone and Desktop are the settings each already had; Cinematic turns everything up and
  // uses the full exterior model outside Deck 2's windows. The switches below still fine-tune a preset.
  const TIERS = {
    phone: { res: 'standard', ao: false, aa: false, screens: 'normal' },
    desktop: { res: 'standard', ao: false, aa: true, screens: 'normal' },
    cinematic: { res: 'full', ao: true, aa: true, screens: 'smooth' },
  };
  opt.quality = QUALITY.tier;
  function setTier(t) { QUALITY.tier = opt.quality = t; Object.assign(opt, TIERS[t]); if (typeof extRebuild === 'function') extRebuild(); }
  function apply() {
    // edge smoothing first: changing it rebuilds the composer's buffers, and resize() re-flags the new ones
    if (composer && 'multisampling' in composer && !isMobile) { const ms = opt.aa ? 4 : 0; if (composer.multisampling !== ms) composer.multisampling = ms; }
    if (aoPass) aoPass.enabled = !!opt.ao;
    renderer.setPixelRatio(Math.min(RES[opt.res] || DPR, DPR)); resize();
    PERF_OPT.screens = opt.screens === 'smooth' ? (isMobile ? 4 : 8) : (isMobile ? 2 : 4);
  }
  apply();

  // the panel
  const css = document.createElement('style');
  css.textContent = `#perf{position:fixed;left:12px;top:12px;z-index:50;background:rgba(0,0,0,.82);color:#F2E6D0;font:13px/1.35 system-ui,sans-serif;border:2px solid #E8A06A;border-radius:14px;padding:10px 12px;width:290px;max-width:calc(100vw - 24px)}
#perf[hidden]{display:none}#perf h2{margin:0 0 4px;font:600 15px Antonio,'Arial Narrow',sans-serif;letter-spacing:.06em;color:#E8A06A}#perf .big{font:600 30px Antonio,'Arial Narrow',sans-serif;color:#F2C88F}
#perf .row{display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap}#perf .row span{flex:1 0 100%;color:#D9B07E}#perf button{min-height:36px;padding:0 10px;border-radius:18px;border:0;background:#3a2f44;color:#F2E6D0;font:inherit;cursor:pointer}
#perf button.on{background:#E8A06A;color:#000}#perf small{color:#b9a98f;display:block;margin-top:6px;word-break:break-word}#perf table{width:100%;border-collapse:collapse;margin-top:6px;font-size:12px}#perf td{padding:2px 4px;border-top:1px solid #3a2f44}#perf td+td{text-align:right}#perf .x{position:absolute;right:8px;top:6px;min-height:28px;background:none;color:#E8A06A}`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'perf'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Performance');
  el.innerHTML = `<button class="x" aria-label="Close">✕</button><h2>PERFORMANCE · P TO CLOSE</h2><div><span class="big" id="pf-fps">--</span> fps &nbsp; <span id="pf-ms">--</span></div><div id="pf-calls">--</div>
<div class="row"><span>Quality</span></div><div class="row" data-k="quality"></div>
<div class="row"><span>Resolution</span></div><div class="row" data-k="res"></div>
<div class="row"><span>Soft contact shadows</span></div><div class="row" data-k="ao"></div>
<div class="row"><span>Edge smoothing</span></div><div class="row" data-k="aa"></div>
<div class="row"><span>Display updates</span></div><div class="row" data-k="screens"></div>
<div class="row"><button id="pf-test">Run speed test (stand still, ~20 s)</button></div><div id="pf-res"></div><small id="pf-info"></small>`;
  document.body.appendChild(el);
  const CH = {
    quality: [['phone', 'Phone'], ['desktop', 'Desktop'], ['cinematic', 'Cinematic']],
    res: [['full', `Sharp ×${DPR}`], ['standard', 'Standard ×1'], ['low', 'Low ×0.75']],
    ao: [[true, 'On'], [false, 'Off']], aa: [[true, 'On'], [false, 'Off']], screens: [['normal', 'Normal'], ['smooth', 'Smoother']],
  };
  const draw = () => el.querySelectorAll('.row[data-k]').forEach((r) => { const k = r.dataset.k; r.replaceChildren(...CH[k].map(([v, t]) => {
    const b = document.createElement('button'); b.textContent = t; b.className = opt[k] === v ? 'on' : ''; b.disabled = (k === 'ao' && !aoPass) || (k === 'aa' && (isMobile || !composer));
    b.addEventListener('click', () => { if (k === 'quality') setTier(v); else opt[k] = v; save(); apply(); draw(); info(); canvas.focus({ preventScroll: true }); }); return b; })); });
  const gpu = (() => { try { const gl = renderer.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return 'unknown'; } })();
  const info = () => { const pr = renderer.getPixelRatio(); $('pf-info').textContent = `Graphics: ${gpu} · window ${innerWidth}×${innerHeight} · drawing ${Math.round(innerWidth * pr)}×${Math.round(innerHeight * pr)} · post: ${POST.kind}`; };
  draw(); info();
  const toggle = (on) => { el.hidden = on === undefined ? !el.hidden : !on; if (!el.hidden) info(); };
  el.querySelector('.x').addEventListener('click', () => toggle(false));
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyP' && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) toggle(); });
  if (location.hash === '#perf') toggle(true);

  // frame timing: frames per second and the average and slowest frame over the last second
  // draw calls and triangles per frame: the renderer's counters add up over a whole frame (every pass, the viewscreen,
  // the screens) and are read and cleared here once a frame
  renderer.info.autoReset = false;
  let last = performance.now(), n = 0, sum = 0, worst = 0, acc = 0, cpuSum = 0, calls = 0, tris = 0;
  const tick = () => { const now = performance.now(), dt = now - last; last = now; n++; sum += dt; cpuSum += PERF_OPT.cpu; worst = Math.max(worst, dt); acc += dt;
    calls += renderer.info.render.calls; tris += renderer.info.render.triangles; renderer.info.reset();
    if (acc >= 1000) { if (!el.hidden) { $('pf-fps').textContent = Math.round(n * 1000 / acc); $('pf-ms').textContent = `${(sum / n).toFixed(1)} ms avg · ${worst.toFixed(0)} ms slowest · processor ${(cpuSum / n).toFixed(1)} ms`; $('pf-calls').textContent = `${Math.round(calls / n)} draw calls · ${Math.round(tris / n / 1000)}k triangles a frame · Deck ${LIFT.deck}`; } cpuSum = 0; calls = 0; tris = 0; n = 0; sum = 0; worst = 0; acc = 0; }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);

  // speed test: measure a couple of seconds with each expensive part switched off in turn, so the slow part shows itself.
  // Frame rates snap to the screen's refresh steps (60, 30, 20...), so a part that frees just enough time jumps a step.
  const measure = (ms) => new Promise((res) => { let t0 = 0, k = 0, s = 0, w = 0, c = 0, prev = 0;
    const f = (now) => { if (!t0) { t0 = prev = now; } else { const d = now - prev; prev = now; k++; s += d; w = Math.max(w, d); c += PERF_OPT.cpu; }
      if (now - t0 < ms) requestAnimationFrame(f); else res({ fps: k * 1000 / (now - t0), avg: s / k, worst: w, cpu: c / k }); };
    requestAnimationFrame(f); });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function speedTest() {
    const btn = $('pf-test'); btn.disabled = true; const keep = Object.assign({}, opt), out = [];
    const cases = [
      ['Your settings', () => {}],
      ['Edge smoothing off', () => { opt.aa = false; }],
      ['Viewscreen paused', () => { PERF_OPT.viewscreen = false; }],
      ['Displays paused', () => { PERF_OPT.screens = 0; }],
      ['Low ×0.75', () => { opt.res = 'low'; }],
      ['All four', () => { opt.aa = false; opt.res = 'low'; PERF_OPT.viewscreen = false; PERF_OPT.screens = 0; }],
    ];
    for (const [name, set] of cases) {
      btn.textContent = `Testing: ${name}…`; Object.assign(opt, keep); apply(); PERF_OPT.viewscreen = true; set(); if (name !== 'Your settings') { const v = PERF_OPT.viewscreen, sc = PERF_OPT.screens; apply(); PERF_OPT.viewscreen = v; if (sc === 0) PERF_OPT.screens = 0; }
      await wait(800); out.push([name, await measure(2200)]);
    }
    Object.assign(opt, keep); PERF_OPT.viewscreen = true; apply(); save();
    $('pf-res').innerHTML = '<table><tr><td>Test</td><td>fps</td><td>ms</td><td>proc.</td></tr>' + out.map(([nm, r]) => `<tr><td>${nm}</td><td>${Math.round(r.fps)}</td><td>${r.avg.toFixed(1)}</td><td>${r.cpu.toFixed(1)}</td></tr>`).join('') + '</table>';
    btn.textContent = 'Run speed test again'; btn.disabled = false; info();
    window.DEFIANCE_PERF.last = out;
  }
  $('pf-test').addEventListener('click', speedTest);
  window.DEFIANCE_PERF = { opt, apply, speedTest };
})();
