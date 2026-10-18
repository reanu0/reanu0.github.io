/*
  TARGET HIT GAME - Two Player Competitive Game
  ================================================
  Ported from Processing to p5.js with Claude Opus 5.5 (AI) so it runs in the browser.
  Player 1: Places targets on screen using potentiometer (X) and LDR (Y)
  Player 2: Tries to hit all targets as fast as possible using same controls

  In the browser:
  - Keyboard (the original debug mode): WASD (P1) + IJKL (P2), click or P to
    place targets, hold F to hit, SPACE to move to the next step.
  - Arduino: in Chrome or Edge, press "Connect Arduino" and pick the board.
    It reads the same "pot1,ldr1,pot2,ldr2,hit" lines at 9600 baud.
  - High scores are kept in this browser instead of high_scores.txt.
*/

// Game states
const STATE_SETUP = 0;
const STATE_PLAYER1_PLACE = 1;
const STATE_PLAYER2_PLAY = 2;
const STATE_RESULT = 3;

// Globals
let targets = [];
let gameState = STATE_SETUP;
let highScores;

// Player positions (start in the middle so the cursors are easy to find)
let player1X = 500, player1Y = 350;
let player2X = 500, player2Y = 350;

// Sensor values
let pot1 = 512, ldr1 = 512;
let pot2 = 512, ldr2 = 512;

// Game tracking
const targetsToPlace = 5;
let targetsPlaced = 0;
let roundTime = 0;
let startTime = 0;
let debugMode = false;

// Player size
const PLAYER_SIZE = 30;
const TARGET_SIZE = 25;

// Keyboard tracking
const keysPressed = {};

// Serial communication
let serialManager;

// ===== P5 CORE FUNCTIONS =====

function setup() {
  createCanvas(1000, 700).parent('stage');
  frameRate(60);
  targets = [];
  highScores = new HighScoreManager();
  serialManager = new SerialManager();
  serialManager.init();
}

function draw() {
  background(240);

  // If no serial is connected, use keyboard controls
  if (!serialManager.connected && !debugMode) debugMode = true;

  // Update input
  if (debugMode) {
    updateDebugInput();
  } else {
    pot1 = serialManager.pot1;
    ldr1 = serialManager.ldr1;
    pot2 = serialManager.pot2;
    ldr2 = serialManager.ldr2;

    // Map sensor values to screen coordinates only when using serial
    const SENSOR_MIN = 0;
    const SENSOR_MAX = 1023;
    player1X = map(pot1, SENSOR_MIN, SENSOR_MAX, 0, width);
    player1Y = map(ldr1, SENSOR_MIN, SENSOR_MAX, 0, height);
    player2X = map(pot2, SENSOR_MIN, SENSOR_MAX, 0, width);
    player2Y = map(ldr2, SENSOR_MIN, SENSOR_MAX, 0, height);
  }

  // Constrain to screen
  player1X = constrain(player1X, 0, width);
  player1Y = constrain(player1Y, 0, height);
  player2X = constrain(player2X, 0, width);
  player2Y = constrain(player2Y, 0, height);

  // Game logic
  if (gameState === STATE_PLAYER2_PLAY) {
    roundTime = (millis() - startTime) / 1000.0;
    const hitActive = isHitActive();

    // Check collisions with targets
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      if (hitActive && dist(player2X, player2Y, t.x, t.y) < idiv(PLAYER_SIZE, 2) + idiv(TARGET_SIZE, 2)) {
        targets.splice(i, 1);
      }
    }

    // Win condition
    if (targets.length === 0) {
      gameState = STATE_RESULT;
      highScores.saveScore(roundTime);
    }
  }

  drawGameState();
  drawControls();
}

function keyName() {
  return key.length === 1 ? key.toLowerCase() : key;
}

function keyPressed() {
  const k = keyName();
  keysPressed[k] = true;

  // Toggle keyboard mode with 'T' (only matters when an Arduino is connected)
  if (k === 't') {
    debugMode = !debugMode;
    return false;
  }

  // Keyboard mode: place target at Player 1 cursor with Enter or P
  if (debugMode && gameState === STATE_PLAYER1_PLACE && targetsPlaced < targetsToPlace) {
    if (keyCode === ENTER || keyCode === RETURN || k === 'p') {
      placeTargetAt(player1X, player1Y);
      return false;
    }
  }

  // Game state transitions with spacebar
  if (k === ' ') {
    switch (gameState) {
      case STATE_SETUP:
        gameState = STATE_PLAYER1_PLACE;
        targetsPlaced = 0;
        targets = [];
        break;
      case STATE_PLAYER1_PLACE:
        if (targetsPlaced === targetsToPlace) {
          gameState = STATE_PLAYER2_PLAY;
          startTime = millis();
          roundTime = 0;
        }
        break;
      case STATE_RESULT:
        gameState = STATE_PLAYER1_PLACE;
        targetsPlaced = 0;
        targets = [];
        break;
    }
  }
  return false; // keeps the space bar and keys from scrolling the page
}

