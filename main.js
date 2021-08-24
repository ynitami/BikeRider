/**
 * @type {HTMLCanvasElement}
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 720;
const canvasHeight = 480;

let courseBlocks;
const maxHeight = 300;
const minHeight = 50;
const diffHeight = 5;
const courseBlockCountToFillCanvas = 100;
const laps = 100;
const courseBlockWidth = canvasWidth / courseBlockCountToFillCanvas;

const playerIndexInCanvas = 20;
const playerX = courseBlockWidth * playerIndexInCanvas + courseBlockWidth / 2;
let playerY = canvasHeight;
const dy = 5;

let upPressed = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function setCanvasSize() {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) {
  const y = canvasHeight - h;
  ctx.fillStyle = "#0095DD";
  ctx.fillRect(x, y, w, h);
}

function createCourseBlocks() {
  let h = minHeight + diffHeight * 10;
  let dh = [-diffHeight, 0, diffHeight][randomInt(3)];
  const course = [h];

  for (let i = 1; i < laps * courseBlockCountToFillCanvas; i++) {
    // 穴あけ
    if (course[i - 1] > 0) {                 // 1つ前にブロックありの場合
      if (randomInt(100) < 10) {
        course.push(0);
        continue;
      }
    } else {
      if (randomInt(100) < 80) {
        course.push(0);
        continue;
      }
    }

    if (dh === 0) {                           // 前のブロックが高さ変化なし
      dh = [-diffHeight, 0, diffHeight][randomInt(3)];
    } else {
      if (h > maxHeight) {
        dh = -diffHeight;
      } else if (h < minHeight) {
        dh = diffHeight;
      } else {
        dh = [dh, dh, dh, dh, 0][randomInt(5)];
      }
    }
    h += dh;
    course.push(h);
  }
  return course;
}

function randomInt(num) {
  return Math.floor(Math.random() * num);
}

function drawPlayer(x, y, radius) {
  const circle = new Path2D();
  circle.arc(x, canvasHeight - y - radius, radius, 0, 2 * Math.PI);
  const prevFillStyle = ctx.fillStyle;
  ctx.fillStyle = "blue";
  ctx.fill(circle);
  ctx.fillStyle = prevFillStyle;
};

function keyDownHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = false;
  }
}

function main() {
  setCanvasSize();
  courseBlocks = createCourseBlocks();
  let courseStartIndex = 0;

  setInterval(function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < laps * courseBlockCountToFillCanvas; i++) { // 101周目(10001個目)以降はindexを1から再使用
      const courseIndex = (courseStartIndex + i) % courseBlocks.length; // 1st interval: 0~99, 2nd: 1~100,...
      drawRectOnGround(courseBlockWidth * i, courseBlockWidth, courseBlocks[courseIndex])
    }

    const courseHeightAtPlayerIndexInCanvas = courseBlocks[courseStartIndex + playerIndexInCanvas]
    // 
    if (
      playerY == courseHeightAtPlayerIndexInCanvas ||
      playerY == courseHeightAtPlayerIndexInCanvas + diffHeight ||
      playerY == courseHeightAtPlayerIndexInCanvas - diffHeight
    ) {
      if (upPressed) {
        playerY += dy * 20;
      } else {
        playerY = courseHeightAtPlayerIndexInCanvas
      }
    } else if (
      playerY >= courseHeightAtPlayerIndexInCanvas &&
      playerY <= courseHeightAtPlayerIndexInCanvas + dy
    ) {
      playerY = courseHeightAtPlayerIndexInCanvas;
    } else {
      playerY -= dy;
    }

    drawPlayer(playerX, playerY, 10);
    courseStartIndex++;

  }, 50);
};

main();
