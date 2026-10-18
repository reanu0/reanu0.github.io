/*
  TARGET HIT GAME - final version
  Jack Rengelink s3631419 & Reanu Ali s3649660
  Ported from Processing to p5.js with Claude Opus 5.5 (AI) so it runs in the browser.
  The game logic is kept as written; changes for the web are marked "WEB:".

  One player places 5 targets, the other steers into them as fast as possible,
  then they swap. The controller is a potentiometer (x) and an LDR (y).

  WEB: without an Arduino, the mouse stands in for the controller
       (left/right = potentiometer, up/down = LDR), and the buzzer notes play
       through the speakers. In Chrome or Edge, "Connect Arduino" uses the real
       controller, LEDs and buzzer with the Arduino code from the project.
*/

// global variables and configurables :)
const stateSetup = 0;
const statePlace = 1;
const stateHit = 2;
const statePhaseEnd = 3;
const stateGameEnd = 4;
let ledState = -1;

const player1Id = 1;
const player2Id = 2;

const totalRounds = 2;
const targetsPerPhase = 5;
const playerSize = 30;
const targetSize = 25;

let gameState = stateSetup;
let currentRound = 1;
let phase = 0; //0 = player1 places, 1 = player2 places

let placer = 0;
let hitter = 0;

//Player positions
let p1x = 0, p1y = 0;
let p2x = 0, p2y = 0;

//Targets
let targets = [];
let targetsPlaced = 0;
let targetsHit = 0;

//Time
let phaseStartTime = 0;
let phaseTime = 0;
let totalTimeP1 = 0;
let totalTimeP2 = 0;

//Highscore
let highscore = Number.MAX_VALUE;
let newHighscore = false;
let highscorePlayer = 0;
const highscoreFile = "target-hit-highscore"; // WEB: kept in this browser instead of highscore.txt

//Buzz / Serial
let serialManager;
let buzzer;

function setup() {
  createCanvas(1000, 700).parent('stage');
  frameRate(60);
  rectMode(CENTER);
  textFont('Arial');
  textSize(18);

  serialManager = new SerialManager();
  serialManager.init();
  buzzer = new BuzzerManager(serialManager);

  loadHighscore();
}

function draw() {
  background(40);

  updateInput();

  if (gameState === stateHit) {
    phaseTime = (millis() - phaseStartTime) / 1000.0;
    checkHits();
  }

  if (serialManager.connected) {
    if (gameState === statePlace && ledState !== 0) {
      serialManager.write('A');
      serialManager.write('b');
      ledState = 0;
    }
    if (gameState === stateHit && ledState !== 1) {
      serialManager.write('a');
      serialManager.write('B');
      ledState = 1;
    }
  }

  drawTopBar();

  if (gameState === stateSetup) drawSetupScreen();
  if (gameState === statePlace) drawPlaceScreen();
  if (gameState === stateHit) drawHitScreen();
  if (gameState === statePhaseEnd) drawPhaseEnd();
  if (gameState === stateGameEnd) drawGameEnd();

  drawWebHint();
}

//All the inputs
function updateInput() {
  // WEB: no Arduino connected -> the mouse acts as the potentiometer and LDR
  if (!serialManager.connected) {
    serialManager.pot = constrain(map(mouseX, 0, width, 0, 1023), 0, 1023);
    serialManager.ldr = constrain(map(mouseY, 40, height, 0, 1023), 0, 1023);
  }

  const x = map(serialManager.pot, 0, 1023, 0, width);
  const y = map(serialManager.ldr, 0, 1023, 40, height);

  if (gameState === statePlace) {
    if (placer === player1Id) { p1x = x; p1y = y; }
    else { p2x = x; p2y = y; }
  }

  if (gameState === stateHit) {
    if (hitter === player1Id) { p1x = x; p1y = y; }
    else { p2x = x; p2y = y; }
  }
}

//Check if it hits
function checkHits() {
  const hx = (hitter === player1Id) ? p1x : p2x;
  const hy = (hitter === player1Id) ? p1y : p2y;

  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    if (dist(hx, hy, t.x, t.y) < idiv(playerSize, 2) + idiv(targetSize, 2)) {
      targets.splice(i, 1);
      buzzer.playNote(targetsHit);
      targetsHit++;
    }
  }

  if (targets.length === 0) {
    if (hitter === player1Id) totalTimeP1 += phaseTime;
    else totalTimeP2 += phaseTime;

    gameState = statePhaseEnd;
  }
}

