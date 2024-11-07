let disks = [];
let towers = [];
let moves = [];
let currentMove = 0;
let moveInterval = 1000;
let diskHeight = 25;
let diskWidthUnit = 35;
let towerWidth = 12;
let towerHeight = 200;
let baseHeight = 20;
let difficulty = 3;
let animating = false;
let lastMoveTime = 0;
let movingDisk = null;
let movingDiskX = 0;
let movingDiskY = 0;
let movingDiskStartX = 0;
let movingDiskEndX = 0;
let movingDiskStartY = 0;
let movingDiskEndY = 0;
let movingPhase = 0;
let isPlaying = false;
let speed = 1000;

// Stack representation with recursion depth
let stack = [];
let recursionDepth = 0;

// UI State
let buttonsY = 20;
let buttonHeight = 40;
let buttonSpacing = 10;

function setup() {
  createCanvas(1000, 600);
  textAlign(CENTER, CENTER);
  initializeTowers();
  createButtons();
}

function createButtons() {
  // Create UI buttons
  buttons = [
    { label: "Decrease Disks", action: () => setDifficulty(Math.max(3, difficulty - 1)), x: 20 },
    { label: "Increase Disks", action: () => setDifficulty(Math.min(7, difficulty + 1)), x: 150 },
    { label: "Faster", action: () => setSpeed(Math.max(200, speed - 200)), x: 280 },
    { label: "Slower", action: () => setSpeed(Math.min(2000, speed + 200)), x: 380 },
    { label: "Play/Pause", action: togglePlay, x: 480 },
    { label: "Reset", action: initializeTowers, x: 580 },
    { label: "Solve", action: startSimulation, x: 680 }
  ];
}

function setSpeed(newSpeed) {
  speed = newSpeed;
  moveInterval = speed;
}

function setDifficulty(newDifficulty) {
  difficulty = newDifficulty;
  initializeTowers();
}

function togglePlay() {
  if (moves.length > 0) {
    isPlaying = !isPlaying;
    if (isPlaying) lastMoveTime = millis();
  }
}

function initializeTowers() {
  disks = [];
  towers = [[], [], []];
  moves = [];
  stack = [];
  currentMove = 0;
  animating = false;
  isPlaying = false;
  movingDisk = null;
  
  // Initialize disks with rainbow colors - now with correct sizing
  for (let i = 0; i < difficulty; i++) {
    const hue = map(i, 0, difficulty - 1, 0, 300);
    disks.push({
      width: (difficulty - i) * diskWidthUnit, // Larger numbers = wider disks
      height: diskHeight,
      color: color(hue, 70, 60)
    });
    towers[0].push(i); // Push index in order (0 = smallest, difficulty-1 = largest)
  }
}

function mousePressed() {
  // Check button clicks
  if (mouseY >= buttonsY && mouseY <= buttonsY + buttonHeight) {
    for (let button of buttons) {
      if (mouseX >= button.x && mouseX <= button.x + 100) {
        button.action();
        return;
      }
    }
  }
}

function startSimulation() {
  moves = [];
  stack = [];
  recursionDepth = 0;
  solveTowerOfHanoi(difficulty, 0, 2, 1);
  animating = true;
  isPlaying = true;
  lastMoveTime = millis();
}

function solveTowerOfHanoi(n, from, to, aux, depth = 0) {
  // Push current state to stack with depth information
  stack.push({
    depth: depth,
    disks: towers.map(t => [...t]),
    move: { from, to, n },
    description: `Move disk ${n} from Tower ${from + 1} to Tower ${to + 1}`
  });

  if (n === 1) {
    moves.push([from, to]);
    return;
  }
  
  solveTowerOfHanoi(n - 1, from, aux, to, depth + 1);
  moves.push([from, to]);
  solveTowerOfHanoi(n - 1, aux, to, from, depth + 1);
}

