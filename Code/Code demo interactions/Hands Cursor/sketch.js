// === STEP 1: HAND + CURSOR ===

// Global variables
let cursorX = 0;
let cursorY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupHands();     // from MediaPipeHands.js
  setupVideo();     // from MediaPipeHands.js
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  // Draw live video
  if (isVideoReady()) {
    image(videoElement, 0, 0, width, height);
  }

  // Update palm center from hand landmarks
  if (detections && detections.multiHandLandmarks.length > 0) {
    let hand = detections.multiHandLandmarks[0];
    let wrist = hand[0];
    let midBase = hand[9]; // base of middle finger

    // Scale to canvas size (not videoElement size)
    cursorX = ((wrist.x + midBase.x) / 2) * width;
    cursorY = ((wrist.y + midBase.y) / 2) * height;
  }

  // Draw red cursor
  noStroke();
  fill(255, 0, 0);
  circle(cursorX, cursorY, 12); // smaller cursor
}
