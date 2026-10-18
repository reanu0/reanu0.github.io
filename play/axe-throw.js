// Axe Throw  Final Project Teo Peeters s3382451 & Reanu Ali 3649660
// Ported from Processing to p5.js with Claude Opus 5.5 (AI) so it runs in the browser.
// Each section below was its own tab (.pde file); the logic is unchanged.

/*
  INSTRUCTIONS

  [LEFT MOUSE BUTTON]  Drag away from the catapult to aim; release to throw
  [SPACE]              Toggle between sunny and rainy weather
  [R]                  Resets
  [MOUSE CURSOR]       Birds will avoid the mouse cursor
*/

/* ===== MainProject.pde ===== */
let catapult;
let target;
let env;
let flyingAxe = null;

let bgImg, catBodyImg, catArmImg, targetImg, axeImgs;

// p5 loads images before setup in preload()
function preload() {
  bgImg      = loadImage("axe/Background.png");
  catBodyImg = loadImage("axe/Catapult_body.png");
  catArmImg  = loadImage("axe/Catapult_arm.png");
  targetImg  = loadImage("axe/Target.png");
  axeImgs    = [loadImage("axe/Axe_1.png"), loadImage("axe/Axe_2.png"), loadImage("axe/Axe_3.png")];
}

// creates all game objects
function setup() {
  createCanvas(1280, 720).parent('stage');
  frameRate(60);
  noSmooth();

  env      = new Environment(bgImg);
  target   = new Target(targetImg, axeImgs);
  catapult = new Catapult(catBodyImg, catArmImg, axeImgs);
  catapult.reload();
}

// main loop: updates and draws everything, handles axe lifecycle
function draw() {
  env.update();
  env.display();

  target.update();
  target.display();
  catapult.display();

  if (flyingAxe != null) {
    flyingAxe.update();
    flyingAxe.display();

    if (target.tryStick(flyingAxe)) {    // score is tracked inside Target
      flyingAxe = null;
      catapult.reload();
    } else if (flyingAxe.isFinished()) {
      flyingAxe = null;
      catapult.reload();
    }
  }

  drawHUD();
}

// draws the score counter in the top-left corner
function drawHUD() {
  noStroke();
  fill(255);
  textSize(28);
  textAlign(LEFT, TOP);
  text("Score: " + target.getScore(), 20, 20);
  // on the web, a reminder of the controls
  textSize(15);
  textAlign(CENTER, CENTER);
  fill(255, 200);
  text("Drag away from the catapult and release to throw  ·  SPACE: weather  ·  R: reset", width / 2, height - 25);
}

function mousePressed()  { catapult.startAim(); return false; }
function mouseDragged()  { catapult.updateAim(mouseX, mouseY); return false; }
function mouseReleased() { if (catapult.isAiming()) flyingAxe = catapult.fire(); return false; }

function keyPressed() {
  if (key === ' ') env.toggle();
  if (key === 'r' || key === 'R') { target.reset(); catapult.reload(); }
  return false;
}


/* ===== Environment.pde ===== */
class Environment {
  // initializes weather mode and pre-allocates bird and raindrop arrays
  constructor(bgImg) {
    this.SUNNY = 0;
    this.RAIN  = 1;
    this.bgImg = bgImg;
    this.mode  = this.SUNNY;
    this.birds = [];
    for (let i = 0; i < 28; i++) this.birds.push(new Bird());
    this.drops = [];
    for (let i = 0; i < 180; i++) this.drops.push(new Raindrop());
  }

  // switches between sunny and rainy modes
  toggle() {
    this.mode = (this.mode === this.SUNNY) ? this.RAIN : this.SUNNY;
  }

  // updates whichever set of entities is active for the current mode
  update() {
    if (this.mode === this.SUNNY) {
      for (const b of this.birds) b.update(this.birds);
    } else {
      for (const d of this.drops) d.update();
    }
  }

