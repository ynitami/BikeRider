
/**
 * @type {HTMLDivElement}
 */
const canvasWrapper = document.getElementById("canvas-wrapper");

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 720;
const canvasHeight = 480;

const canvasDivisionLength = 100;
const canvasDivisionWidth = canvasWidth / canvasDivisionLength;

let course;
let courseIndex = 0;
const courseLaps = 10;
const courseMaxHeight = 300;
const courseMinHeight = 50;
const courseDiffHeight = 5;

const playerIndexInCanvas = 20;
const playerX = canvasDivisionWidth * playerIndexInCanvas + canvasDivisionWidth / 2;
let playerY = canvasHeight;

const dt = 50;

function dy(time) {
  const v0 = 30;
  const g = 3;
  return v0 - g * time;
}
const timeAtMaxHeight = 10;
let timeAfterJump = timeAtMaxHeight;

let jumpCount = 0;
let isRightAfterJump = false;
const idleTimeToJump = 11 * dt;

function setCanvasSize() {
  canvasWrapper.style.width = `${canvasWidth}px`;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) {
  const y = canvasHeight - h;
  ctx.fillRect(x, y, w, h);
}

function drawPlayer(x, y, radius) {
  const circle = new Path2D();
  circle.arc(x, canvasHeight - y - radius, radius, 0, 2 * Math.PI);
  const prevFillStyle = ctx.fillStyle;
  ctx.fillStyle = "blue";
  ctx.fill(circle);
  ctx.fillStyle = prevFillStyle;
}

function createCourse() {
  let h = courseMinHeight;
  let dh = [-courseDiffHeight, 0, courseDiffHeight][randomInt(0, 2)];
  const res = [h + dh];

  for (let i = 1; i < courseLaps * canvasDivisionLength; i++) {
    if (i > canvasDivisionLength) {
      if (res[i - 1] > 0) {
        if (randomInt(0, 99) < 5) {
          res.push(0);
          continue;
        }
      } else {
        if (randomInt(0, 99) < 80) {
          res.push(0);
          continue;
        }
      }
    }

    if (h > courseMaxHeight || h < courseMinHeight) {
      dh = h > courseMaxHeight ? -courseDiffHeight : courseDiffHeight;
      h += dh;
      res.push(h);
      continue;
    }

    if (dh === 0) {
      dh = [-courseDiffHeight, 0, courseDiffHeight][randomInt(0, 2)];
    } else {
      dh = [dh, dh, dh, dh, 0][randomInt(0, 4)];
    }
    h += dh;
    res.push(h);
  }

  return res;
}

function randomInt(min, max) {
  const size = max - min + 1;
  return Math.floor(Math.random() * size) + min;
}

function drawRecord() {
  ctx.font = "24px monospace";
  ctx.fillText(`${courseIndex} m`, 60, 40);
}

// main
setCanvasSize();

course = createCourse();

let topPressed = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp") {
    topPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.key == "Up" || e.key == "ArrowUp") {
    topPressed = false;
  }
}

const game = setInterval(function () {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < canvasDivisionLength; i++) {
    const index = (courseIndex + i) % course.length;
    drawRectOnGround(canvasDivisionWidth * i, canvasDivisionWidth, course[index]);
  }

  const prevPlayerY = playerY;
  let nextPlayerY;

  const prevCourseHeight = course[(courseIndex + playerIndexInCanvas - 1) % course.length];
  const nextCourseHeight = course[(courseIndex + playerIndexInCanvas) % course.length];

  if (prevPlayerY > prevCourseHeight) {
    if (prevPlayerY + dy(timeAfterJump) > nextCourseHeight) {
      if (jumpCount < 2 && !isRightAfterJump && topPressed) {
        nextPlayerY = prevPlayerY + dy((timeAfterJump = 0));
        timeAfterJump++;

        jumpCount++;
        isRightAfterJump = true;
        setTimeout(function () {
          isRightAfterJump = false;
        }, idleTimeToJump);
      } else {
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;
      }
    } else {
      // NOTE: prevPlayerY > nextCourseHeight だと、登りのコースへの着地に失敗する場合がある
      if (prevPlayerY >= nextCourseHeight - courseDiffHeight) {
        nextPlayerY = nextCourseHeight;
        timeAfterJump = 0;

        jumpCount = 0;
      } else {
        clearInterval(game);
      }
    }
  } else if (prevPlayerY === prevCourseHeight) {
    if (prevPlayerY === 0) {
      clearInterval(game);
    } else if (
      prevPlayerY === nextCourseHeight ||
      prevPlayerY + courseDiffHeight === nextCourseHeight ||
      prevPlayerY - courseDiffHeight === nextCourseHeight
    ) {
      if (topPressed) {
        nextPlayerY = prevPlayerY + dy((timeAfterJump = 0));
        timeAfterJump++;

        jumpCount++;
        isRightAfterJump = true;
        setTimeout(function () {
          isRightAfterJump = false;
        }, idleTimeToJump);
      } else {
        nextPlayerY = nextCourseHeight;
      }
    } else {
      nextPlayerY = prevPlayerY + dy((timeAfterJump = timeAtMaxHeight));
      timeAfterJump++;
    }
  }

  drawPlayer(playerX, (playerY = nextPlayerY), 10);
  drawRecord();
  courseIndex++;
}, dt);