// Bakery game, final project for Introduction to Programming.
// Ported from Processing to p5.js with Claude Opus 5.5 (AI) so it runs in the browser. Each class below
// was its own tab (.pde file) in the original sketch; the logic is unchanged.

/* ===== bakery_assignment.pde ===== */
let app;

function setup() {
  createCanvas(800, 600).parent('stage');
  stroke(0);
  noFill();
  app = new BakeryApp();
}

function draw() {
  if (app != null) app.drawScene();
}

function mousePressed()  { if (app != null) app.onMousePressed();  return false; }
function mouseDragged()  { if (app != null) app.onMouseDragged();  return false; }
function mouseReleased() { if (app != null) app.onMouseReleased(); return false; }


/* ===== BakeryApp.pde ===== */
class BakeryApp {
  constructor() {
    this.bakery = new Bakery();
    this.bakeryPipe = new Pipe(-90, -90);
    this.breads = [];
    this.conveyor = new Conveyor(-20, 140, 400);
    this.basket = new Basket(340, 200, 0.4);
    this.trash = new Trash(720, 550, 0.5);
    this.draggingBread = null; // currently dragged bread (null if none)

    this.priceTracker = new PriceTracker();
    this.popups = []; // list of score popups

    this.autoSpawnInterval = 3000; // spawn every 3s
    this.lastSpawn = 0;
  }

  drawScene() {
    background('#FFF2CC'); // cream background
    // draw pipe behind the storefront
    this.bakeryPipe.display();
    this.bakery.drawBackground();

    // back trash layer (so bread can fall "into" the bin)
    this.trash.displayBack();
    this.conveyor.display();
    this.basket.display();

    // update physics for breads (gravity + belt movement)
    for (const b of this.breads) b.update(this.conveyor);
    // render breads (they will appear above Trash_back)
    for (const b of this.breads) b.display();

    // front trash layer (drawn above breads for depth effect)
    this.trash.displayFront();

    this.priceTracker.display(10, 10);

    // update and display score popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const popup = this.popups[i];
      popup.update();
      popup.display();
      if (popup.isExpired()) this.popups.splice(i, 1);
    }

    // check for bread collection in basket or deletion in trash
    for (let i = this.breads.length - 1; i >= 0; i--) {
      const b = this.breads[i];
      if (!b.dragging && this.basket.containsBread(b) && b.vy > 0) {
        this.popups.push(new ScorePopup(b.x, b.y - 30, "+2.50"));
        this.priceTracker.addBread();
        if (b === this.draggingBread) this.draggingBread = null;
        this.breads.splice(i, 1);
        continue;
      }
      if (this.trash.containsBread(b)) {
        if (b === this.draggingBread) this.draggingBread = null;
        this.breads.splice(i, 1);
      }
    }

    // remove breads that are fully outside the display area
    for (let i = this.breads.length - 1; i >= 0; i--) {
      const b = this.breads[i];
      if (b.isFullyOutOfDisplay()) {
        if (b === this.draggingBread) this.draggingBread = null;
        this.breads.splice(i, 1);
      }
    }

    // automatic spawning: add a new bread at intervals
    if (millis() - this.lastSpawn >= this.autoSpawnInterval) {
      this.addRandomBread();
      this.lastSpawn = millis();
    }