  // draws background, ground strip, then birds or rain overlay
  display() {
    const bgScale = width / this.bgImg.width;
    const bgH     = this.bgImg.height * bgScale;
    image(this.bgImg, 0, height - bgH, width, bgH);

    // ground strip -> y matches axe explosion threshold (height - 50)
    noStroke();
    fill(62, 44, 20);
    rect(0, height - 50, width, 50);

    if (this.mode === this.SUNNY) {
      for (const b of this.birds) b.display();
    } else {
      fill(20, 40, 70, 85);
      rect(0, 0, width, height);
      for (const d of this.drops) d.display();
    }
  }
}

class Bird {
  constructor() {
    // flocking radii
    this.sepRadius = 25;
    this.aliRadius = 45;
    this.cohRadius = 50;
    // flocking force magnitudes
    this.sepForce = 2.2;
    this.aliForce = 1.4;
    this.cohForce = 0.9;

    this.maxSpeed   = 3.2;
    this.fleeRadius = 120;
    this.fleeForce  = 3.5;

    this.pos = createVector(random(width), random(height * 0.65));
    const a = random(TWO_PI);
    this.vel = createVector(cos(a) * 2, sin(a) * 2);
  }

  update(flock) {
    const sep = createVector();
    const ali = createVector();
    const coh = createVector();
    let sepN = 0, aliN = 0, cohN = 0;

    for (const other of flock) {
      if (other === this) continue;
      const d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

      if (d < this.sepRadius && d > 0) {
        const diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        sep.add(diff);
        sepN++;
      }
      if (d < this.aliRadius) { ali.add(other.vel); aliN++; }
      if (d < this.cohRadius) { coh.add(other.pos); cohN++; }
    }

    if (sepN > 0) { sep.div(sepN); sep.setMag(this.sepForce); }
    if (aliN > 0) { ali.div(aliN); ali.setMag(this.aliForce); }
    if (cohN > 0) { coh.div(cohN); coh.sub(this.pos); coh.setMag(this.cohForce); }

    // flee mouse
    let flee = createVector();
    const md = dist(this.pos.x, this.pos.y, mouseX, mouseY);
    if (md < this.fleeRadius) {
      flee = p5.Vector.sub(this.pos, createVector(mouseX, mouseY));
      flee.setMag(this.fleeForce);
    }

    // wall avoidance
    const margin    = 90;
    const skyBottom = height * 0.65;
    const avoid     = createVector();
    if (this.pos.x < margin)             avoid.x =  (margin - this.pos.x) * 0.06;
    if (this.pos.x > width - margin)     avoid.x = -(this.pos.x - (width - margin)) * 0.06;
    if (this.pos.y < margin)             avoid.y =  (margin - this.pos.y) * 0.06;
    if (this.pos.y > skyBottom - margin) avoid.y = -(this.pos.y - (skyBottom - margin)) * 0.06;

    this.vel.add(sep);
    this.vel.add(ali);
    this.vel.add(coh);
    this.vel.add(flee);
    this.vel.add(avoid);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, skyBottom);
  }

  // draws a two-line chevron rotated to match flight direction
  display() {
    const a = atan2(this.vel.y, this.vel.x);
    stroke(30);
    strokeWeight(1.5);
    noFill();
    push();
    translate(this.pos.x, this.pos.y);
    rotate(a);
    line(0, 0, -9, -5);
    line(0, 0, -9,  5);
    pop();
  }
}

class Raindrop {
  // resets to a random off-screen position so drops are spread on startup
  constructor() {
    this.reset();
    this.y = random(height);
  }

  // randomizes position above screen with Gaussian speed, drift, and length
  reset() {
    this.x     = random(width);
    this.y     = random(-200, -10);
    this.speed = max(5,  13  + randomGaussian() * 2.5);
    this.drift = randomGaussian() * 0.45;
    this.len   = max(8,  18  + randomGaussian() * 3.0);
  }

  // moves drop down and sideways, resets when it leaves the screen
  update() {
    this.y += this.speed;
    this.x += this.drift;
    if (this.y > height || this.x < -20 || this.x > width + 20) this.reset();
  }

  // draws a short angled line representing one raindrop
  display() {
    stroke(160, 180, 255, 170);
    strokeWeight(1.5);
    line(this.x, this.y, this.x + this.drift * 2, this.y + this.len);
  }
}


