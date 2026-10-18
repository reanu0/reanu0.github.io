/* Small helpers so Processing (Java) code behaves the same in p5.js. */

// Processing measures arc angles around a stretched ellipse as if it were a
// circle; p5 measures the real angle you see. This converts one to the other,
// so arcs on flat ellipses (the duck bodies) end in the same place.
function pAngle(t, w, h) {
  return Math.atan2(Math.abs(h) * Math.sin(t), Math.abs(w) * Math.cos(t));
}
function arcP(x, y, w, h, start, stop, mode) {
  arc(x, y, w, h, pAngle(start, w, h), pAngle(stop, w, h), mode);
}

// Processing's default arc fills like a pie slice but only outlines the curve.
// p5's default (PIE) also outlines the two straight edges, so draw it in two passes.
function parc(x, y, w, h, start, stop) {
  push(); noStroke(); arcP(x, y, w, h, start, stop, PIE); pop();
  push(); noFill(); arcP(x, y, w, h, start, stop, OPEN); pop();
}

// Processing's textAlign(LEFT) also resets the vertical alignment to BASELINE.
function textAlign1(h) { textAlign(h, BASELINE); }

// Integer division, like Java's int / int
function idiv(a, b) { return Math.trunc(a / b); }