function draw() {
  background(240);
  
  // Draw UI buttons
  drawButtons();
  
  // Draw game area
  push();
  translate(100, 100);
  
  // Draw towers
  for (let i = 0; i < 3; i++) {
    drawTower(i);
  }
  
  // Draw static disks
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < towers[i].length; j++) {
      drawDisk(towers[i][j], i, j);
    }
  }
  
  // Draw moving disk
  if (movingDisk !== null) {
    fill(disks[movingDisk].color);
    noStroke();
    rect(movingDiskX - disks[movingDisk].width / 2,
         movingDiskY,
         disks[movingDisk].width,
         diskHeight,
         5);
  }
  pop();
  
  // Draw move counter and speed
  drawStats();
  
  // Draw stack representation
  drawStack();
  
  // Animate moves
  if (isPlaying && currentMove < moves.length) {
    animateMove();
  }
}

function drawButtons() {
  for (let button of buttons) {
    let isHovered = mouseX >= button.x && mouseX <= button.x + 100 &&
                    mouseY >= buttonsY && mouseY <= buttonsY + buttonHeight;
    
    fill(isHovered ? 200 : 220);
    stroke(150);
    rect(button.x, buttonsY, 100, buttonHeight, 5);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text(button.label, button.x + 50, buttonsY + buttonHeight/2);
  }
}

function drawTower(index) {
  // Draw base
  fill(80);
  noStroke();
  rect(index * 200 - 80, 300, 160, baseHeight, 4);
  
  // Draw pole
  fill(100);
  rect(index * 200 - towerWidth/2, 100, towerWidth, towerHeight, 2);
  
  // Draw label
  fill(0);
  textSize(16);
  text(`Tower ${index + 1}`, index * 200, 340);

}

function drawDisk(diskIndex, towerIndex, position) {
  let disk = disks[diskIndex];
  fill(disk.color);
  noStroke();
  rect(towerIndex * 200 - disk.width/2,
       300 - (position + 1) * diskHeight,
       disk.width,
       diskHeight,
       5);
}

function drawStats() {
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Moves: ${currentMove} / ${moves.length}`, 20, 80);
 text(`Speed: ${speed} ms`, 20, 100);

  if (currentMove === moves.length && moves.length > 0) {
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Complete!", width/2, 60);
  }
}

function drawStack() {
  // Draw stack panel
  fill(255);
  stroke(200);
  rect(700, 100, 280, 450, 5);
  
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text("Recursion Stack", 720, 120);
  
  // Draw stack entries
  let y = 150;
  for (let i = Math.max(0, currentMove - 10); i < Math.min(stack.length, currentMove + 10); i++) {
    let state = stack[i];
    
    // Highlight current move
    if (i === currentMove) {
      fill(200, 220, 255);
      noStroke();
      rect(720, y - 5, 240, 40, 3);
    }
    
    fill(0);
    textSize(12);
    textAlign(LEFT, TOP);
    
    // Indent based on recursion depth
    let x = 730 + state.depth * 10;
    text(state.description, x, y);
    text(`Depth: ${state.depth}`, x, y + 15);

    
    y += 45;
  }
}

function animateMove() {
  if (movingDisk === null) {
    if (millis() - lastMoveTime > moveInterval) {
      let [from, to] = moves[currentMove];
      movingDisk = towers[from].pop();
      movingDiskStartX = from * 200;
      movingDiskEndX = to * 200;
      movingDiskStartY = 300 - (towers[from].length + 1) * diskHeight;
      movingDiskEndY = 300 - (towers[to].length + 1) * diskHeight;
      movingDiskX = movingDiskStartX;
      movingDiskY = movingDiskStartY;
      movingPhase = 0;
      lastMoveTime = millis();
    }
  } else {
    let progress = (millis() - lastMoveTime) / (moveInterval / 3);
    
    if (movingPhase === 0) {
      // Move up
      movingDiskY = lerp(movingDiskStartY, 100, progress);
      if (progress >= 1) {
        movingPhase = 1;
        lastMoveTime = millis();
      }
    } else if (movingPhase === 1) {
      // Move horizontally
      movingDiskX = lerp(movingDiskStartX, movingDiskEndX, progress);
      if (progress >= 1) {
        movingPhase = 2;
        lastMoveTime = millis();
      }
    } else if (movingPhase === 2) {
      // Move down
      movingDiskY = lerp(100, movingDiskEndY, progress);
      if (progress >= 1) {
        let [from, to] = moves[currentMove];
        towers[to].push(movingDisk);
        movingDisk = null;
        currentMove++;
        lastMoveTime = millis();
        
        if (currentMove === moves.length) {
          isPlaying = false;
        }
      }
    }
  }
}
