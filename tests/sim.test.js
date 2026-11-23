// Tests for js/sim.js. Run: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'sim.js'), 'utf8');
const EXPORTS = 'SIM, ARCS, ZONES, simReset, simUpdate, simStep, reactorOut, eff, zoneFactor, zoneStatus, hullIntegrity, shieldMax, shieldNow, simCanWarp, setPreset, emergencyPower, reinforceArc, sendTeam, worstZone, startDrill, stopDrill, simHit, simStats';
function load() {
  const ctx = vm.createContext({ state: { alert: 'green', speed: 'stop' }, Math, console });
  const api = vm.runInContext(SRC + `\n;({ ${EXPORTS}, get sim() { return sim; } })`, ctx);
  api.state = ctx.state;
  return api;
}
const run = (S, secs) => { for (let t = 0; t < secs; t += 0.1) S.simStep(0.1); };

test('balanced preset runs every system at full efficiency', () => {
  const S = load();
  for (const k of ['weapons', 'shields', 'engines', 'sensors']) assert.strictEqual(S.eff(k), 1);
});

test('attack preset puts weapons at 1.5', () => {
  const S = load(); S.setPreset('attack');
  assert.strictEqual(S.eff('weapons'), 1.5);
  assert.ok(Math.abs(S.eff('engines') - 0.6) < 1e-9);
});

test('shields reach full within about 4 s of yellow alert, and are down at green', () => {
  const S = load();
  assert.strictEqual(S.shieldNow('fwd'), 0);
  S.state.alert = 'yellow'; run(S, 4.1);
  for (const a of S.ARCS) assert.ok(S.shieldNow(a) >= 99.9, a + ' ' + S.shieldNow(a));
  S.state.alert = 'green'; run(S, 4.1);
  assert.strictEqual(S.shieldNow('fwd'), 0);
});

test('reinforcing an arc sets 140 there and 85 elsewhere', () => {
  const S = load(); S.reinforceArc('fwd');
  assert.strictEqual(S.shieldMax('fwd'), 140);
  assert.strictEqual(S.shieldMax('aft'), 85);
  S.reinforceArc(null);
  assert.strictEqual(S.shieldMax('fwd'), 100);
});

test('a hit larger than the arc drains it and the rest lands on a zone for that arc', () => {
  const S = load(); S.state.alert = 'red'; run(S, 4.1);
  const before = S.hullIntegrity();
  const r = S.simHit('fwd', 150);
  assert.ok(Math.abs(r.absorbed - 100) < 0.5, 'absorbed ' + r.absorbed);
  assert.ok(['prow', 'dorsal', 'ventral'].includes(r.zone), r.zone);
  assert.ok(Math.abs(S.sim.zones[r.zone] - 50) < 0.5);
  assert.ok(S.shieldNow('fwd') < 0.5);
  assert.ok(S.hullIntegrity() < before);
});

test('engines at zero with no team starts a 20 s breach that loses the ship', () => {
  const S = load(); S.sim.zones.engines = 0; S.simStep(0.1);
  assert.ok(S.sim.breach > 19 && S.sim.breach <= 20);
  run(S, 20.2);
  assert.strictEqual(S.sim.lost, true);
});

test('a team already on the engines prevents the breach', () => {
  const S = load(); S.sendTeam(0, 'engines'); run(S, 10.1);
  S.sim.zones.engines = 0; S.simStep(0.1);
  assert.strictEqual(S.sim.breach, null);
});

test('repair teams stop at 80%', () => {
  const S = load(); S.sim.zones.prow = 60; S.sendTeam(1, 'prow');
  run(S, 10); assert.ok(S.sim.zones.prow <= 60.5, 'no repair while moving');
  run(S, 40); assert.strictEqual(S.sim.zones.prow, 80);
});

test('catch-up after a long frame gap is capped at 10 ticks', () => {
  const S = load(); const n = S.simUpdate(10);
  assert.strictEqual(n, 10);
});

test('warp needs at least one nacelle above 25%', () => {
  const S = load(); assert.strictEqual(S.simCanWarp(), true);
  S.sim.zones.portNac = 20; assert.strictEqual(S.simCanWarp(), true);
  S.sim.zones.stbdNac = 20; assert.strictEqual(S.simCanWarp(), false);
});

test('engines damage cuts reactor output; emergency power boosts then penalizes', () => {
  const S = load(); S.sim.zones.engines = 50; assert.ok(S.reactorOut() < 100);
  const S2 = load(); S2.emergencyPower(); assert.ok(S2.sim.emergency.boost > 0);
  run(S2, 20.1); assert.ok(S2.reactorOut() < 100 && S2.reactorOut() >= 79);
  run(S2, 30.1); assert.strictEqual(S2.reactorOut(), 100);
});

test('drill lands hits over 60 s and then ends', () => {
  const S = load(); S.startDrill(); run(S, 61);
  assert.ok(S.sim.drill.hits >= 10, 'hits ' + S.sim.drill.hits);
  assert.strictEqual(S.sim.drill.on, false);
});
