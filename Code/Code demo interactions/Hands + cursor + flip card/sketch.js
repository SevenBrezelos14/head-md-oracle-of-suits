// === STEP 1: HAND + CURSOR ===

// Global variables
let cursorX = 0;
let cursorY = 0;
let cardImg = null; // image variable
let frameImg = null; // NEW: alternate image

function preload() {
  const imgPath = '../Swiss_landscape 1.png';
  const framePath = '../Frame 9036.png'; // NEW

  cardImg = loadImage(
    imgPath,
    () => console.log('Card image loaded:', imgPath),
    (err) => {
      console.warn('Failed to load card image:', imgPath, err);
      cardImg = null;
    }
  );

  // NEW: preload frame image
  frameImg = loadImage(
    framePath,
    () => console.log('Frame image loaded:', framePath),
    (err) => {
      console.warn('Failed to load frame image:', framePath, err);
      frameImg = null;
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER); // center images by default

  // initialize MediaPipe video/hands (provided in MediaPipeHands.js)
  if (typeof setupVideo === 'function') setupVideo();
  if (typeof setupHands === 'function') setupHands();

  // start cursor roughly centered
  cursorX = width / 2;
  cursorY = height / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  // --- decide which image to show based on closed fist ---
  let useFrame = false;
  if (typeof detections !== 'undefined' && detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {
    const hand = detections.multiHandLandmarks[0];
    if (hand && hand.length >= 21) {
      const wrist = hand[0];
      const tips = [4, 8, 12, 16, 20];
      let total = 0;
      for (let i = 0; i < tips.length; i++) {
        const t = hand[tips[i]];
        total += dist(t.x, t.y, wrist.x, wrist.y);
      }
      const avg = total / tips.length;

      // --- DEBUG: print values so you can see what's happening ---
      console.log('avg fingertip distance:', avg);

      // --- FIX: make threshold adaptive (looser) ---
      // Try around 0.25 first; adjust after checking console values.
      useFrame = avg < 0.25;
    }
  }

  const imgToDraw = useFrame && frameImg ? frameImg : cardImg;

  // Draw the card image centered on top of the canvas
  if (imgToDraw) {
    const cardW = 400;
    const cardH = 600;
    push();
    rectMode(CENTER);
    noStroke();
    fill(255);
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = 'rgba(0,0,0,0.12)';
    rect(width / 2, height / 2, cardW + 24, cardH + 24, 20);
    drawingContext.shadowBlur = 0;
    pop();

    image(imgToDraw, width / 2, height / 2, cardW, cardH);
  } else {
    push();
    fill(60);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Loading Swiss_landscape 1.png...', width / 2, height / 2);
    pop();
  }

  // Update palm center from hand landmarks (if available)
  if (typeof detections !== 'undefined' && detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {
    const hand = detections.multiHandLandmarks[0];
    if (hand && hand.length >= 10) {
      const wrist = hand[0];
      const midBase = hand[9];
      cursorX = ((wrist.x + midBase.x) / 2) * width;
      cursorY = ((wrist.y + midBase.y) / 2) * height;
    }
  }

  // Draw red cursor
  noStroke();
  fill(255, 0, 0);
  const cx = isFinite(cursorX) ? cursorX : width / 2;
  const cy = isFinite(cursorY) ? cursorY : height / 2;
  circle(cx, cy, 12); // cursor size

  // optional: small status overlay
  push();
  noStroke();
  fill(0);
  textSize(12);
  textAlign(LEFT, TOP);
  const handsCount = (typeof detections !== 'undefined' && detections && detections.multiHandLandmarks) ? detections.multiHandLandmarks.length : 0;
  text(`hands: ${handsCount}`, 10, 10);
  pop();
}

function onResults(results) {
  detections = results;
}