// What SPACE does
function pressSpace() {
  if (gameState === stateSetup) startPhase();
  else if (gameState === statePlace && targetsPlaced === targetsPerPhase) {
    gameState = stateHit;
    targetsHit = 0;
    phaseStartTime = millis();
  }
  else if (gameState === statePhaseEnd) nextPhaseOrRound();
  else if (gameState === stateGameEnd) resetGame();
}

function keyPressed() {
  if (key === ' ') {
    buzzer.unlock();
    pressSpace();
    return false; // WEB: keep the space bar from scrolling the page
  }
}

//Simple clicking stuff for target placing
function mousePressed(e) {
  if (!e || !e.target || e.target.tagName !== 'CANVAS') return; // WEB: ignore the Connect button
  buzzer.unlock();
  if (gameState === statePlace && targetsPlaced < targetsPerPhase) {
    targets.push(new Target(mouseX, mouseY));
    targetsPlaced++;
  } else if (gameState !== stateHit) {
    pressSpace(); // WEB: a click or tap also works as SPACE, so it plays on phones
  }
  return false;
}

//The game has 2 phases in a round. Each player needs to hit the targets once.
// after the phases, next round starts. after the rounds, game ends
function startPhase() {
  if (phase === 0) { placer = player1Id; hitter = player2Id; }
  else { placer = player2Id; hitter = player1Id; }
  // reset targets
  targets = [];
  targetsPlaced = 0;
  targetsHit = 0;
  gameState = statePlace;
}

// next phase function
function nextPhaseOrRound() {
  phase++;
  if (phase > 1) {
    phase = 0;
    currentRound++;
    if (currentRound > totalRounds) {
      endGame();
      return;
    }
  }
  startPhase();
}

// end game function
function endGame() {
  gameState = stateGameEnd;
  const winnerTime = (totalTimeP1 < totalTimeP2) ? totalTimeP1 : totalTimeP2;
  highscorePlayer = (totalTimeP1 < totalTimeP2) ? 1 : 2;

  if (winnerTime < highscore) {
    highscore = winnerTime;
    newHighscore = true;
    saveHighscore();
  }
}

//Resets the game after ending
function resetGame() {
  currentRound = 1;
  phase = 0;
  totalTimeP1 = 0;
  totalTimeP2 = 0;
  newHighscore = false;
  gameState = stateSetup;
  ledState = -1;
}

//Drawing the UI
function drawTopBar() {
  fill(20);
  rect(width / 2, 20, width, 40);

  fill(255);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("P1: " + nf(totalTimeP1, 1, 2) + "s", 20, 20);
  text("P2: " + nf(totalTimeP2, 1, 2) + "s", 220, 20);

  textAlign(RIGHT, CENTER);
  if (highscore < Number.MAX_VALUE) text("Highscore: " + nf(highscore, 1, 2) + "s", width - 20, 20);
  else text("Highscore: ---", width - 20, 20);
}

function drawSetupScreen() {
  textAlign(CENTER, CENTER);
  textSize(36); fill(255);
  text("TARGET HIT GAME - 5 ROUNDS", width / 2, height / 2 - 50);
  textSize(20);
  text("Press SPACE to start", width / 2, height / 2 + 20);
}

function drawPlaceScreen() {
  for (const t of targets) t.display();

  fill((placer === player1Id) ? '#00AAFF' : '#00FF66');
  rect((placer === player1Id) ? p1x : p2x, (placer === player1Id) ? p1y : p2y, playerSize, playerSize);

  fill(255); textSize(20); textAlign1(LEFT);
  text("Round " + currentRound + " | " + ((placer === player1Id) ? "P1" : "P2") + " placing " + targetsPlaced + "/" + targetsPerPhase, 20, 70);
}

function drawHitScreen() {
  for (const t of targets) t.display();

  fill(255, 0, 0);
  const hx = (hitter === player1Id) ? p1x : p2x;
  const hy = (hitter === player1Id) ? p1y : p2y;
  rect(hx, hy, playerSize, playerSize);

  fill(255); textSize(20); textAlign1(LEFT);
  text("Round " + currentRound + " | " + ((hitter === player1Id) ? "P1" : "P2") + " hitting", 20, 70);
  text("Time: " + nf(phaseTime, 1, 2) + "s", 20, 100);
}

