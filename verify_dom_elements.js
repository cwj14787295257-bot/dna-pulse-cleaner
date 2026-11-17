const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
  'appBrandLogo',
  'btnModeHardware',
  'btnModeSimulation',
  'connectionStatusDot',
  'connectionStatusText',
  'btnThemeToggle',
  'btnConnectDevice',
  'cleaningFsmBadge',
  'inpCleaningPower',
  'inpCleaningPulseMs',
  'inpCleaningCooldownMs',
  'selCleaningTimeout',
  'btnCleaningOneShot',
  'btnToggleCleaning',
  'txtCleaningPreRcold',
  'txtCleaningLiveRcold',
  'txtCleaningLiveDeltaR',
  'txtCleaningPower',
  'txtCleaningPowerRange',
  'txtCleaningVoltage',
  'txtCleaningPhaseLabel',
  'svgCleaningRing',
  'circleCleaningRing',
  'txtCleaningCountdown',
  'txtCleaningCycleCount',
  'txtCleaningTotalEnergy',
  'txtCleaningTempCoil',
  'txtCleaningTempBoard',
  'txtCleaningTempStatus',
  'fpsBadge',
  'chkCurvePower',
  'chkCurveVolt',
  'chkCurveOhms',
  'chkCurveTemp',
  'btnClearWaveform',
  'monitorCanvas',
  'lblWaveformBuffer',
  'cardCleaningSettle',
  'btnAdoptCleaningOhms',
  'btnCopySettleReport',
  'btnDismissSettle',
  'txtSettlePreR',
  'txtSettlePostR',
  'txtSettleDeltaR',
  'txtSettleCycles',
  'txtSettleVerdict',
  'txtCleaningLog',
  'btnToggleTerminal',
  'logTerminalOutput',
  'toastNotification'
];

console.log(`[DOM Verification] Checking ${requiredIds.length} required UI element IDs in index.html...`);

let missingIds = 0;
for (const id of requiredIds) {
  const pattern = new RegExp(`id=["']${id}["']`);
  const found = pattern.test(html);
  if (!found) {
    console.error(`✖ Missing required ID: id="${id}"`);
    missingIds++;
  }
}

if (missingIds > 0) {
  console.error(`Error: ${missingIds} required element IDs missing!`);
  process.exit(1);
}
console.log(`✔ All ${requiredIds.length} element IDs verified successfully!`);

const requiredFunctions = [
  'sleepMs',
  'showToast',
  'logCleaningDecision',
  'logTerminal',
  'toggleTerminalDrawer',
  'toggleThemeMode',
  'switchConnectionMode',
  'toggleDeviceConnection',
  'connectHardwareSerial',
  'startSimulationMode',
  'disconnectDevice',
  'setConnectionUI',
  'readSerialLoop',
  'sendSerialCmd',
  'handleDeviceResponse',
  'simulateDeviceResponse',
  'startTelemetryPolling',
  'updateCleaningFsmBadge',
  'updateCleaningUI',
  'updateCleaningTimerUI',
  'executeCleaningPulse',
  'triggerCleaningOneShot',
  'togglePeriodicCleaning',
  'runPeriodicCleaningLoop',
  'settleCleaningResults',
  'adoptCleaningColdOhms',
  'dismissCleaningSettleCard',
  'copyCleaningReport',
  'redrawOscilloscope',
  'clearWaveformHistory',
  'startOscilloscopeLoop',
  'initKeyboardShortcuts',
  'getCleaningRunningState',
  'getCleaningCycleCount',
  'getLastColdOhms',
  'getCleaningPreColdR',
  'getCleaningPostColdR',
  'getCleaningSettlingState',
  'getCleaningOneShotState',
  'getLiveTelemetry'
];

console.log(`\n[Function Verification] Checking ${requiredFunctions.length} required JavaScript functions in index.html...`);

let missingFns = 0;
for (const fn of requiredFunctions) {
  const pattern = new RegExp(`function\\s+${fn}\\b`);
  const found = pattern.test(html);
  if (!found) {
    console.error(`✖ Missing required function: function ${fn}()`);
    missingFns++;
  }
}

if (missingFns > 0) {
  console.error(`Error: ${missingFns} required functions missing!`);
  process.exit(1);
}
console.log(`✔ All ${requiredFunctions.length} JavaScript functions verified successfully!`);

console.log('\n=============================================');
console.log(' ALL DOM IDS AND FUNCTION SIGNATURES PASS OK ');
console.log('=============================================\n');
