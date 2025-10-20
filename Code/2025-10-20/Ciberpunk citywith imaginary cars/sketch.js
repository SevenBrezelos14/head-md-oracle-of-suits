let cars = [];
let buildings = [];
let camX = 0;
let camY = 150; // start at street level inside city
let camZ = 0;
let speed = 15;
let yaw = 0;

let cityChunkSize = 1000;
let generatedChunks = new Set(); 

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Generate initial city around starting camera position
  generateCity(camX, camZ);

  // Cars spawn at heights within the city
  for (let i = 0; i < 100; i++) {
    let b = random(buildings); // choose a random building to fly near
    cars.push({
      pos: createVector(
        b.x + random(-b.w, b.w),
        random(50, b.h - 20), // fly through the building height
        b.z + random(-b.depth, b.depth)
      ),
      vel: createVector(random(-5,5), random(-1,1), random(-5,5)),
      colourPhase: random(1000)
    });
  }
}

function draw() {
  // Purple neon gradient sky
  setGradient(color(20, 0, 50), color(80, 0, 150));

  handleControls();
  camera(camX, camY, camZ, camX + cos(yaw), camY, camZ + sin(yaw), 0, 1, 0);

  // Generate more city chunks as you move
  generateCity(camX, camZ);

  ambientLight(60, 60, 100);
  pointLight(255, 0, 255, sin(frameCount*0.01)*1000 + camX, camY+200, camZ+400);
  pointLight(0, 255, 255, -sin(frameCount*0.012)*1000 + camX, camY-200, camZ-500);

  // Floor grid
  push();
  rotateX(HALF_PI);
  for (let x=-4000; x<4000; x+=100){
    for (let z=-4000; z<4000; z+=100){
      let glow = map(sin(frameCount*0.03 + x*0.01 + z*0.01), -1,1,50,255);
      fill(200,0,255,glow);
      rect(x,z,80,80);
    }
  }
  pop();

  // Draw buildings
  for (let b of buildings){
    push();
    translate(b.x, -b.h/2, b.z);
    let r = map(sin(frameCount*0.02 + b.glow), -1,1,100,255);
    let g = map(sin(frameCount*0.015 + b.glow + PI/2), -1,1,0,200);
    let bl = map(sin(frameCount*0.025 + b.glow + PI/4), -1,1,150,255);
    ambientMaterial(r,g,bl);
    box(b.w, b.h, b.depth);
    pop();
  }

  // Update and draw cars inside the city
  for (let c of cars){
    c.pos.add(c.vel);

    // Keep cars within city vertical bounds
    if (c.pos.y < 50) c.vel.y *= -1;
    if (c.pos.y > 400) c.vel.y *= -1;
    if (abs(c.pos.x - camX) > 2000) c.vel.x *= -1;
    if (abs(c.pos.z - camZ) > 2000) c.vel.z *= -1;

    let r = map(sin(frameCount*0.03 + c.colourPhase), -1,1,150,255);
    let g = map(sin(frameCount*0.025 + c.colourPhase + PI/3), -1,1,50,255);
    let b = map(sin(frameCount*0.02 + c.colourPhase + PI/2), -1,1,100,255);

    push();
    translate(c.pos.x, c.pos.y, c.pos.z);
    rotateY(frameCount*0.02 + c.pos.x*0.001);
    ambientMaterial(r,g,b);
    box(80,30,40);

    // Headlights
    push(); translate(40,0,15); emissiveMaterial(255,200,100); sphere(6); pop();
    push(); translate(40,0,-15); emissiveMaterial(255,200,100); sphere(6); pop();

    // Jet exhaust
    push(); translate(-40,0,0); emissiveMaterial(255,random(150,255),50); sphere(10 + sin(frameCount*0.2 + c.colourPhase)*4); pop();
    pop();
  }
}

function handleControls(){
  if(keyIsDown(87)) { camX += cos(yaw)*speed; camZ += sin(yaw)*speed; } // W
  if(keyIsDown(83)) { camX -= cos(yaw)*speed; camZ -= sin(yaw)*speed; } // S
  if(keyIsDown(65)) { camX += sin(yaw)*speed; camZ -= cos(yaw)*speed; } // A
  if(keyIsDown(68)) { camX -= sin(yaw)*speed; camZ += cos(yaw)*speed; } // D
  if(keyIsDown(81) || keyIsDown(90)) camY -= speed; // Q/Z down
  if(keyIsDown(69) || keyIsDown(88)) camY += speed; // E/X up
  if(keyIsDown(LEFT_ARROW)) yaw -= 0.05;
  if(keyIsDown(RIGHT_ARROW)) yaw += 0.05;
}

function generateCity(cx, cz){
  let chunkX = Math.floor(cx / cityChunkSize);
  let chunkZ = Math.floor(cz / cityChunkSize);
  for(let dx=-2; dx<=2; dx++){
    for(let dz=-2; dz<=2; dz++){
      let key = (chunkX+dx)+","+(chunkZ+dz);
      if(!generatedChunks.has(key)){
        generatedChunks.add(key);
        generateBuildingsForChunk((chunkX+dx)*cityChunkSize, (chunkZ+dz)*cityChunkSize);
      }
    }
  }
}

function generateBuildingsForChunk(offsetX, offsetZ){
  let numBuildings = Math.floor(random(8,20));
  for(let i=0;i<numBuildings;i++){
    buildings.push({
      x: offsetX + random(-cityChunkSize/2, cityChunkSize/2),
      z: offsetZ + random(-cityChunkSize/2, cityChunkSize/2),
      h: random(200,400), // building heights allow flying through
      w: random(40,120),
      depth: random(40,120),
      glow: random(1000)
    });
  }
}

function setGradient(c1,c2){
  for(let y=-height/2; y<height/2; y++){
    let inter = map(y,-height/2,height/2,0,1);
    let c = lerpColor(c1,c2,inter);
    push(); noStroke(); fill(c); rect(-width/2, y, width, 1); pop();
  }
}

function windowResized(){ resizeCanvas(windowWidth, windowHeight); }