    // apply time-of-day overlay (must be last to cover everything)
    this.drawTimeOverlay();
  }

  onMousePressed() {
    for (let i = this.breads.length - 1; i >= 0; i--) { // top-to-bottom priority
      const b = this.breads[i];
      if (b.contains(mouseX, mouseY)) {
        this.draggingBread = b;
        b.startDrag(mouseX, mouseY);
        this.breads.splice(i, 1);
        this.breads.push(b); // bring to front
        break;
      }
    }
  }

  onMouseDragged() {
    if (this.draggingBread != null) this.draggingBread.drag(mouseX, mouseY);
  }

  onMouseReleased() {
    if (this.draggingBread != null) this.draggingBread.stopDrag();
    this.draggingBread = null;
  }

  // Spawn a new bread at the pipe exit with random length
  addRandomBread() {
    const len = random(60, 160);
    const x = this.bakeryPipe.x + 250;
    const y = this.bakeryPipe.y + 300;
    // Rarely spawn a duck instead of bread
    if (random(1) < DUCK_SPAWN_CHANCE) this.breads.push(new Duck(x, y, len));
    else this.breads.push(new Bread(x, y, len));
  }

  // Draw time-of-day overlay based on current hour and minute
  drawTimeOverlay() {
    const timeInHours = hour() + minute() / 60.0;
    let overlayAlpha = 0;
    const overlayColor = color(20, 30, 60); // dark blueish color for night

    if (timeInHours >= 7.483 && timeInHours < 17.3) {
      overlayAlpha = 0;                                                  // Daylight
    } else if (timeInHours >= 6.883 && timeInHours < 7.483) {
      overlayAlpha = map(timeInHours, 6.883, 7.483, 80, 0);              // Civil twilight morning
    } else if (timeInHours >= 17.3 && timeInHours < 17.883) {
      overlayAlpha = map(timeInHours, 17.3, 17.883, 0, 80);              // Civil twilight evening
    } else if (timeInHours >= 6.217 && timeInHours < 6.883) {
      overlayAlpha = map(timeInHours, 6.217, 6.883, 120, 80);            // Nautical twilight morning
    } else if (timeInHours >= 17.883 && timeInHours < 18.55) {
      overlayAlpha = map(timeInHours, 17.883, 18.55, 80, 120);           // Nautical twilight evening
    } else if (timeInHours >= 5.567 && timeInHours < 6.217) {
      overlayAlpha = map(timeInHours, 5.567, 6.217, 150, 120);           // Astronomical twilight morning
    } else if (timeInHours >= 18.55 && timeInHours < 19.217) {
      overlayAlpha = map(timeInHours, 18.55, 19.217, 120, 150);          // Astronomical twilight evening
    } else {
      overlayAlpha = 150;                                                // Night
    }

    if (overlayAlpha > 0) {
      fill(red(overlayColor), green(overlayColor), blue(overlayColor), overlayAlpha);
      noStroke();
      rect(0, 0, width, height);
      stroke(0);
    }
  }
}


/* ===== Bakery.pde ===== */
// Bakery background class: draws decorative 3D frame and title
class Bakery {
  drawBackground() {
    fill('#F5E588'); // Left edge (3D frame)
    beginShape(); vertex(0, 600); vertex(0, 0); vertex(60, 60); vertex(60, 540); vertex(0, 600); endShape(CLOSE);

    fill('#E3C060'); // Top edge
    beginShape(); vertex(0, 0); vertex(800, 0); vertex(740, 60); vertex(60, 60); vertex(0, 0); endShape(CLOSE);

    fill('#F5E588'); // Right edge
    beginShape(); vertex(800, 0); vertex(800, 600); vertex(740, 540); vertex(740, 60); vertex(800, 0); endShape(CLOSE);

    fill('#C69F30'); // Bottom edge
    beginShape(); vertex(0, 600); vertex(800, 600); vertex(740, 540); vertex(60, 540); vertex(0, 600); endShape(CLOSE);

    // Storefront sign (Castellar in the original; Cinzel is the free web stand-in)
    rect(60, 60, 680, 80);
    textAlign(CENTER, CENTER);
    textFont('Cinzel');
    textSize(42);
    fill('#000000');
    text("Bakery - Pastry shop", 400, 100);
  }
}


/* ===== Pipe.pde ===== */
// Pipe class: bakery pipe that spawns bread
class Pipe {
  constructor(x, y) { this.x = x; this.y = y; }

  // Draw vertical pipe with rounded bottom
  display() {
    const x = this.x, y = this.y;
    stroke(0);
    fill(192, 192, 192);
    beginShape();
    vertex(x + 200, y + 140);
    vertex(x + 200, y + 300);
    vertex(x + 300, y + 300);
    vertex(x + 300, y + 140);
    endShape(CLOSE);
    parc(x + 250, y + 300, 100, 40, 0.000, 3.142); // rounded bottom
  }
}