/* ===== Catapult.pde ===== */
class Catapult {
  // sets up position, pivot, and initial arm angle
  constructor(bodyImg, armImg, axeImgs) {
    this.MAX_PULL   = 220;
    this.MAX_SPEED  = 26;
    this.REST_ANGLE = -PI * 0.85;  // arm rests pointing upper-left
    this.SCALE      = 3;
    this.ARM_LEN    = 72;          // pivot-to-tip distance in screen pixels

    this.bodyImg = bodyImg;
    this.armImg  = armImg;
    this.axeImgs = axeImgs;
    this.bodyPos  = createVector(200, height * 0.80);
    this.pivot    = createVector(this.bodyPos.x, this.bodyPos.y - 85);
    this.armAngle = this.REST_ANGLE;
    this.aiming   = false;
    this.power    = 0;
    this.loadedAxe = null;
  }

  // places a new random axe on the arm and resets state
  reload() {
    this.loadedAxe = new Axe(floor(random(3)), this.axeImgs);
    this.armAngle  = this.REST_ANGLE;
    this.aiming    = false;
    this.power     = 0;
  }

  // enables aiming mode when an axe is loaded
  startAim() {
    if (this.loadedAxe == null) return;
    this.aiming = true;
  }

  // rotates arm toward mouse and sets power by pull distance
  updateAim(mx, my) {
    if (!this.aiming || this.loadedAxe == null) return;
    this.armAngle = atan2(my - this.pivot.y, mx - this.pivot.x);
    this.power    = constrain(dist(mx, my, this.pivot.x, this.pivot.y) / this.MAX_PULL, 0, 1);
  }

  // launches the axe with velocity opposite the pull direction, returns it
  fire() {
    if (this.loadedAxe == null) return null;
    const vel = createVector(-cos(this.armAngle) * this.power * this.MAX_SPEED,
                             -sin(this.armAngle) * this.power * this.MAX_SPEED);
    this.loadedAxe.launch(vel);
    const fired = this.loadedAxe;
    this.loadedAxe = null;
    this.aiming    = false;
    this.power     = 0;
    this.armAngle  = this.REST_ANGLE;
    return fired;
  }

  // returns true while player is pulling back
  isAiming() { return this.aiming; }

  // computes the world position of the arm tip using current angle
  getArmTip() {
    return createVector(this.pivot.x + cos(this.armAngle) * this.ARM_LEN,
                        this.pivot.y + sin(this.armAngle) * this.ARM_LEN);
  }

  // draws body, rotated arm, loaded axe, arc preview, and power bar
  display() {
    const S = this.SCALE;
    imageMode(CENTER);
    image(this.bodyImg, this.bodyPos.x, this.bodyPos.y, this.bodyImg.width * S, this.bodyImg.height * S);

    push();
    translate(this.pivot.x, this.pivot.y);
    rotate(this.armAngle + PI * 0.75);  // corrects for 180° flip (-QUARTER_PI + PI)
    imageMode(CENTER);
    image(this.armImg, 0, 0, this.armImg.width * S, this.armImg.height * S);
    pop();

    // axe sitting at arm tip while loaded
    if (this.loadedAxe != null) {
      this.loadedAxe.pos.set(this.getArmTip());
      this.loadedAxe.display();
    }

    imageMode(CORNER);
    this.drawArcPreview();
    this.drawPowerBar();
  }

  // simulates projectile motion and draws fading dots along the path
  drawArcPreview() {
    if (!this.aiming || this.loadedAxe == null) return;
    const g  = this.loadedAxe.GRAVITY;
    const vx = -cos(this.armAngle) * this.power * this.MAX_SPEED;
    const vy = -sin(this.armAngle) * this.power * this.MAX_SPEED;
    const tip = this.getArmTip();

    noStroke();
    for (let t = 3; t < 55; t += 3) {
      const px = tip.x + vx * t;
      const py = tip.y + vy * t + 0.5 * g * t * t;
      const alpha = map(t, 3, 55, 210, 0);
      fill(255, 255, 100, alpha);
      ellipse(px, py, 5, 5);
    }
  }