function keyReleased() {
  keysPressed[keyName()] = false;
  return false;
}

function mousePressed() {
  // Clicking also starts the game, so it works without finding the space bar first
  if (gameState === STATE_SETUP && mouseInCanvas()) {
    gameState = STATE_PLAYER1_PLACE;
    targetsPlaced = 0;
    targets = [];
    return false;
  }
  // In keyboard mode, place targets with a mouse click
  if (debugMode && gameState === STATE_PLAYER1_PLACE && targetsPlaced < targetsToPlace && mouseInCanvas()) {
    placeTargetAt(mouseX, mouseY);
    return false;
  }
}

function mouseInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

// Shared helper to place a target and increment count
function placeTargetAt(x, y) {
  targets.push(new Target(x, y));
  targetsPlaced++;
}

// ===== KEYBOARD INPUT =====

function updateDebugInput() {
  const speed = 5;
  if (keysPressed['w']) player1Y -= speed;  // Player 1 movement (WASD)
  if (keysPressed['s']) player1Y += speed;
  if (keysPressed['a']) player1X -= speed;
  if (keysPressed['d']) player1X += speed;
  if (keysPressed['i']) player2Y -= speed;  // Player 2 movement (IJKL)
  if (keysPressed['k']) player2Y += speed;
  if (keysPressed['j']) player2X -= speed;
  if (keysPressed['l']) player2X += speed;
}

// The original showed a debug readout here; on the web it shows the controls.
function drawControls() {
  noStroke();
  fill(90);
  textSize(13);
  textAlign1(LEFT);
  if (debugMode) {
    text("Player 1 (blue): WASD to move, click or P to place      Player 2 (red): IJKL to move, hold F to hit      SPACE: next step", 20, height - 18);
  } else {
    text("Arduino connected   Pot1: " + pot1 + "  LDR1: " + ldr1 + "   Pot2: " + pot2 + "  LDR2: " + ldr2 + "   Hit: " + (isHitActive() ? "ACTIVE" : "-") + "   (T: keyboard)", 20, height - 18);
  }
}

function isHitActive() {
  if (debugMode) return !!keysPressed['f'];
  return serialManager.isHitPressed();
}

// ===== GAME STATE DRAWING FUNCTIONS =====

function drawGameState() {
  switch (gameState) {
    case STATE_SETUP: drawSetupScreen(); break;
    case STATE_PLAYER1_PLACE: drawPlayer1PlaceScreen(); break;
    case STATE_PLAYER2_PLAY: drawPlayer2PlayScreen(); break;
    case STATE_RESULT: drawResultScreen(); break;
  }
}

function drawSetupScreen() {
  noStroke();
  fill(50);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("TARGET HIT GAME", width / 2, height / 2 - 100);
  textSize(24);
  text("A two-player competitive game", width / 2, height / 2);
  textSize(16);
  text("Press SPACEBAR (or click) to start", width / 2, height / 2 + 100);
}

function drawPlayer1PlaceScreen() {
  // Draw grid background
  stroke(200);
  strokeWeight(1);
  for (let i = 0; i < width; i += 50) line(i, 0, i, height);
  for (let i = 0; i < height; i += 50) line(0, i, width, i);

  for (const t of targets) t.display();

  // Draw player 1 cursor
  fill(0, 150, 255);
  rect(player1X - idiv(PLAYER_SIZE, 2), player1Y - idiv(PLAYER_SIZE, 2), PLAYER_SIZE, PLAYER_SIZE);

  // UI
  noStroke();
  fill(50);
  textSize(20);
  textAlign1(LEFT);
  text("Player 1: Place Targets", 20, 30);
  text(targetsPlaced + " / " + targetsToPlace, 20, 60);

  if (targetsPlaced === targetsToPlace) {
    fill(0, 200, 0);
    textSize(24);
    textAlign1(CENTER);
    text("Press SPACEBAR to continue", width / 2, height - 50);
  }
}