/* ===== Conveyor.pde ===== */
class Conveyor {
  constructor(x, y, switchInterval) {
    this.x = x;
    this.y = y;
    this.switchInterval = switchInterval; // time between animation frames (ms)
    this.lastSwitch = millis();
    this.showFirstFrame = true;
    this.beltSpeed = 1.0; // pixels per frame to the right
  }

  display() {
    if (millis() - this.lastSwitch >= this.switchInterval) {
      this.showFirstFrame = !this.showFirstFrame;
      this.lastSwitch = millis();
    }
    stroke(0);
    noFill();
    if (this.showFirstFrame) this.drawFrameOne(this.x, this.y);
    else this.drawFrameTwo(this.x, this.y);
  }

  // Collision detection: belt boundaries
  beltLeft()    { return this.x + 100; }
  beltRight()   { return this.x + 580; }
  beltTop()     { return this.y + 240; }
  beltBottom()  { return this.y + 400; }
  beltSurfaceY(){ return this.y + 360; }
  beltCenterY() { return (this.beltTop() + this.beltBottom()) * 0.48; } // landing line for gravity

  // The belt body, wheels and outline are the same in both frames
  drawBody(conx, cony) {
    fill('#8c8c8c');
    noStroke();
    ellipse(conx + 100, cony + 380, 40, 40);
    ellipse(conx + 580, cony + 380, 40, 40);
    beginShape();
      vertex(conx + 90, cony + 385);
      vertex(conx + 130, cony + 242);
      vertex(conx + 630, cony + 241);
      vertex(conx + 600, cony + 386);
    endShape(CLOSE);
    triangle(conx + 130, cony + 242, conx + 90, cony + 385, conx + 86, cony + 360);
    triangle(conx + 630, cony + 241, conx + 600, cony + 386, conx + 640, cony + 255);
    rect(conx + 100, cony + 380, 480, 20);
    stroke(0);
    ellipse(conx + 100, cony + 380, 40, 40);
    ellipse(conx + 580, cony + 380, 40, 40);
    parc(conx + 140, cony + 260, 40, 40, 3.927, 4.712);
    parc(conx + 620, cony + 260, 40, 40, 4.712, 6.283);
    line(conx + 127, cony + 246, conx + 81, cony + 374);
    line(conx + 139, cony + 241, conx + 622, cony + 240);
    line(conx + 639, cony + 259, conx + 600, cony + 381);
    line(conx + 580, cony + 360, conx + 100, cony + 360);
    line(conx + 100, cony + 400, conx + 580, cony + 400);
  }

  // Animation frame 1: belt lines in position 1
  drawFrameOne(conx, cony) {
    this.drawBody(conx, cony);
    for (let i = 160; i <= 600; i += 40) line(conx + i, cony + 240, conx + i - 40, cony + 360);
    line(conx + 80, cony + 380, conx + 120, cony + 380);
    line(conx + 560, cony + 380, conx + 600, cony + 380);
  }

  // Animation frame 2: belt lines in position 2
  drawFrameTwo(conx, cony) {
    this.drawBody(conx, cony);
    line(conx + 100, cony + 360, conx + 100, cony + 400);
    line(conx + 580, cony + 360, conx + 580, cony + 400);
    for (let i = 140; i <= 620; i += 40) line(conx + i, cony + 240, conx + i - 40, cony + 360);
  }
}


/* ===== Basket.pde ===== */
// Basket class: decorative basket drawn with scaled geometry
class Basket {
  constructor(x, y, scale) { this.x = x; this.y = y; this.scale = scale; }

