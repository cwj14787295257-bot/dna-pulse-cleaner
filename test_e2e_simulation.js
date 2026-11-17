const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('====================================================');
console.log(' RUNNING DNA PULSE CLEANER E2E SIMULATION TEST SUITE');
console.log('====================================================\n');

// 1. Build Mock Browser DOM Environment
function createMockEnvironment() {
  const elements = {};
  const eventListeners = {};

  class MockClassList {
    constructor() {
      this.classes = new Set();
    }
    add(c) { this.classes.add(c); }
    remove(c) { this.classes.delete(c); }
    contains(c) { return this.classes.has(c); }
    toggle(c, force) {
      if (force === true) { this.classes.add(c); return true; }
      if (force === false) { this.classes.delete(c); return false; }
      if (this.classes.has(c)) { this.classes.delete(c); return false; }
      this.classes.add(c); return true;
    }
  }

  class MockElement {
    constructor(id, tagName = 'div') {
      this.id = id;
      this.tagName = tagName.toUpperCase();
      this.style = {};
      this.classList = new MockClassList();
      this.innerText = '';
      this.innerHTML = '';
      this.value = '';
      this.checked = true;
      this.disabled = false;
      this.width = 800;
      this.height = 200;
      this.children = [];
      this.parentElement = {
        getBoundingClientRect: () => ({ width: 800, height: 200, top: 0, left: 0 })
      };
      this.listeners = {};
    }

    get className() {
      return Array.from(this.classList.classes).join(' ');
    }
    set className(val) {
      this.classList.classes.clear();
      if (val) {
        val.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
      }
    }

    setAttribute(k, v) { this[k] = v; }
    getAttribute(k) { return this[k] || null; }

    appendChild(child) {
      this.children.push(child);
    }
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
    }
    get firstChild() {
      return this.children[0] || null;
    }

    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    }

    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
    }

    getContext(type) {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        fillRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        scale: () => {}
      };
    }
  }

  function getElementById(id) {
    if (!elements[id]) {
      let tag = 'div';
      if (id.startsWith('btn')) tag = 'button';
      else if (id.startsWith('inp')) tag = 'input';
      else if (id.startsWith('sel')) tag = 'select';
      else if (id.startsWith('chk')) tag = 'input';
      else if (id === 'monitorCanvas') tag = 'canvas';
      elements[id] = new MockElement(id, tag);
    }
    return elements[id];
  }

  const mockBody = new MockElement('body', 'body');
  mockBody.setAttribute('data-theme', 'dark');

  const mockDocument = {
    getElementById,
    body: mockBody,
    activeElement: mockBody,
    createElement: (tag) => new MockElement(`auto_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, tag)
  };

  const mockWindow = {
    addEventListener: (evt, fn) => {
      if (!eventListeners[evt]) eventListeners[evt] = [];
      eventListeners[evt].push(fn);
    },
    dispatchEvent: (event) => {
      if (eventListeners[event.type]) {
        eventListeners[event.type].forEach(fn => fn(event));
      }
    },
    devicePixelRatio: 1,
    requestAnimationFrame: (cb) => setTimeout(cb, 16)
  };

  let copiedClipboardText = '';
  const mockNavigator = {
    clipboard: {
      writeText: async (txt) => {
        copiedClipboardText = txt;
        return Promise.resolve();
      }
    }
  };

  return {
    elements,
    mockDocument,
    mockWindow,
    mockNavigator,
    getClipboard: () => copiedClipboardText
  };
}

// 2. Load index.html and initialize Sandbox Context
async function runTests() {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
  assert.ok(scriptMatch, 'Script block found in index.html');
  const scriptContent = scriptMatch[1];

  const env = createMockEnvironment();

  // Populate default DOM element values from HTML attributes
  const inpPwr = env.mockDocument.getElementById('inpCleaningPower');
  inpPwr.value = '15.0';
  const inpPulse = env.mockDocument.getElementById('inpCleaningPulseMs');
  inpPulse.value = '600';
  const inpCooldown = env.mockDocument.getElementById('inpCleaningCooldownMs');
  inpCooldown.value = '200';
  const selTimeout = env.mockDocument.getElementById('selCleaningTimeout');
  selTimeout.value = '30';

  const sandbox = {
    window: env.mockWindow,
    document: env.mockDocument,
    navigator: env.mockNavigator,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date,
    Math: Math,
    Promise: Promise,
    requestAnimationFrame: env.mockWindow.requestAnimationFrame
  };

  vm.createContext(sandbox);
  vm.runInContext(scriptContent, sandbox);

  // Trigger DOMContentLoaded
  env.mockWindow.dispatchEvent({ type: 'DOMContentLoaded' });
  console.log('✔ Sandbox environment initialized & DOMContentLoaded fired.');

  // =========================================================================
  // TEST 1: Initial State
  // =========================================================================
  console.log('\n--- Test 1: Initial State ---');
  assert.strictEqual(sandbox.getCleaningRunningState(), false, 'Cleaning should initially be idle');
  assert.strictEqual(sandbox.getCleaningCycleCount(), 0, 'Cycle count should initially be 0');
  assert.strictEqual(sandbox.getCleaningSettlingState(), false, 'Should not be settling initially');
  assert.strictEqual(sandbox.getCleaningOneShotState(), false, 'Should not be running one-shot initially');
  console.log('✔ Initial state validated.');

  // =========================================================================
  // TEST 2: Virtual Simulation Mode Connection
  // =========================================================================
  console.log('\n--- Test 2: Virtual Simulation Mode Connection ---');
  sandbox.switchConnectionMode('sim');
  await new Promise(r => setTimeout(r, 60));

  const statusText = env.mockDocument.getElementById('connectionStatusText').innerText;
  const statusDot = env.mockDocument.getElementById('connectionStatusDot');
  assert.ok(statusText.includes('虚拟仿真'), `Status text should indicate virtual simulation, got: "${statusText}"`);
  assert.ok(statusDot.classList.contains('connected'), 'Status dot should have "connected" class');
  console.log(`✔ Virtual simulation connected successfully: "${statusText}"`);

  // =========================================================================
  // TEST 3: Single-Shot Test Pulse (triggerCleaningOneShot)
  // =========================================================================
  console.log('\n--- Test 3: Single-Shot 15W Pulse Execution ---');
  const oneShotPromise = sandbox.triggerCleaningOneShot();
  assert.strictEqual(sandbox.getCleaningOneShotState(), true, 'One shot state should be active');
  
  await oneShotPromise;
  assert.strictEqual(sandbox.getCleaningOneShotState(), false, 'One shot state should return to false');
  
  const fsmBadge = env.mockDocument.getElementById('cleaningFsmBadge').innerText;
  assert.strictEqual(fsmBadge, '待机就绪', `FSM badge should return to '待机就绪', got: ${fsmBadge}`);
  console.log('✔ Single-shot 15W pulse executed & completed cleanly.');

  // =========================================================================
  // TEST 4: Continuous Cleaning Loop Start & Manual Stop
  // =========================================================================
  console.log('\n--- Test 4: Continuous Cleaning Loop & Manual Interruption ---');
  // Configure 300ms pulse, 100ms cooldown for fast test speed
  inpPulse.value = '300';
  inpCooldown.value = '100';
  selTimeout.value = '30';

  sandbox.togglePeriodicCleaning();
  assert.strictEqual(sandbox.getCleaningRunningState(), true, 'Cleaning loop should be running');

  const btnToggle = env.mockDocument.getElementById('btnToggleCleaning');
  assert.strictEqual(btnToggle.innerText, '停止清洁 (空格)', 'Button text should be "停止清洁 (空格)"');
  assert.ok(btnToggle.classList.contains('btn-danger'), 'Button should have "btn-danger" class when running');

  // Let it execute at least 2 cycles
  console.log('  Waiting for pulse cycles...');
  await new Promise(r => setTimeout(r, 850));
  const cyclesRan = sandbox.getCleaningCycleCount();
  assert.ok(cyclesRan >= 2, `Expected at least 2 cycles, ran: ${cyclesRan}`);
  console.log(`  Successfully completed ${cyclesRan} cleaning cycles.`);

  // Manually stop cleaning
  sandbox.togglePeriodicCleaning();
  assert.strictEqual(sandbox.getCleaningRunningState(), false, 'Cleaning loop should stop after toggle');
  assert.strictEqual(btnToggle.innerText, '启动清洁 (空格)', 'Button text should reset to "启动清洁 (空格)"');

  // Wait for 1-second settlement to finish
  console.log('  Waiting for settlement & thermal recovery...');
  await new Promise(r => setTimeout(r, 1400));

  const settleCard = env.mockDocument.getElementById('cardCleaningSettle');
  assert.strictEqual(settleCard.style.display, 'block', 'Settlement card should be displayed');

  const settlePreR = env.mockDocument.getElementById('txtSettlePreR').innerText;
  const settlePostR = env.mockDocument.getElementById('txtSettlePostR').innerText;
  const settleDeltaR = env.mockDocument.getElementById('txtSettleDeltaR').innerText;
  const settleCycles = env.mockDocument.getElementById('txtSettleCycles').innerText;
  const settleVerdict = env.mockDocument.getElementById('txtSettleVerdict').innerText;

  console.log(`  Settle Pre R:   ${settlePreR}`);
  console.log(`  Settle Post R:  ${settlePostR}`);
  console.log(`  Settle Delta R: ${settleDeltaR}`);
  console.log(`  Settle Cycles:  ${settleCycles}`);
  console.log(`  Settle Verdict: ${settleVerdict}`);

  assert.ok(settlePreR.includes('Ω'), 'Pre R should have Ω unit');
  assert.ok(settlePostR.includes('Ω'), 'Post R should have Ω unit');
  assert.ok(settleDeltaR.includes('mΩ'), 'Delta R should have mΩ unit');
  assert.ok(settleVerdict.length > 5, 'Verdict should contain descriptive text');
  console.log('✔ Settlement report card verified.');

  // =========================================================================
  // TEST 5: Settlement Card Actions & Resistance Adoption
  // =========================================================================
  console.log('\n--- Test 5: Settle Actions & Benchmark Adoption ---');
  const postOhms = sandbox.getCleaningPostColdR();
  sandbox.adoptCleaningColdOhms();
  assert.strictEqual(sandbox.getLastColdOhms(), postOhms, 'lastColdOhms should match adopted postColdR');
  assert.strictEqual(settleCard.style.display, 'none', 'Settlement card should close after adoption');
  console.log(`✔ Cold resistance ${postOhms.toFixed(3)}Ω adopted as new benchmark.`);

  // Test Report Copy
  sandbox.copyCleaningReport();
  const clipboard = env.getClipboard();
  assert.ok(clipboard.includes('DNA Pulse Cleaner 清洁报告'), 'Clipboard should contain report header');
  assert.ok(clipboard.includes('阻值净变化'), 'Clipboard should contain Delta R');
  console.log('✔ Report clipboard copy verified.');

  // =========================================================================
  // TEST 6: 1-Second Fast Safety Timeout Auto-Cutoff
  // =========================================================================
  console.log('\n--- Test 6: Safety Timeout Auto-Cutoff Protection ---');
  // Configure 1 second timeout
  selTimeout.value = '1';
  inpPulse.value = '300';
  inpCooldown.value = '100';

  sandbox.togglePeriodicCleaning();
  assert.strictEqual(sandbox.getCleaningRunningState(), true, 'Loop started for timeout test');

  console.log('  Waiting for 1s safety timeout to trip...');
  await new Promise(r => setTimeout(r, 1300));

  assert.strictEqual(sandbox.getCleaningRunningState(), false, 'Cleaning loop should auto cut off after timeout');
  const countdownText = env.mockDocument.getElementById('txtCleaningCountdown').innerText;
  assert.ok(countdownText.includes('超时保护') || countdownText.includes('已完成') || countdownText.includes('已停止'),
    `Countdown text should indicate timeout completion, got: "${countdownText}"`);
  console.log(`✔ Safety timeout protection verified: "${countdownText}"`);

  // =========================================================================
  // TEST 7: Keyboard Spacebar Trigger & Focus Protection
  // =========================================================================
  console.log('\n--- Test 7: Spacebar Keyboard Shortcut ---');
  // Wait settlement from previous test
  await new Promise(r => setTimeout(r, 1200));

  // Press spacebar on body -> should start cleaning
  env.mockDocument.activeElement = env.mockDocument.body;
  env.mockWindow.dispatchEvent({ type: 'keydown', code: 'Space', key: ' ', preventDefault: () => {} });
  assert.strictEqual(sandbox.getCleaningRunningState(), true, 'Spacebar should start cleaning');

  // Press spacebar on body again -> should stop cleaning
  env.mockWindow.dispatchEvent({ type: 'keydown', code: 'Space', key: ' ', preventDefault: () => {} });
  assert.strictEqual(sandbox.getCleaningRunningState(), false, 'Spacebar should stop cleaning');

  // Press spacebar while focused on input field -> should NOT trigger cleaning
  const inputEl = env.mockDocument.getElementById('inpCleaningPower');
  env.mockDocument.activeElement = inputEl;
  env.mockWindow.dispatchEvent({ type: 'keydown', code: 'Space', key: ' ', preventDefault: () => {} });
  assert.strictEqual(sandbox.getCleaningRunningState(), false, 'Spacebar in input should NOT start cleaning');
  console.log('✔ Spacebar shortcut and typing-protection verified.');

  // =========================================================================
  // TEST 8: Theme Switcher
  // =========================================================================
  console.log('\n--- Test 8: Theme Mode Switcher ---');
  assert.strictEqual(env.mockDocument.body.getAttribute('data-theme'), 'dark', 'Initial theme should be dark');
  sandbox.toggleThemeMode();
  assert.strictEqual(env.mockDocument.body.getAttribute('data-theme'), 'light', 'Theme should switch to light');
  sandbox.toggleThemeMode();
  assert.strictEqual(env.mockDocument.body.getAttribute('data-theme'), 'dark', 'Theme should switch back to dark');
  console.log('✔ Theme switching dark/light verified.');

  // =========================================================================
  // TEST 9: Disconnect and Reconnect
  // =========================================================================
  console.log('\n--- Test 9: Device Disconnect and Cleanup ---');
  sandbox.disconnectDevice();
  const disconnectedText = env.mockDocument.getElementById('connectionStatusText').innerText;
  assert.strictEqual(disconnectedText, '未连接', 'Status should be "未连接"');
  assert.strictEqual(env.mockDocument.getElementById('connectionStatusDot').classList.contains('connected'), false);

  sandbox.startSimulationMode();
  const reconnectedText = env.mockDocument.getElementById('connectionStatusText').innerText;
  assert.ok(reconnectedText.includes('虚拟仿真'), 'Should reconnect to simulation');
  console.log('✔ Disconnect and re-connection verified.');

  console.log('\n====================================================');
  console.log(' ALL 9 E2E SIMULATION TESTS PASSED (100% PASS RATE) ');
  console.log('====================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n✖ E2E TEST FAILED:', err);
  process.exit(1);
});
