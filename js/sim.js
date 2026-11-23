// USS Defiance · sim.js
// The ship as a working system: power, shields by arc, weapons, damage zones and repair teams.
// It advances on a fixed tick (a small time step, 10 per second), separate from drawing, so it keeps
// running when no screen is redrawn. Screens and panels only read `ship` and call the order functions.
// It never touches the page: crew messages go into ship.events, which ui.js turns into toasts.
// Files share one global scope and load in order (see index.html).
'use strict';

// ---------- tuning table: every starting number from the design doc lives here ----------
const SIM = {
  tick: 0.1, maxCatchUp: 1,
  reactor: 100, life: 5,
  presets: {
    balanced: { weapons: 30, shields: 30, engines: 25, sensors: 10 },
    attack: { weapons: 45, shields: 25, engines: 15, sensors: 10 },
    defend: { weapons: 20, shields: 45, engines: 20, sensors: 10 },
    speed: { weapons: 15, shields: 25, engines: 45, sensors: 10 },
  },
  effCap: 1.5,
  reactorFloor: 0.4, // reactor output with the engines zone at 0%, as a share of full
  emergency: { boost: 0.4, time: 20, penalty: 0.2, penaltyTime: 30 },
  shield: { max: 100, regen: 2, rise: 4, reinforced: 140, others: 85 },
  beam: { charge: 4 },
  torp: { perBay: 12, reload: 6 },
  repair: { rate: 1, cap: 80, move: 10, teams: 3 },
  breach: 20,
  nacelleWarpMin: 25,
  // where a hit lands, by the arc it comes through: [zone, weight]
  hitZones: {
    fwd: [['prow', 0.5], ['dorsal', 0.25], ['ventral', 0.25]],
    port: [['port', 0.55], ['portNac', 0.25], ['dorsal', 0.2]],
    stbd: [['stbd', 0.55], ['stbdNac', 0.25], ['dorsal', 0.2]],
    aft: [['engines', 0.5], ['portNac', 0.15], ['stbdNac', 0.15], ['ventral', 0.2]],
  },
  drill: { time: 60, gapMin: 2, gapMax: 3.5, dmgMin: 12, dmgMax: 26, arcs: [['fwd', 0.4], ['port', 0.2], ['stbd', 0.2], ['aft', 0.2]] },
};
const ARCS = ['fwd', 'port', 'stbd', 'aft'];
const ARC_NAMES = { fwd: 'Forward', port: 'Port', stbd: 'Starboard', aft: 'Aft' };
const ZONES = [
  { id: 'prow', name: 'Prow', short: 'PROW' },
  { id: 'dorsal', name: 'Dorsal', short: 'DORSAL' },
  { id: 'ventral', name: 'Ventral', short: 'VENTRAL' },
  { id: 'port', name: 'Port hull', short: 'PORT HULL' },
  { id: 'stbd', name: 'Starboard hull', short: 'STBD HULL' },
  { id: 'portNac', name: 'Port nacelle', short: 'PORT NAC' },
  { id: 'stbdNac', name: 'Starboard nacelle', short: 'STBD NAC' },
  { id: 'engines', name: 'Engines', short: 'ENGINES' },
];
const ZONE_NAME = Object.fromEntries(ZONES.map((z) => [z.id, z.name]));
const SYS_KEYS = ['weapons', 'shields', 'engines', 'sensors'];

let ship = null;
function simReset() {
  ship = {
    preset: 'balanced', alloc: Object.assign({}, SIM.presets.balanced),
    emergency: { boost: 0, penalty: 0 },
    shields: { up: 0, reinforce: null, arc: { fwd: 100, port: 100, stbd: 100, aft: 100 } },
    beams: { dorsal: 0, ventral: 0 },
    bays: [{ torps: SIM.torp.perBay, reload: 0, ready: false }, { torps: SIM.torp.perBay, reload: 0, ready: false }],
    zones: Object.fromEntries(ZONES.map((z) => [z.id, 100])),
    teams: Array.from({ length: SIM.repair.teams }, () => ({ at: null, to: null, t: 0 })),
    breach: null, lost: false,
    drill: { on: false, t: 0, next: 0, hits: 0 },
    hitLog: [], events: [], acc: 0, time: 0,
  };
  return ship;
}
simReset();

function say(who, text) { ship.events.push({ who, text }); }
function wpick(list) { let r = Math.random() * list.reduce((a, [, w]) => a + w, 0); for (const [v, w] of list) { r -= w; if (r <= 0) return v; } return list[list.length - 1][0]; }