  display() {
    stroke(0);
    noFill();
    const bx = this.x, by = this.y, s = this.scale;

    fill('#A8886A');
    beginShape();
      vertex(bx + 240*s, by + 250*s);
      vertex(bx + 440*s, by + 250*s);
      vertex(bx + 450*s, by + 250*s);
      vertex(bx + 470*s, by + 145*s);
      vertex(bx + 220*s, by + 145*s);
    endShape(CLOSE);
    fill('#F0E8D8');
    beginShape();
      vertex(bx + 450*s, by + 190*s);
      vertex(bx + 460*s, by + 190*s);
      vertex(bx + 470*s, by + 145*s);
      vertex(bx + 220*s, by + 145*s);
      vertex(bx + 230*s, by + 190*s);
    endShape(CLOSE);
    fill('#B0A799');
    ellipse(bx + 345*s, by + 145*s, 250*s, 50*s);
    fill('#A8886A');
    parc(bx + 345*s, by + 250*s, 210*s, 20*s, 0.000, 3.142);
    fill('#F0E8D8');
    parc(bx + 345*s, by + 190*s, 230*s, 20*s, 0.000, 3.142);
    noFill();
    line(bx + 235*s, by + 170*s, bx + 287*s, by + 176*s);
    line(bx + 260*s, by + 184*s, bx + 300*s, by + 180*s);
    line(bx + 460*s, by + 166*s, bx + 408*s, by + 175*s);
    line(bx + 445*s, by + 180*s, bx + 426*s, by + 178*s);
    line(bx + 432*s, by + 194*s, bx + 385*s, by + 188*s);
    line(bx + 294*s, by + 196*s, bx + 341*s, by + 186*s);
    line(bx + 344*s, by + 177*s, bx + 391*s, by + 180*s);

    // Small shelf under the basket
    fill('#8B7355');
    stroke(0);
    rect(bx + 220*s, by + 255*s, 250*s, 15*s);
  }

  // Check if a bread is inside the basket area
  containsBread(b) {
    const basketCenterX = this.x + 340 * this.scale;
    const basketCenterY = this.y + 225 * this.scale;
    const basketWidth = 340 * this.scale;
    const basketHeight = 90 * this.scale;
    const dx = (b.x - basketCenterX) / (basketWidth * 0.5);
    const dy = (b.y - basketCenterY) / (basketHeight * 0.5);
    return (dx*dx + dy*dy) <= 1.0;
  }
}


/* ===== Trash.pde ===== */
// Trash bin class: front layer in front of bread and back layer behind bread
class Trash {
  constructor(x, y, scale) { this.x = x; this.y = y; this.scale = scale; }

  displayBack() {
    const x = this.x, y = this.y, s = this.scale;
    stroke(0);
    fill(80);
    beginShape();
    vertex((x + 490)*s, (y + 410)*s);
    vertex((x + 720)*s, (y + 410)*s);
    vertex((x + 750)*s, (y + 450)*s);
    vertex((x + 460)*s, (y + 450)*s);
    endShape(CLOSE);
  }

  displayFront() {
    const x = this.x, y = this.y, s = this.scale;
    stroke(0);
    fill(180);
    beginShape();
    vertex((x + 460)*s, (y + 450)*s);
    vertex((x + 750)*s, (y + 450)*s);
    vertex((x + 750)*s, (y + 570)*s);
    vertex((x + 460)*s, (y + 570)*s);
    endShape(CLOSE);

    // recycle symbol
    stroke(0);
    line((x + 550)*s, (y + 520)*s, (x + 590)*s, (y + 470)*s);
    line((x + 580)*s, (y + 470)*s, (x + 590)*s, (y + 470)*s);
    line((x + 590)*s, (y + 470)*s, (x + 590)*s, (y + 480)*s);
    line((x + 600)*s, (y + 470)*s, (x + 630)*s, (y + 510)*s);
    line((x + 620)*s, (y + 510)*s, (x + 630)*s, (y + 510)*s);
    line((x + 630)*s, (y + 510)*s, (x + 630)*s, (y + 500)*s);
    line((x + 630)*s, (y + 520)*s, (x + 560)*s, (y + 520)*s);
    line((x + 560)*s, (y + 520)*s, (x + 570)*s, (y + 510)*s);
    line((x + 560)*s, (y + 520)*s, (x + 570)*s, (y + 530)*s);
  }

  // Expanded boundaries to catch even large breads reliably
  containsBread(b) {
    const s = this.scale;
    const left = (this.x + 420) * s;
    const right = (this.x + 790) * s;
    const top = (this.y + 420) * s;
    const bottom = (this.y + 590) * s;
    return b.x >= left && b.x <= right && b.y >= top && b.y <= bottom;
  }
}