function drawPhaseEnd() {
  textAlign1(CENTER);
  textSize(24); fill(255);
  text("Phase complete! Press SPACE for next", width / 2, height / 2);
}

function drawGameEnd() {
  textAlign1(CENTER);
  textSize(36); fill(255);
  text("GAME OVER", width / 2, 100);

  if (newHighscore) {
    textSize(22); fill(0, 255, 100);
    text("Player " + highscorePlayer + " got a new highscore!", width / 2, 150);
  }

  textSize(28); fill(255);
  text("P1 total: " + nf(totalTimeP1, 1, 2) + "s", width / 2, 220);
  text("P2 total: " + nf(totalTimeP2, 1, 2) + "s", width / 2, 260);

  textSize(20); fill(200);
  text("Highscore: " + nf(highscore, 1, 2) + "s", width / 2, 310);
}

// WEB: a one-line reminder of the controls at the bottom
function drawWebHint() {
  push();
  noStroke();
  fill(150);
  textSize(13);
  textAlign(CENTER, CENTER);
  let hint;
  if (gameState === statePlace) hint = "Click to place the targets, then press SPACE (or click)";
  else if (gameState === stateHit) hint = serialManager.connected
    ? "Steer with the knob and the light sensor"
    : "Steer with the mouse: left and right is the knob, up and down is the light sensor";
  else hint = "SPACE or click to continue";
  text(hint, width / 2, height - 16);
  pop();
}

//HIGHSCORE (Jack got it and is proud of himself)
function loadHighscore() {
  try {
    const saved = parseFloat(localStorage.getItem(highscoreFile));
    if (!isNaN(saved)) highscore = saved;
  } catch (e) {} // just in case something goes wrong ig
}

function saveHighscore() {
  try { localStorage.setItem(highscoreFile, String(highscore)); } catch (e) {}
}

class BuzzerManager {
  constructor(sm) {
    this.serialManager = sm;
    this.audio = null;
    this.notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // same as the Arduino
  }

  // WEB: browsers only allow sound after the first click or key press
  unlock() {
    if (this.audio) return;
    try { this.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }

  playNote(noteIndex) {
    if (noteIndex < 0 || noteIndex > 4) return;
    if (this.serialManager.connected) {
      this.serialManager.write(String(noteIndex) + "\n");
      return;
    }
    // WEB: no Arduino, so play the buzzer note through the speakers
    if (!this.audio) return;
    const now = this.audio.currentTime;
    const dur = noteIndex === 4 ? 0.4 : 0.2;
    const osc = this.audio.createOscillator();
    const gain = this.audio.createGain();
    osc.type = 'square';
    osc.frequency.value = this.notes[noteIndex];
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.setValueAtTime(0.06, now + dur - 0.02);
    gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.connect(gain).connect(this.audio.destination);
    osc.start(now);
    osc.stop(now + dur);
  }
}

// serial manager class for arduino communication
// WEB: uses the Web Serial API (Chrome and Edge on desktop)
class SerialManager {
  constructor() {
    this.pot = 512;
    this.ldr = 512;
    this.connected = false;
    this.writer = null;
    this.encoder = new TextEncoder();
  }

  init() {
    if (!('serial' in navigator)) return; // other browsers: mouse only
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
      this.writer = port.writable.getWriter();
      this.connected = true;
      ledState = -1; // send the LED state again
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
          this.parse(inBuffer.slice(0, nl));
          inBuffer = inBuffer.slice(nl + 1);
        }
      }
    } catch (e) {
      // cancelled or unplugged: back to the mouse
    }
    this.connected = false;
    this.writer = null;
    button.textContent = 'Connect Arduino';
    button.disabled = false;
  }

  write(text) {
    if (this.writer) this.writer.write(this.encoder.encode(text)).catch(() => {});
  }

  parse(line) { // parse incoming data from arduino
    const v = line.trim().split(',');
    if (v.length === 2) {
      const pot = parseInt(v[0], 10), ldr = parseInt(v[1], 10);
      if (isNaN(pot) || isNaN(ldr)) return;
      this.pot = constrain(pot, 0, 1023);
      this.ldr = constrain(ldr, 0, 1023);
    }
  }
}

// target class, shows target on screen
class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() { // rectangle (may update later)
    fill(255, 200, 0);
    stroke(180);
    rect(this.x, this.y, 25, 25);
  }
}
