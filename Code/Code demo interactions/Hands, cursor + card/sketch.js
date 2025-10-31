// === STEP 1: HAND + CURSOR ===

// Global variables
let cursorX = 0;
let cursorY = 0;
let cardImg = null; // image variable

function preload() {
  const imgPath = '../Swiss_landscape 1.png';
  cardImg = loadImage(
    imgPath,
    () => console.log('Card image loaded:', imgPath),
    (err) => {
      console.warn('Failed to load card image:', imgPath, err);
      cardImg = null;
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER); // center images by default

  // initialize MediaPipe video/hands (provided in MediaPipeHands.js)
  // These should create and use a hidden video element for detection.
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
  // white background — webcam NOT drawn to canvas (keeps privacy / blank background)
  background(255);

  // Draw the card image centered on top of the canvas
  if (cardImg) {
    const cardW = 400; // adjust size if needed
    const cardH = 600;
    // white rounded background behind image to hide any underlying visuals
    push();
    rectMode(CENTER);
    noStroke();
    fill(255);
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = 'rgba(0,0,0,0.12)';
    rect(width / 2, height / 2, cardW + 24, cardH + 24, 20);
    drawingContext.shadowBlur = 0;
    pop();

    image(cardImg, width / 2, height / 2, cardW, cardH);
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

// keep onResults global so MediaPipeHands.js can call it
function onResults(results) {
  // MediaPipe should call this; store detections for draw()
  detections = results;
}