function drawPlayer2PlayScreen() {
  for (const t of targets) t.display();

  // Draw player 2 cursor (red)
  fill(255, 0, 0);
  rect(player2X - idiv(PLAYER_SIZE, 2), player2Y - idiv(PLAYER_SIZE, 2), PLAYER_SIZE, PLAYER_SIZE);

  // UI
  noStroke();
  fill(50);
  textSize(20);
  textAlign1(LEFT);
  text("Player 2: HIT ALL TARGETS!", 20, 30);
  text("Targets left: " + targets.length, 20, 60);
  text("Time: " + roundTime.toFixed(1) + "s", 20, 90);
}

function drawResultScreen() {
  noStroke();
  fill(50);
  textSize(36);
  textAlign(CENTER, CENTER);
  text("ROUND COMPLETE!", width / 2, height / 2 - 80);
  textSize(28);
  text("Time: " + roundTime.toFixed(2) + " seconds", width / 2, height / 2);
  textSize(16);
  text("Press SPACEBAR to play again", width / 2, height / 2 + 80);

  // Show high scores
  textAlign1(LEFT);
  textSize(12);
  const scores = highScores.getTopScores(5);
  text("Top Times:", 20, height - 140);
  for (let i = 0; i < scores.length; i++) {
    text((i + 1) + ". " + scores[i].toFixed(2) + "s", 20, height - 120 + i * 20);
  }
}

// ===== Target.pde =====
class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = TARGET_SIZE;
  }
  display() {
    fill(255, 200, 0);
    stroke(200, 150, 0);
    strokeWeight(2);
    rect(this.x - idiv(this.size, 2), this.y - idiv(this.size, 2), this.size, this.size);
  }
}

// ===== HighScores.pde =====
// Keeps the 10 fastest times. The original saved high_scores.txt; a web page
// can't write files, so the times are kept in this browser instead.
class HighScoreManager {
  constructor() {
    this.key = 'target-hit-high-scores';
    this.scores = [];
    this.loadScores();
  }
  saveScore(time) {
    this.scores.push(time);
    this.scores.sort((a, b) => a - b);
    while (this.scores.length > 10) this.scores.pop();
    this.saveToFile();
  }
  getTopScores(count) { return this.scores.slice(0, count); }
  loadScores() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) || '[]');
      if (Array.isArray(saved)) this.scores = saved.filter(n => typeof n === 'number').sort((a, b) => a - b);
    } catch (e) { this.scores = []; }
  }
  saveToFile() {
    try { localStorage.setItem(this.key, JSON.stringify(this.scores)); } catch (e) { /* private mode: keep in memory */ }
  }
}

// ===== SerialManager.pde =====
// Expected format from the Arduino: "pot1,ldr1,pot2,ldr2[,hit]\n" at 9600 baud.
// Uses the Web Serial API (Chrome and Edge on desktop).
class SerialManager {
  constructor() {
    this.pot1 = 512; this.ldr1 = 512;
    this.pot2 = 512; this.ldr2 = 512;
    this.hitButton = 0;
    this.connected = false;
  }

  init() {
    if (!('serial' in navigator)) return; // other browsers: keyboard only
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'connect';
    button.textContent = 'Connect Arduino';
    button.addEventListener('click', () => this.connect(button));
    document.getElementById('stage').appendChild(button);
  }

  async connect(button) {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.connected = true;
      debugMode = false;
      button.textContent = 'Arduino connected';
      button.disabled = true;
      const reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
      let inBuffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        inBuffer += value;
        let nl;
        while ((nl = inBuffer.indexOf('\n')) >= 0) {
          this.parseSerialData(inBuffer.slice(0, nl).trim());
          inBuffer = inBuffer.slice(nl + 1);
        }
      }
    } catch (e) {
      // Cancelled or unplugged: fall back to the keyboard
    }
    this.connected = false;
    button.textContent = 'Connect Arduino';
    button.disabled = false;
  }

  parseSerialData(data) {
    const values = data.split(',');
    if (values.length >= 4) {
      const n = values.map(v => parseInt(v.trim(), 10));
      if (n.slice(0, 4).some(isNaN)) return; // ignore parsing errors
      this.pot1 = constrain(n[0], 0, 1023);
      this.ldr1 = constrain(n[1], 0, 1023);
      this.pot2 = constrain(n[2], 0, 1023);
      this.ldr2 = constrain(n[3], 0, 1023);
      if (values.length >= 5 && !isNaN(n[4])) this.hitButton = constrain(n[4], 0, 1);
    }
  }

  isHitPressed() { return this.hitButton > 0; }
}
