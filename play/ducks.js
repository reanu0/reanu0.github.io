// REANU TARIN ALI - 3649660
// La_Creatura.pde, ported from Processing to p5.js so it runs in the browser.
// The logic is unchanged; only the Java syntax became JavaScript.
// CLICK ON A DUCK TO MAKE IT MOVE ABOUT FOR 5 SECONDS
// DRAG A DUCK AROUND. THEY DONT MIND

// list of ducks
let ducks = [];

// initialize the global default for the wobble
let angle = 0;

class Duck {
  constructor(x, y, scale, col) {
    this.duckX = x;
    this.duckY = y;
    this.duckScale = scale;
    this.col = col;
    this.duckIsMoving = false;
    this.moveCountdown = 0; // timer for duck moving
    this.velX = 0;
    this.velY = 0;
    this.duckWobble = random(TWO_PI);
  }

  // call the drawduckidle
  displayDuck(angle) {
    const resWobble = angle + this.duckWobble; // resultant wobble, with a random phase per duck
    drawDuckidle(this.duckX, this.duckY, this.col, resWobble, this.duckScale);
  }

  // method for the bouncy moving duck
  bouncyDuck() {
    if (this.duckIsMoving) {
      this.duckX = this.duckX + this.velX;
      this.duckY = this.duckY + this.velY;
      const radius = this.duckScale / 2.0;
      if (this.duckX - radius <= 0 && this.velX < 0) this.velX = -this.velX;      // left wall
      if (this.duckX + radius >= width && this.velX > 0) this.velX = -this.velX;  // right wall
      if (this.duckY - radius <= 0 && this.velY < 0) this.velY = -this.velY;      // top wall
      if (this.duckY + radius >= height && this.velY > 0) this.velY = -this.velY; // bottom wall
      this.moveCountdown = this.moveCountdown - 1;
      if (this.moveCountdown <= 0) this.duckIsMoving = false;
    }
  }

  // point in circle test
  IsPointInCircle(px, py) {
    return dist(px, py, this.duckX, this.duckY) < this.duckScale / 2.0;
  }

  duckSwimrandom(speed, frames) {
    this.duckIsMoving = true;
    this.moveCountdown = frames;
    const randAngle = random(TWO_PI);
    this.velX = speed * cos(randAngle);
    this.velY = speed * sin(randAngle);
  }
}

function setup() {
  createCanvas(1000, 750).parent('stage');
  strokeWeight(1);
  for (let i = 0; i < 12; i = i + 1) { // 12 ducks
    const x = random(160, width - 160);
    const y = random(160, height - 160);
    const scale = random(80, 240);
    const col = color(random(200, 255), random(200, 255), random(200, 255));
    ducks.push(new Duck(x, y, scale, col));
  }
}

// method for background
function drawbackground() {
  background('#7cd9d9');
}

// method to draw Duckidle, i used scale = 160 when making this.
function drawDuckidle(x, y, bodyColor, angle, scale) {
  // "floating" effect
  const wobbleY = 0.02 * scale * sin(angle) + y; // derived from y = asinx + b
  const resultantY = wobbleY;
  const resultantX = x;

  stroke(0);
  fill(bodyColor);
  // chest
  parc(resultantX - 0.16 * scale, resultantY + 0.02 * scale, 0.06 * scale, 0.28 * scale, PI / 2, 3 * HALF_PI);
  // head
  parc(resultantX - 0.06 * scale, resultantY - 0.06 * scale, 0.25 * scale, 0.63 * scale, PI, 2 * PI);
  // main body layered to hide neck
  noStroke();
  arcP(resultantX + 0.025 * scale, resultantY + 0.025 * scale, 0.78 * scale, 0.31 * scale, -2 * PI / 3, 2 * PI / 3, CHORD);
  stroke(0);
  noFill();
  arcP(resultantX + 0.025 * scale, resultantY + 0.025 * scale, 0.78 * scale, 0.31 * scale, -17 * PI / 36, 2 * PI / 3, OPEN);
  fill(bodyColor);
  // beak
  parc(resultantX - 0.17 * scale, resultantY - 0.19 * scale, 0.09 * scale, 0.03 * scale, HALF_PI, 3 * HALF_PI);
  parc(resultantX - 0.17 * scale, resultantY - 0.16 * scale, 0.09 * scale, 0.03 * scale, HALF_PI, 3 * HALF_PI);
  // wings
  arcP(resultantX + 0.09 * scale, resultantY + 0.03 * scale, 0.31 * scale, 0.19 * scale, -2 * PI / 3, 2 * PI / 3, OPEN);
  // eyes
  fill('#000000');
  circle(resultantX - 0.04 * scale, resultantY - 0.22 * scale, 0.02 * scale);
  circle(resultantX - 0.12 * scale, resultantY - 0.26 * scale, 0.02 * scale);
}

// now we draw.
function draw() {
  drawbackground();
  for (let i = 0; i < ducks.length; i = i + 1) {
    const dk = ducks[i];
    dk.bouncyDuck();
    dk.displayDuck(angle);
  }
  angle = angle + 0.02;
}

// -------- MOUSE INTERACTIONS ------ //

let duckIsDraggingIndex = -1;
let movedSincePress = false; // Processing only "clicks" when the mouse didn't move

function mousePressed() {
  movedSincePress = false;
  duckIsDraggingIndex = -1;
  for (let i = ducks.length - 1; i >= 0; i = i - 1) {
    if (ducks[i].IsPointInCircle(mouseX, mouseY)) {
      duckIsDraggingIndex = i;
      break;
    }
  }
  return false;
}

function mouseDragged() {
  movedSincePress = true;
  if (duckIsDraggingIndex >= 0) {
    const dk = ducks[duckIsDraggingIndex];
    dk.duckX = mouseX;
    dk.duckY = mouseY;
  }
  return false;
}

function mouseReleased() {
  duckIsDraggingIndex = -1;
  if (!movedSincePress) duckClicked();
  return false;
}

// when the mouse is clicked, the duck moves off in another direction for a set time
function duckClicked() {
  for (let i = ducks.length - 1; i >= 0; i = i - 1) {
    const dk = ducks[i];
    if (dk.IsPointInCircle(mouseX, mouseY)) {
      dk.duckSwimrandom(6, 60 * 5); // 5 seconds times 60 frames, 6u/s speed
      break;
    }
  }
}