// ---------- derived values ----------
function zoneFactor(id) { const z = ship.zones[id]; return z <= 0 ? 0 : z < 50 ? 0.5 : 1; }
function zoneStatus(id) { const z = ship.zones[id]; return z <= 0 ? 'off' : z < 50 ? 'alert' : z < 90 ? 'warn' : 'ok'; }
function hullIntegrity() { return ZONES.reduce((a, z) => a + ship.zones[z.id], 0) / ZONES.length; }
function reactorOut() {
  const z = ship.zones.engines / 100, base = SIM.reactor * (SIM.reactorFloor + (1 - SIM.reactorFloor) * z);
  return ship.emergency.penalty > 0 ? base * (1 - SIM.emergency.penalty) : base;
}
function eff(sys) { return Math.min(SIM.effCap, (ship.alloc[sys] * reactorOut() / SIM.reactor) / SIM.presets.balanced[sys]); }
function shieldMax(arc) { const r = ship.shields.reinforce; return r ? (r === arc ? SIM.shield.reinforced : SIM.shield.others) : SIM.shield.max; }
function shieldNow(arc) { return ship.shields.arc[arc] * ship.shields.up; }
function shieldRegen(arc) {
  const emit = arc === 'port' ? zoneFactor('port') : arc === 'stbd' ? zoneFactor('stbd') : 1;
  return SIM.shield.regen * eff('shields') * emit * (ship.emergency.boost > 0 ? 1 + SIM.emergency.boost : 1);
}
function simCanWarp() { return ship.zones.portNac > SIM.nacelleWarpMin || ship.zones.stbdNac > SIM.nacelleWarpMin; }
function beamStrength(which) { return zoneFactor(which) * Math.min(1, eff('weapons')); }
function torpsLeft() { return ship.bays[0].torps + ship.bays[1].torps; }
function maxImpulse() { return zoneFactor('engines') * Math.min(1, eff('engines')); }
function worstZone(exclude) {
  const ex = new Set(exclude || []);
  return ZONES.filter((z) => !ex.has(z.id) && ship.zones[z.id] < SIM.repair.cap).sort((a, b) => ship.zones[a.id] - ship.zones[b.id])[0] || null;
}
function simStats() { return { hull: hullIntegrity(), reactor: reactorOut(), shields: ARCS.map(shieldNow), torps: torpsLeft() }; }

// ---------- orders ----------
function setPreset(name) { if (!SIM.presets[name]) return; ship.preset = name; ship.alloc = Object.assign({}, SIM.presets[name]); }
function emergencyPower() {
  if (ship.emergency.boost > 0 || ship.emergency.penalty > 0) return false;
  ship.emergency.boost = SIM.emergency.time; return true;
}
function reinforceArc(arc) {
  ship.shields.reinforce = arc || null;
  ARCS.forEach((a) => { ship.shields.arc[a] = Math.min(ship.shields.arc[a], shieldMax(a)); });
}
function sendTeam(i, zoneId) {
  const tm = ship.teams[i]; if (!tm || !ship.zones.hasOwnProperty(zoneId)) return false;
  if (tm.at === zoneId || tm.to === zoneId) return false;
  tm.at = null; tm.to = zoneId; tm.t = SIM.repair.move; return true;
}
function startDrill() {
  ship.drill = { on: true, t: SIM.drill.time, next: 1.5, hits: 0 };
  ship.events.push({ alert: 'red' });
  say('Tactical', 'Combat drill. Simulated fire incoming for sixty seconds.');
}
function stopDrill(quiet) { if (!ship.drill.on) return; ship.drill.on = false; if (!quiet) say('Tactical', `Drill complete. ${ship.drill.hits} hits taken, hull at ${Math.round(hullIntegrity())}%.`); }

// A hit through one arc: the shield on that arc absorbs what it can, the rest damages a zone behind it.
function simHit(arc, dmg) {
  const cap = shieldNow(arc), absorbed = Math.min(cap, dmg), rest = dmg - absorbed;
  if (ship.shields.up > 0 && absorbed > 0) ship.shields.arc[arc] = Math.max(0, ship.shields.arc[arc] - absorbed / ship.shields.up);
  let zone = null;
  if (rest > 0.01) { zone = wpick(SIM.hitZones[arc]); ship.zones[zone] = Math.max(0, ship.zones[zone] - rest); }
  ship.hitLog.push({ at: ship.time, arc, dmg, absorbed, zone, rest });
  if (ship.hitLog.length > 12) ship.hitLog.shift();
  return { absorbed, zone, rest };
}

