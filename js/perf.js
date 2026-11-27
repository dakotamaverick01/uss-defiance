// USS Defiance · perf.js
// A small performance readout, opened with the P key (or a #perf address): frames per second, frame time (average
// and the slowest frame each second), the graphics chip and the render size, plus switches for the expensive parts of
// the picture so their cost can be seen live on the machine at hand. Choices are remembered in this browser.
// Files share one global scope and load in order (see index.html); this one loads last.
'use strict';
(function () {
  const KEY = 'defiance-perf', DPR = Math.min(window.devicePixelRatio || 1, 2);
  const opt = Object.assign({ res: 'full', ao: true, aa: true, screens: 'normal' }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(opt)); } catch (e) { /* storage may be unavailable */ } };
  const RES = { full: DPR, standard: 1, low: 0.75 };
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
#perf button.on{background:#E8A06A;color:#000}#perf small{color:#b9a98f;display:block;margin-top:6px;word-break:break-word}#perf .x{position:absolute;right:8px;top:6px;min-height:28px;background:none;color:#E8A06A}`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'perf'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Performance');
  el.innerHTML = `<button class="x" aria-label="Close">✕</button><h2>PERFORMANCE · P TO CLOSE</h2><div><span class="big" id="pf-fps">--</span> fps &nbsp; <span id="pf-ms">--</span></div>
<div class="row"><span>Resolution</span></div><div class="row" data-k="res"></div>
<div class="row"><span>Soft contact shadows</span></div><div class="row" data-k="ao"></div>
<div class="row"><span>Edge smoothing</span></div><div class="row" data-k="aa"></div>
<div class="row"><span>Display updates</span></div><div class="row" data-k="screens"></div><small id="pf-info"></small>`;
  document.body.appendChild(el);
  const CH = {
    res: [['full', `Sharp ×${DPR}`], ['standard', 'Standard ×1'], ['low', 'Low ×0.75']],
    ao: [[true, 'On'], [false, 'Off']], aa: [[true, 'On'], [false, 'Off']], screens: [['normal', 'Normal'], ['smooth', 'Smoother']],
  };
  const draw = () => el.querySelectorAll('.row[data-k]').forEach((r) => { const k = r.dataset.k; r.replaceChildren(...CH[k].map(([v, t]) => {
    const b = document.createElement('button'); b.textContent = t; b.className = opt[k] === v ? 'on' : ''; b.disabled = (k === 'ao' && !aoPass) || (k === 'aa' && (isMobile || !composer));
    b.addEventListener('click', () => { opt[k] = v; save(); apply(); draw(); info(); canvas.focus({ preventScroll: true }); }); return b; })); });
  const gpu = (() => { try { const gl = renderer.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return 'unknown'; } })();
  const info = () => { const pr = renderer.getPixelRatio(); $('pf-info').textContent = `Graphics: ${gpu} · window ${innerWidth}×${innerHeight} · drawing ${Math.round(innerWidth * pr)}×${Math.round(innerHeight * pr)} · post: ${POST.kind}`; };
  draw(); info();
  const toggle = (on) => { el.hidden = on === undefined ? !el.hidden : !on; if (!el.hidden) info(); };
  el.querySelector('.x').addEventListener('click', () => toggle(false));
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyP' && !e.repeat && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) toggle(); });
  if (location.hash === '#perf') toggle(true);

  // frame timing: frames per second and the average and slowest frame over the last second
  let last = performance.now(), n = 0, sum = 0, worst = 0, acc = 0;
  const tick = () => { const now = performance.now(), dt = now - last; last = now; n++; sum += dt; worst = Math.max(worst, dt); acc += dt;
    if (acc >= 1000) { if (!el.hidden) { $('pf-fps').textContent = Math.round(n * 1000 / acc); $('pf-ms').textContent = `${(sum / n).toFixed(1)} ms avg · ${worst.toFixed(0)} ms slowest`; } n = 0; sum = 0; worst = 0; acc = 0; }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  window.DEFIANCE_PERF = { opt, apply };
})();
