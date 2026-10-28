// USS Defiance · ui.js
// Station panels, alerts, ship actions and the HUD.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- UI ----------
const locNode = document.querySelector('.locator').firstChild; let lastLoc = 'Main Bridge';
const ui = { panel: $('panel'), title: $('p-title'), role: $('p-role'), read: $('p-read'), note: $('p-note'), acts: $('p-actions'), hint: $('hint'), reticle: $('reticle'), toast: $('toast'), chip: $('alert-chip'), seatbar: $('seatbar'), stick: $('stick'), knob: $('knob'), flash: $('flash') };
let toastTimer = 0;
function toast(msg, who) {
  ui.toast.replaceChildren();
  if (who) { const b = document.createElement('b'); b.textContent = who + ': '; ui.toast.append(b); }
  ui.toast.append(document.createTextNode(msg)); ui.toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 3600);
}
function shipTime(at) { const s = Math.floor(at); return 'T+' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
const COMMS_POOL = [
  () => ({ who: 'Convoy Lead', text: 'All three freighters reporting green. Holding formation.' }),
  () => ({ who: `${sysCur().star} relay`, text: 'Automated beacon received. No hostile traffic on the board.' }),
  () => ({ who: 'Meridian Station', text: 'Telemetry received. Good hunting, Defiance.' }),
  () => ({ who: 'Engineering', text: 'Warp core holding at 98 percent. She is ready when you are.' }),
];
let commsIdx = 0;

const STATIONS = {
  helm: { title: 'Flight', role: 'Helm and navigation', panel: () => ({
    read: [['Speed', SPEEDS[state.speed].name], ['Location', `${sysCur().star} system`], ['Destination', `${sysDest().star} · ${sysDest().heading}`], ['Inertial dampers', '100%'], ['Nacelles', state.speed === 'warp' ? 'Field at 94%' : 'Standby']],
    note: state.speed === 'warp' ? 'At warp. Drop to impulse or all stop to arrive at your destination.' : 'Pick a different destination at the situation table aft.',
    acts: [
      { label: 'All stop', on: state.speed === 'stop', fn: () => setSpeed('stop') },
      { label: 'Impulse', on: state.speed === 'impulse', fn: () => setSpeed('impulse') },
      { label: 'Engage warp', on: state.speed === 'warp', fn: () => setSpeed('warp') },
    ] }) },
  ops: { title: 'Operations', role: 'Crew, convoy and resources', panel: () => ({
    read: [['Crew aboard', '140'], ['Convoy', '3 freighters in formation'], ['Shuttles', '2 of 2 docked'], ['Stores', '86%']],
    acts: [{ label: 'Ship-wide announcement', fn: () => { beep([660, 990, 1320], 0.09, 0.05); toast('All hands, this is the captain. Stay sharp. We see the convoy home.', 'Ship-wide'); } }],
  }) },
  viewer: { title: 'Main Viewer', role: 'Forward viewscreen', panel: () => ({
    read: [['View', state.view === 'target' ? `Magnified on ${sysCur().planet}` : 'Forward'], ['Range', state.speed === 'warp' ? 'At warp' : sysCur().dist]],
    acts: [
      { label: 'Forward view', on: state.view === 'forward', fn: () => setView('forward') },
      { label: 'Magnify target', on: state.view === 'target', disabled: state.speed === 'warp', fn: () => setView('target') },
    ] }) },
  science: { title: 'Science', role: 'Sensors and analysis', panel: () => {
    const sys = sysCur(), away = state.speed === 'warp';
    return {
      read: [['Target', away ? 'None in range' : sys.planet], ['Class', away ? '—' : sys.cls], ['Atmosphere', away ? '—' : sys.atm], ['Life signs', away ? '—' : state.scanned ? sys.life : state.scanning ? 'Scanning…' : 'Scan required'], ['Distance', away ? '—' : sys.dist]],
      acts: [{ label: state.scanning ? 'Scanning…' : state.scanned ? 'Scan again' : 'Scan planet', on: state.scanning, disabled: away || state.scanning, fn: startScan }],
    }; } },
  engineering: { title: 'Engineering', role: 'Warp core and propulsion', panel: () => ({
    read: [['Warp core', state.speed === 'warp' ? '98.4% output' : '62% idle'], ['Antimatter reserve', '91%'], ['Deuterium', '88%'], ['Field coils', state.speed === 'warp' ? 'Energized' : 'Idle'], ['Injectors', '2 of 2 online'], ['Breach margin', '412%']],
    acts: [],
  }) },
  env: { title: 'Environment', role: 'Life support and bridge lighting', panel: () => ({
    read: [['Atmosphere', '21.4% O2 · 101 kPa'], ['Temperature', '21.5 °C'], ['Gravity', '1.00 g'], ['CO2 scrubbers', 'Nominal'], ['Bridge lighting', state.light[0].toUpperCase() + state.light.slice(1)]],
    acts: ['dim', 'standard', 'bright'].map((l) => ({ label: l === 'dim' ? 'Dim' : l === 'bright' ? 'Bright' : 'Standard', on: state.light === l, fn: () => setLight(l) })),
  }) },
  weapons: { title: 'Weapons Control', role: 'Beam arrays and torpedoes', panel: () => ({
    read: [['Dorsal array', state.alert === 'red' ? 'Charged' : 'Safe'], ['Ventral array', state.alert === 'red' ? 'Charged' : 'Safe'], ['Torpedo bay 1', state.alert === 'red' ? 'Loaded · 12 of 12' : '12 of 12'], ['Torpedo bay 2', state.alert === 'red' ? 'Loaded · 12 of 12' : '12 of 12'], ['Target lock', state.alert === 'red' ? 'Track 0417' : 'None']],
    note: 'Weapons readiness follows the alert condition set at Tactical.',
    acts: [],
  }) },
  ew: { title: 'Electronic Warfare', role: 'Jamming, decoys and emission control', panel: () => ({
    read: [['Emission profile', state.alert === 'red' ? 'Masked' : 'Standard'], ['Jammers', state.alert !== 'green' ? 'Armed' : 'Standby'], ['Decoys', '4 ready'], ['Threat receivers', 'All bands clear'], ['Hostile emitters', '0']],
    acts: [],
  }) },
  intel: { title: 'Intelligence', role: 'Tracking and threat assessment', panel: () => ({
    read: [['Tracked contacts', '7'], ['Friendly', '3 (convoy)'], ['Unknown', state.alert !== 'green' ? '1 · Track 0417' : '0'], ['Threat level', state.alert === 'red' ? 'High' : state.alert === 'yellow' ? 'Elevated' : 'Low'], ['Intercepts', 'None new']],
    acts: [],
  }) },
  head: { title: 'Head', role: 'Deck 1 facilities', panel: () => ({
    read: [['Water reclamation', '98.2%'], ['Stall', 'Vacant'], ['Supplies', 'Stocked']],
    note: 'Every starship has one. Somebody had to put it on the plans.',
    acts: [{ label: 'Wash up', fn: () => { whoosh(false); toast('Water reclaimed: 98.2%. You look ready for duty.', 'Head'); } }],
  }) },
  conference: { title: 'Conference Room', role: 'Senior staff briefings', panel: () => ({
    read: [['Seats', '7'], ['Briefing display', SLIDES[state.slide]], ['Viewport', state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red') ? 'Shuttered' : 'Open']],
    note: 'Walk up to the door to go in.', acts: [] }) },
  desk: { title: 'Captain’s Desk', role: 'Personal log and ship’s business', panel: () => ({
    read: [['Log entry', `${state.logIdx + 1} of ${LOG.length} · ${LOG[state.logIdx].d}`], ['Reports', state.reports ? state.reports + ' waiting for signature' : 'All signed'], ['Next briefing', '0800 · Conference room']],
    note: LOG[state.logIdx].t,
    acts: [
      { label: 'Previous entry', fn: () => { state.logIdx = (state.logIdx + LOG.length - 1) % LOG.length; renderPanel(); redrawStation('desk'); } },
      { label: 'Next entry', fn: () => { state.logIdx = (state.logIdx + 1) % LOG.length; renderPanel(); redrawStation('desk'); } },
      { label: 'Sign reports', disabled: !state.reports, fn: () => { state.reports = 0; toast('Reports signed and filed.', 'Desk'); renderPanel(); redrawStation('desk'); } },
    ] }) },
  synth: { title: 'Synthesizer', role: 'Food and beverage', panel: () => ({
    read: [['Last order', state.cup || 'None'], ['Reserve', '94%']],
    acts: [['Coffee, black', 0x2a170c], ['Tea, green', 0x7a6a2a], ['Water, cold', 0x9cc4dc]].map(([n, c]) => ({ label: n, on: state.cup === n, fn: () => { state.cup = n; cupGroup.visible = true; cupLiquid.color.setHex(c); beep([660, 990], 0.08, 0.04); toast(`${n}. Ready in the niche.`, 'Synthesizer'); renderPanel(); } }))
      .concat([{ label: 'Recycle cup', disabled: !state.cup, fn: () => { state.cup = null; cupGroup.visible = false; renderPanel(); } }]),
  }) },
  shutters: { title: 'Viewport Shutters', role: 'Armored blast shutters', panel: () => {
    const closed = state.shutters === 'closed' || (state.shutters === 'auto' && state.alert === 'red');
    return {
      read: [['Mode', state.shutters[0].toUpperCase() + state.shutters.slice(1)], ['Position', closed ? 'Closed' : 'Open']],
      note: 'In Auto the shutters close whenever the ship goes to Red Alert. They cover every viewport on this deck.',
      acts: [['auto', 'Auto'], ['open', 'Open'], ['closed', 'Close']].map(([k, n]) => ({ label: n, on: state.shutters === k, fn: () => { state.shutters = k; beep([520, 390], 0.12, 0.04); renderPanel(); } })),
    }; } },
  brief: { title: 'Briefing Display', role: 'Conference room', panel: () => ({
    read: [['Slide', `${state.slide + 1} of ${SLIDES.length} · ${SLIDES[state.slide]}`], ['Seats', '7 · display on every place']],
    acts: [
      { label: 'Previous', fn: () => setSlide(state.slide - 1) },
      { label: 'Next', fn: () => setSlide(state.slide + 1) },
    ] }) },
  honors: { title: 'Battle Honors', role: 'USS Defiance', panel: () => ({
    read: [['Year 2', 'Kessra Approach'], ['Year 2', 'Iralis Picket Line'], ['Year 3', 'The Thessaly Run'], ['Year 3', 'Okonkwo Breakout']],
    note: 'Four engagements, four convoys brought home. The crew reads the plaque on the way into every briefing.',
    acts: [] }) },
  damage: { title: 'Damage Control', role: 'Hull and structure', panel: () => ({
    read: [['Hull integrity', '100%'], ['Structural field', state.alert === 'red' ? 'Reinforced' : 'Nominal'], ['Damage reports', 'None'], ['Repair teams', state.alert === 'green' ? 'Standing down' : 'At stations']],
    note: 'Every section of the ship reports here. The grid lights up deck by deck as the sweep passes.',
    acts: [],
  }) },
  defense: { title: 'Tactical', role: 'Weapons, deflectors and alert status', panel: () => ({
    read: [['Condition', ALERTS[state.alert].label], ['Deflector', state.alert === 'green' ? 'Navigational' : 'Raised'], ['Beam arrays', state.alert === 'red' ? 'Charged' : 'Safe'], ['Torpedoes', state.alert === 'red' ? 'Loaded, 24 of 24' : '24 of 24']],
    acts: [
      { label: 'Green', on: state.alert === 'green', fn: () => setAlert('green') },
      { label: 'Yellow', on: state.alert === 'yellow', fn: () => setAlert('yellow') },
      { label: 'Red', on: state.alert === 'red', fn: () => setAlert('red') },
    ] }) },
  comms: { title: 'Communications', role: 'Subspace relay', panel: () => ({
    read: state.comms.slice(-3).reverse().map((m) => [shipTime(m.at), `${m.who}: ${m.text}`]),
    acts: [
      { label: 'Open a channel', fn: () => { const m = COMMS_POOL[commsIdx++ % COMMS_POOL.length](); state.comms.push({ at: elapsed, who: m.who, text: m.text }); beep([1200, 1600], 0.06, 0.04); renderPanel(); } },
      { label: 'Clear log', disabled: !state.comms.length, fn: () => { state.comms = []; renderPanel(); } },
    ] }) },
  command: { title: 'Command Chair', role: 'Captain’s station', panel: () => ({
    read: [['Condition', ALERTS[state.alert].label], ['Speed', SPEEDS[state.speed].name], ['Location', `${sysCur().star} system`]],
    acts: [state.sitting ? { label: 'Stand up', fn: stand } : { label: 'Take the chair', fn: sit }],
  }) },
  carto: { title: 'Situation Table', role: 'Navigation and tactical plot', panel: () => {
    const s = SYSTEMS[state.holo];
    return {
      read: [['Showing', `${s.star} system`], ['Planets', String(s.planets)], ['Survey target', s.planet], ['Heading', s.heading]],
      note: state.holo === state.cur ? 'This is the system the ship is in now.' : state.holo === state.dest ? 'This is the current destination.' : null,
      acts: [
        { label: 'Previous', fn: () => showHolo(state.holo - 1) },
        { label: 'Next', fn: () => showHolo(state.holo + 1) },
        { label: state.holo === state.dest ? 'Destination set' : 'Set as destination', on: state.holo === state.dest, disabled: state.holo === state.cur, fn: () => { state.dest = state.holo; toast(`Course laid in for ${SYSTEMS[state.dest].star}.`, 'Flight'); beep([880, 1320], 0.07, 0.04); renderPanel(); redrawAll(); } },
        { label: state.holoOn ? 'Plot off' : 'Plot on', fn: () => { state.holoOn = !state.holoOn; renderPanel(); } },
      ],
    }; } },
  ship: { title: 'USS Defiance', role: 'EV-0408 · Bastion-class heavy escort', panel: () => ({
    read: [['Roles', 'Deep-space interdiction, heavy strike, heavy escort'], ['Crew', '140'], ['Commissioned', 'Second year of the Hollow War'], ['Armament', 'Dorsal and ventral beam arrays, twin forward torpedo bays']],
    note: 'A compact hull wrapped around engines and weapons built for a ship twice her size. She runs ahead of convoys, cuts supply lines deep behind the front, and stands her ground when the line breaks.',
    acts: [],
  }) },
  lift: { title: 'Lift', role: 'Deck 1 · Main Bridge', panel: () => ({
    read: [['Current deck', 'Deck 1, Main Bridge'], ['Other decks', 'Not built yet']],
    note: 'More of the ship will open up here as we build it.',
    acts: [{ label: state.liftOpen ? 'Close doors' : 'Open doors', on: state.liftOpen, fn: () => { state.liftOpen = !state.liftOpen; renderPanel(); } }],
  }) },
  ready: { title: 'Ready Room', role: 'Captain’s office', panel: () => ({
    read: [['Inside', 'Desk, settee, synthesizer'], ['Viewport', 'Armored, shuttered at Red Alert']],
    note: 'Walk up to the door to go in.',
    acts: [],
  }) },
};

function renderPanel() {
  const id = state.open; if (!id) return;
  const st = STATIONS[id], p = st.panel();
  ui.title.textContent = st.title; ui.role.textContent = st.role;
  if (p.read.length) ui.read.replaceChildren(...p.read.flatMap(([k, v]) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; return [dt, dd]; }));
  else { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = 'Log'; dd.textContent = 'No messages.'; ui.read.replaceChildren(dt, dd); }
  ui.note.hidden = !p.note; ui.note.textContent = p.note || '';
  const focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.idx : undefined;
  ui.acts.replaceChildren(...p.acts.map((a, i) => {
    const b = document.createElement('button'); b.className = 'act' + (a.on ? ' on' : ''); b.textContent = a.label; b.disabled = !!a.disabled; b.dataset.idx = String(i); b.dataset.num = String(10 + ((id.length * 7 + i * 13) % 89)) + '-' + String(100 + i * 37);
    b.addEventListener('click', () => { beep([1046], 0.05, 0.035); a.fn(); }); return b;
  }));
  if (focused !== undefined) { const b = ui.acts.querySelector(`[data-idx="${focused}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
}
function openStation(id) { state.open = id; ui.panel.style.setProperty('--fn', FUNC_CSS[FUNC[id] || 'acc']); ui.panel.hidden = false; ui.seatbar.hidden = true; beep([880, 1175], 0.05, 0.035); renderPanel(); updateHighlights(); }
function closePanel() { state.open = null; ui.panel.hidden = true; ui.seatbar.hidden = !state.sitting; updateHighlights(); }
$('p-close').addEventListener('click', closePanel);

function setSpeed(s) {
  if (s === 'warp' && state.speed !== 'warp') {
    ui.flash.classList.remove('go'); void ui.flash.offsetWidth; if (!reduceMotion) ui.flash.classList.add('go');
    toast(`Warp engaged. Heading for ${sysDest().star}.`, 'Flight'); whoosh(true); state.view = 'forward';
  } else if (state.speed === 'warp' && s !== 'warp') whoosh(false);
  state.speed = s; if (s === 'warp') state.scanning = false;
  renderPanel(); redrawAll();
}
function redrawStation(id) { (byStation[id] || []).forEach((sc) => { if (sc.kind !== 'keys') drawScreen(sc); }); }
function setSlide(i) { state.slide = (i + SLIDES.length) % SLIDES.length; (byStation.brief || []).forEach((sc) => { if (sc.kind === 'brief') sc.title = 'Briefing · ' + SLIDES[state.slide]; }); redrawStation('brief'); renderPanel(); beep([880, 1175], 0.05, 0.03); }
function setView(v) { state.view = v; renderPanel(); drawOverlay(); }
function arrive() {
  state.cur = state.dest; state.dest = (state.cur + 1) % SYSTEMS.length; state.scanned = false; state.holo = state.cur;
  setSystem(state.cur); buildHolo(state.holo);
  state.comms.push({ at: elapsed, who: `${sysCur().star} relay`, text: `Welcome to the ${sysCur().star} system.` });
  toast(`Arrived at ${sysCur().star}. ${sysCur().planet} is ahead.`, 'Flight');
  renderPanel(); redrawAll();
}
function startScan() { state.scanning = true; state.scanT = 0; beep([1500, 1800, 2100], 0.05, 0.03); renderPanel(); redrawAll(); }
function setLight(l) { state.light = l; applyLights(); renderPanel(); }
function setAlert(a) {
  const prev = state.alert; state.alert = a; const A = ALERTS[a];
  stripMats.forEach((m) => m.color.setHex(A.strip).multiplyScalar(1.9));
  slotMats.forEach((m) => m.color.setHex(A.slot).multiplyScalar(1.35));
  MAT.wall.emissive.setHex(A.slot); ROOM_WALL_MATS.forEach((m) => m.emissive.setHex(A.slot));
  document.documentElement.style.setProperty('--signal', A.acc);
  document.documentElement.style.setProperty('--signal-rgb', A.rgb);
  ui.chip.textContent = A.label; $('alert-chip-s').textContent = A.short[0] + A.short.slice(1).toLowerCase();
  if (a === 'red' && prev !== 'red') beep([880, 660, 880, 660], 0.16, 0.05);
  if (a === 'yellow' && prev !== 'yellow') beep([740, 740], 0.14, 0.04);
  applyLights(); renderPanel(); redrawAll();
}
function applyLights() {
  const k = LIGHT_LEVELS[state.light] * (state.alert === 'red' ? 0.6 : 1), A = ALERTS[state.alert];
  fallbackApply(k, A);
  bakeLevels(k, state.alert, A.strip, 1);
  const dk = Math.min(1, 0.35 + 0.65 * k);
  lightDiscMat.color.setHex(state.alert === 'red' ? 0xff9a88 : 0xffffff).multiplyScalar(dk * 0.6);
  downlightMat.color.setHex(state.alert === 'red' ? 0xff8070 : 0xfff0dc).multiplyScalar(dk);
  poolMats.forEach((p) => { p.m.material.opacity = p.op * k; });
  renderer.toneMappingExposure = 1.1;
  if (BAKE.ok) bakeEnv(); // re-photograph the room for reflections in the new light
}
function showHolo(i) { state.holo = (i + SYSTEMS.length) % SYSTEMS.length; buildHolo(state.holo); renderPanel(); }
function sit() { state.sitting = true; closePanel(); ui.seatbar.hidden = false; }
function stand() { state.sitting = false; player.x = 0; player.z = 1.6; player.y = DAIS.h + EYE; closePanel(); }
$('stand-btn').addEventListener('click', stand);