/* ===== Bread.pde ===== */
// Bread class: draggable bread with physics (gravity + belt movement)
class Bread {
  constructor(x, y, len) {
    this.x = x;
    this.y = y;
    this.breadLength = len;      // ellipse width
    this.breadHeight = 50.5;     // ellipse height
    this.dragging = false;
    this.offsetX = 0; this.offsetY = 0;
    this.vy = 0;                 // vertical velocity
    this.gravity = 0.35;         // downward acceleration (px/frame^2)
    this.angle = 0;              // current rotation (radians)
    this.fallRotateSpeed = 0.025;
    this.supportEdgeOffset = 50; // px beyond belt edge before overhang counts

    // pick a random colour within a warm/brown-golden spectrum using HSB
    const h = random(20, 40);
    const s = random(40, 85);
    const b = random(45, 95);
    colorMode(HSB, 360, 100, 100);
    this.breadColor = color(h, s, b);
    colorMode(RGB, 255);
  }

  // Draw bread ellipse with decorative cuts
  display() {
    const L = this.breadLength, H = this.breadHeight;
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    stroke(0);
    fill(this.breadColor);
    ellipse(0, 0, L, H);
    line(-L * 0.225, -H * 0.445, -2.5, -H * 0.18);
    line(-L * 0.36,  -H * 0.34,  -L * 0.187, -H * 0.094);
    line(-L * 0.054, -H * 0.495,  L * 0.135, -H * 0.242);

    // hover overlay if the mouse is over this bread
    if (this.contains(mouseX, mouseY)) {
      noStroke();
      fill(0, 0, 0, 80);
      ellipse(0, 0, L, H);
      stroke(0);
    }
    pop();
  }

  // Check if point (mx, my) is inside the bread ellipse
  contains(mx, my) {
    const rx = this.breadLength * 0.5;
    const ry = this.breadHeight * 0.5;
    const nx = (mx - this.x) / rx;
    const ny = (my - this.y) / ry;
    return nx*nx + ny*ny <= 1.0;
  }

  startDrag(mx, my) {
    this.dragging = true;
    this.offsetX = mx - this.x;
    this.offsetY = my - this.y;
  }

  drag(mx, my) {
    if (this.dragging) {
      this.x = mx - this.offsetX;
      this.y = my - this.offsetY;
    }
  }

  stopDrag() { this.dragging = false; }

  isFullyOutOfDisplay() {
    const rx = this.breadLength * 0.5, ry = this.breadHeight * 0.5;
    return (this.x + rx < 0) || (this.x - rx > width) || (this.y + ry < 0) || (this.y - ry > height);
  }

  // Check if bread overlaps the conveyor belt (bounding-box test)
  touchesConveyor(c) {
    const rx = this.breadLength * 0.5, ry = this.breadHeight * 0.5;
    const left = this.x - rx, right = this.x + rx, top = this.y - ry, bottom = this.y + ry;
    return !(right < c.beltLeft() || left > c.beltRight() || bottom < c.beltTop() || top > c.beltBottom());
  }

  // Physics update: gravity, landing, and belt movement
  update(c) {
    if (this.dragging) return;

    this.vy += this.gravity;
    this.y += this.vy;

    const rx = this.breadLength * 0.5;
    const left = this.x - rx;
    const right = this.x + rx;

    // landing: snap to belt centerline when crossing from above
    const overBeltHorizontally = right >= c.beltLeft() && left <= c.beltRight();
    const center = c.beltCenterY();
    const prevY = this.y - this.vy;
    if (overBeltHorizontally && prevY <= center && this.y >= center) {
      this.y = center;
      this.vy = 0;
    }

    const maxTilt = radians(36);
    if (this.touchesConveyor(c)) {
      this.x += c.beltSpeed;

      // left and right edge contact points
      const cosA = cos(this.angle);
      const leftPX = this.x - cosA * rx;
      const rightPX = this.x + cosA * rx;
      const leftOn = (leftPX >= c.beltLeft() && leftPX <= c.beltRight());
      const rightOn = (rightPX >= c.beltLeft() && rightPX <= (c.beltRight() + this.supportEdgeOffset));

      if (leftOn && rightOn) {
        this.angle = lerp(this.angle, 0, 0.18);                              // both supported
      } else if (leftOn && !rightOn) {
        this.angle = min(this.angle + this.fallRotateSpeed, maxTilt);        // overhang right
      } else if (!leftOn && rightOn) {
        this.angle = max(this.angle - this.fallRotateSpeed, -maxTilt);       // overhang left
      } else {
        this.angle = min(this.angle + this.fallRotateSpeed, maxTilt);
      }
    } else {
      this.angle = min(this.angle + this.fallRotateSpeed, maxTilt);          // free fall
    }
  }
}