// ---------- the tick ----------
function simStep(dt) {
  ship.time += dt;
  const alert = state.alert, up = alert !== 'green';
  // shields rise or fall over SIM.shield.rise seconds; arcs regenerate only while raised
  ship.shields.up = Math.min(1, Math.max(0, ship.shields.up + (up ? 1 : -1) * dt / SIM.shield.rise));
  if (up) ARCS.forEach((a) => { ship.shields.arc[a] = Math.min(shieldMax(a), ship.shields.arc[a] + shieldRegen(a) * dt); });
  // emergency power: boost, then a reactor penalty
  if (ship.emergency.boost > 0) { ship.emergency.boost -= dt; if (ship.emergency.boost <= 0) { ship.emergency.boost = 0; ship.emergency.penalty = SIM.emergency.penaltyTime; say('Engineering', 'Emergency power spent. Reactor recovering.'); } }
  else if (ship.emergency.penalty > 0) { ship.emergency.penalty = Math.max(0, ship.emergency.penalty - dt); if (!ship.emergency.penalty) say('Engineering', 'Reactor back to full output.'); }
  // beams charge at red alert, drain to safe otherwise; torpedoes load at red
  const red = alert === 'red';
  ['dorsal', 'ventral'].forEach((b) => {
    const rate = beamStrength(b) / SIM.beam.charge;
    ship.beams[b] = red ? Math.min(1, ship.beams[b] + rate * dt) : Math.max(0, ship.beams[b] - dt / 2);
  });
  const bayRate = 1 / (SIM.torp.reload / Math.max(0.25, zoneFactor('prow')));
  ship.bays.forEach((bay) => {
    if (!red || bay.torps <= 0) { bay.ready = false; bay.reload = 0; return; }
    if (!bay.ready) { bay.reload += bayRate * dt; if (bay.reload >= 1) { bay.ready = true; bay.reload = 1; } }
  });
  // repair teams move, then repair up to the field cap
  ship.teams.forEach((tm, i) => {
    if (tm.to) { tm.t -= dt; if (tm.t <= 0) { tm.at = tm.to; tm.to = null; tm.t = 0; say('Damage Control', `Team ${i + 1} on station: ${ZONE_NAME[tm.at]}.`); } }
    else if (tm.at && ship.zones[tm.at] < SIM.repair.cap) ship.zones[tm.at] = Math.min(SIM.repair.cap, ship.zones[tm.at] + SIM.repair.rate * dt);
  });
  // reactor breach: engines zone at 0 with nobody there
  const teamOnEngines = ship.teams.some((tm) => tm.at === 'engines');
  if (ship.zones.engines <= 0 && !teamOnEngines && !ship.lost) {
    if (ship.breach === null) { ship.breach = SIM.breach; say('Engineering', 'Containment failing! Core breach in twenty seconds. Get a team to the engines!'); }
    else { ship.breach -= dt; if (ship.breach <= 0) { ship.breach = 0; ship.lost = true; ship.drill.on = false; say('Engineering', 'Core breach.'); } }
  } else if (ship.breach !== null && !ship.lost) { ship.breach = null; say('Engineering', 'Containment holding. Breach averted.'); }
  // combat drill: simulated hits on random arcs
  if (ship.drill.on && !ship.lost) {
    ship.drill.t -= dt; ship.drill.next -= dt;
    if (ship.drill.next <= 0) {
      const d = SIM.drill, arc = wpick(d.arcs), r = simHit(arc, d.dmgMin + Math.random() * (d.dmgMax - d.dmgMin));
      ship.drill.hits++; ship.drill.next = d.gapMin + Math.random() * (d.gapMax - d.gapMin);
      if (r.zone && r.rest > 4) say('Damage Control', `Hit through the ${ARC_NAMES[arc].toLowerCase()} arc. ${ZONE_NAME[r.zone]} at ${Math.round(ship.zones[r.zone])}%.`);
    }
    if (ship.drill.t <= 0) stopDrill();
  }
}
// Called once per frame with the frame time; runs whole ticks and never more than one second of catch-up.
function simUpdate(dt) {
  ship.acc = Math.min(ship.acc + dt, SIM.maxCatchUp);
  let n = 0; while (ship.acc >= SIM.tick - 1e-9) { ship.acc -= SIM.tick; simStep(SIM.tick); n++; }
  return n;
}