  // draws a horizontal bar below the catapult, green to red by power level
  drawPowerBar() {
    if (!this.aiming) return;
    const bw = 120, bh = 10;
    const bx = this.pivot.x - bw * 0.5;
    const by = this.bodyPos.y + 40;

    noStroke();
    fill(50, 50, 50, 180);
    rect(bx, by, bw, bh, 3);
    fill(lerpColor(color(0, 210, 0), color(240, 30, 0), this.power));
    rect(bx, by, bw * this.power, bh, 3);
  }
}


/* ===== Axe.pde ===== */
class Axe {
  // picks sprite and spin speed based on axe type
  constructor(type, axeImgs) {
    // types
    this.DAGGER = 0; this.HEAVY = 1; this.SHURIKEN = 2;
    // states
    this.LOADING = 0; this.FLYING = 1; this.STUCK = 2; this.DEFLECTED = 3; this.EXPLODING = 4;
    this.GRAVITY = 0.4;
    this.SCALE   = 3;

    this.type      = type;
    this.img       = axeImgs[type];
    this.pos       = createVector(0, 0);
    this.vel       = createVector(0, 0);
    this.relOffset = null;
    this.rotation  = 0;
    this.state     = this.LOADING;
    this.explodeTimer = 0;
    this.particles = [];
    const speeds = [0.52, 0.18, 0.76];
    this.rotSpeed = speeds[type];
  }

  // sets velocity and switches state to FLYING
  launch(v) {
    this.vel   = v.copy();
    this.state = this.FLYING;
  }

  // records offset relative to target center and emits gold sparks
  stick(tx, ty) {
    this.relOffset = createVector(this.pos.x - tx, this.pos.y - ty);
    this.state     = this.STUCK;
    this.emitStick();
  }

  // bounces axe away and starts a countdown to explosion
  deflect() {
    this.vel.x *= -0.55;
    this.vel.y  = min(this.vel.y, 0) * -0.35 - 1.5;
    this.state  = this.DEFLECTED;
    this.explodeTimer = 45;
    this.emitDeflect();
  }

  // true while axe is airborne and collidable
  isFlying() { return this.state === this.FLYING; }

  // true when particles are gone or axe has left the screen
  isFinished() {
    if (this.state === this.EXPLODING && this.particles.length === 0) return true;
    if ((this.state === this.FLYING || this.state === this.DEFLECTED) && this.isOffScreen()) return true;
    return false;
  }

  // checks whether axe has traveled outside the visible canvas
  isOffScreen() {
    return this.pos.x < -150 || this.pos.x > width + 150 || this.pos.y > height + 100 || this.pos.y < -400;
  }

  // checks if blade faces the target within per-type angular tolerance
  bladeAligned(angleToTarget) {
    if (this.type === this.SHURIKEN) return true;
    const offsets    = [-HALF_PI, -QUARTER_PI, 0];
    const tolerances = [PI / 2, PI / 4, TWO_PI];
    const bladeDir = this.rotation + offsets[this.type];
    const diff = abs(((angleToTarget - bladeDir) % TWO_PI + 3 * PI) % TWO_PI - PI);
    return diff < tolerances[this.type];
  }