/* ===== duck.pde ===== */
// Duck class: behaves exactly like Bread but draws a duck instead of an ellipse.
const DUCK_SPAWN_CHANCE = 0.05; // 5% chance to spawn a duck instead of bread

class Duck extends Bread {
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    const s = this.breadLength; // use length as base scale
    const bodyColor = color('#FFFF52');
    const hovered = this.contains(mouseX, mouseY);
    const shade = hovered ? 0.35 : 0.0;
    const cBody = (shade > 0) ? lerpColor(bodyColor, color(0), shade) : bodyColor;

    stroke(0);
    fill(cBody);
    parc(-0.16*s, 0.02*s, 0.06*s, 0.28*s, PI/2, 3*HALF_PI);            // chest
    parc(-0.06*s, -0.06*s, 0.25*s, 0.63*s, PI, 2*PI);                   // head
    noStroke();
    arcP(0.025*s, 0.025*s, 0.78*s, 0.31*s, -2*PI/3, 2*PI/3, CHORD);      // body
    stroke(0);
    noFill();
    arcP(0.025*s, 0.025*s, 0.78*s, 0.31*s, -17*PI/36, 2*PI/3, OPEN);
    fill(cBody);
    parc(-0.17*s, -0.19*s, 0.09*s, 0.03*s, HALF_PI, 3*HALF_PI);         // beak
    parc(-0.17*s, -0.16*s, 0.09*s, 0.03*s, HALF_PI, 3*HALF_PI);
    arcP(0.09*s, 0.03*s, 0.31*s, 0.19*s, -2*PI/3, 2*PI/3, OPEN);         // wings
    fill('#000000');
    noStroke();
    circle(-0.04*s, -0.22*s, 0.02*s);                                   // eyes
    circle(-0.12*s, -0.26*s, 0.02*s);
    pop();
  }
}


/* ===== Scores.pde ===== */
// PriceTracker: keeps track of total basket value
class PriceTracker {
  constructor() {
    this.totalPrice = 0;
    this.pricePerBread = 2.50;
    this.breadCount = 0;
  }
  addBread() { this.breadCount++; this.totalPrice += this.pricePerBread; }
  reset() { this.totalPrice = 0; this.breadCount = 0; }
  display(x, y) {
    textFont('Arial');
    fill(0);
    textAlign(LEFT, TOP);
    textSize(16);
    text("Basket: " + this.breadCount + " bread(s)", x, y);
    text("Total: $" + nf(this.totalPrice, 0, 2), x, y + 20);
  }
  getTotal() { return this.totalPrice; }
  getCount() { return this.breadCount; }
}

// ScorePopup: floating "+2.50" text that fades out
class ScorePopup {
  constructor(x, y, txt) {
    this.x = x;
    this.y = y;
    this.vy = -1.5;          // upward velocity
    this.startTime = millis();
    this.duration = 1500;    // milliseconds
    this.text = txt;
  }
  update() { this.y += this.vy; }
  display() {
    const elapsed = millis() - this.startTime;
    const alpha = constrain(map(elapsed, 0, this.duration, 255, 0), 0, 255);
    fill(0, 150, 0, alpha);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(this.text, this.x, this.y);
  }
  isExpired() { return (millis() - this.startTime) >= this.duration; }
}