  // advances physics, spin, and particle lifetime each frame
  update() {
    if (this.state === this.FLYING) {
      this.vel.y += this.GRAVITY;
      this.pos.add(this.vel);
      this.rotation += this.rotSpeed;

    } else if (this.state === this.DEFLECTED) {
      this.vel.y += this.GRAVITY;
      this.pos.add(this.vel);
      this.rotation += this.rotSpeed * 0.5;

      if (this.pos.y >= height - 50) {         // hit ground: jitter then explode
        this.pos.y = height - 50;
        this.vel.set(0, 0);
        this.pos.x += random(-2.5, 2.5);
        this.explodeTimer--;
        if (this.explodeTimer <= 0) {
          this.state = this.EXPLODING;
          this.emitExplosion();
        }
      }
    }

    // update particles in all states
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) this.particles.splice(i, 1);
    }
  }

  // draws the rotated sprite and any live particles
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    imageMode(CENTER);
    image(this.img, 0, 0, this.img.width * this.SCALE, this.img.height * this.SCALE);
    pop();
    imageMode(CORNER);
    for (const p of this.particles) p.display();
  }

  // spawns gold sparks on a successful stick
  emitStick() {
    for (let i = 0; i < 14; i++)
      this.particles.push(new Particle(this.pos.x, this.pos.y, color(255, 215, 0), random(4, 9), random(18, 35)));
  }

  // spawns orange sparks when the blade misses alignment
  emitDeflect() {
    for (let i = 0; i < 10; i++)
      this.particles.push(new Particle(this.pos.x, this.pos.y, color(255, 110, 0), random(4, 8), random(15, 30)));
  }

  // bursts fire, yellow, and smoke particles after hitting the ground
  emitExplosion() {
    for (let i = 0; i < 20; i++)
      this.particles.push(new Particle(this.pos.x, this.pos.y, color(255, 70, 0),  random(6, 13), random(28, 50)));
    for (let i = 0; i < 15; i++)
      this.particles.push(new Particle(this.pos.x, this.pos.y, color(255, 220, 50), random(3, 7), random(22, 42)));
    for (let i = 0; i < 10; i++)
      this.particles.push(new Particle(this.pos.x, this.pos.y, color(140, 140, 140), random(8, 16), random(35, 60)));
  }
}

class Particle {
  // spawns at given position with random outward velocity and slight upward bias
  constructor(x, y, c, sz, maxLife) {
    this.pos     = createVector(x, y);
    const a      = random(TWO_PI);
    const speed  = random(1.5, 5.5);
    this.vel     = createVector(cos(a) * speed, sin(a) * speed - 2);
    this.col     = c;
    this.size    = sz;
    this.maxLife = maxLife;
    this.life    = maxLife;
  }

  // applies gravity, drag, and decrements lifetime
  update() {
    this.vel.y += 0.18;
    this.vel.mult(0.97);
    this.pos.add(this.vel);
    this.life--;
  }

  // draws a fading dot whose alpha decreases as life runs out
  display() {
    const alpha = map(this.life, 0, this.maxLife, 0, 255);
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), alpha);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  // true when lifetime has expired and particle can be removed
  isDead() { return this.life <= 0; }
}


/* ===== Target.pde ===== */
class Target {
  // places target at 75% of screen width with a random noise offset seed
  constructor(img, axeImgs) {
    this.SCALE   = 3;
    this.img     = img;
    this.axeImgs = axeImgs;
    this.x       = width * 0.75;
    this.y       = height * 0.45;
    this.noiseT  = random(100);
    this.score   = 0;
    this.stuckAxes = [];
  }

  // bobs target vertically using Perlin noise and moves stuck axes with it
  update() {
    this.noiseT += 0.003;
    this.y = height * 0.42 + (noise(this.noiseT) - 0.5) * height * 1.3;
    for (const axe of this.stuckAxes) {
      axe.pos.set(this.x + axe.relOffset.x, this.y + axe.relOffset.y);
      axe.update();
    }
  }

  // draws the target sprite then all stuck axes on top
  display() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.img.width * this.SCALE, this.img.height * this.SCALE);
    imageMode(CORNER);
    for (const axe of this.stuckAxes) axe.display();
  }

  // sticks or deflects the axe based on hit test and blade alignment
  tryStick(axe) {
    if (!axe.isFlying()) return false;
    if (!this.hits(axe.pos)) return false;
    const angle = atan2(this.y - axe.pos.y, this.x - axe.pos.x);
    if (axe.bladeAligned(angle)) {
      axe.stick(this.x, this.y);
      this.stuckAxes.push(axe);
      this.score++;
      return true;
    }
    axe.deflect();
    return false;
  }

  // clears stuck axes and resets score to zero
  reset() {
    this.stuckAxes = [];
    this.score = 0;
  }

  getScore() { return this.score; }

  // axis-aligned bounding box test against the full sprite dimensions
  hits(pos) {
    const hw = this.img.width  * this.SCALE * 0.5;
    const hh = this.img.height * this.SCALE * 0.5;
    return abs(pos.x - this.x) < hw && abs(pos.y - this.y) < hh;
  }
}
