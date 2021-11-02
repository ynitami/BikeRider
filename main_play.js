/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 720;
const canvasHeight = 480;

let courseBlocks;
let courseStartIndex = 0;

const maxHeight = 300;
const minHeight = 50;
const diffHeight = 5;
const courseBlockCountToFillCanvas = 100;
const laps = 10;
const courseBlockWidth = canvasWidth / courseBlockCountToFillCanvas;

const playerIndexInCanvas = 20;
const playerX = courseBlockWidth * playerIndexInCanvas + courseBlockWidth / 2;
let playerY = canvasHeight - 50;
const dt = 50;

function dy(time) {
  const v0 = 30;
  const g = 3;
  let v;
  return (v = v0 - g * time);
}
const timeAtMaxHeight = 10;
let timeAfterJump = timeAtMaxHeight;

let jumpCount = 0;
let isRightAfterJump = false;
const idleTimeToJump = 5 * dt;

function setCanvasSize() {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) {
  const y = canvasHeight - h;
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, w, h);
}

function createCourseBlocks() {
  let h = minHeight;
  let dh = [-diffHeight, 0, diffHeight][randomInt(3)];
  const course = [h];

  for (let i = 1; i < laps * courseBlockCountToFillCanvas; i++) {
    // 穴あけ
    if (i > courseBlockCountToFillCanvas) {
      if (course[i - 1] > 0) {
        // 1つ前にブロックありの場合
        if (randomInt(100) < 10) {
          course.push(0);
          continue;
        }
      } else if (course[i - 2] > 0) {
        course.push(0);
        continue;
      } else {
        if (randomInt(100) < 30) {
          course.push(0);
          continue;
        }
      }
    }

    if (dh === 0) {
      // 前のブロックが高さ変化なし
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
  ctx.fillStyle = "black";
  ctx.fill(circle);
}

let upPressed = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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

function drawRecord() {
  ctx.font = "24px monospace";
  ctx.fillText(`${courseStartIndex} m`, 60, 40);
}

function main() {
  setCanvasSize();
  courseBlocks = createCourseBlocks();

  const game = setInterval(function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < laps * courseBlockCountToFillCanvas; i++) {
      // 101周目(10001個目)以降はindexを1から再使用
      const courseIndex = (courseStartIndex + i) % courseBlocks.length; // 1st interval: 0~99, 2nd: 1~100,...
      drawRectOnGround(
        courseBlockWidth * i,
        courseBlockWidth,
        courseBlocks[courseIndex]
      );
    }

    const prevPlayerY = playerY; // 1つ前の値 //
    let nextPlayerY; // 今のフレーム
    const prevCourseHeight =
      courseBlocks[
        (courseStartIndex + playerIndexInCanvas - 1) % courseBlocks.length
      ];
    const nextCourseHeight = // courseHeightAtPlayerIndexInCanvas
      courseBlocks[
        (courseStartIndex + playerIndexInCanvas) % courseBlocks.length
      ];

    // ジャンプ中 or 落下中
    if (prevPlayerY > prevCourseHeight) {
      // 空中条件
      if (prevPlayerY + dy(timeAfterJump) >= nextCourseHeight) {
        if (upPressed && !isRightAfterJump && jumpCount < 2) {
          timeAfterJump = 0;
          nextPlayerY = prevPlayerY + dy(timeAfterJump);
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
        // 着地条件 = nextPlayerY <= nextCourseHeight
        // NOTE : 着地成功条件
        // 1. 今崖(prevCH === 0)：prevPlayerY > nextCourseHeight
        // 2. 次崖(nextCH === 0)：常に nextPY = nextCH = 0 でOK
        // 3. 上り(nextCH > prevPY > prevCH = nextCH - diffHeight > 0)：常にOK
        // 4. 下り or 平坦(prevCH >= nextCH > 0)：常にOK
        if (prevPlayerY > nextCourseHeight - diffHeight) {
          nextPlayerY = nextCourseHeight;
          timeAfterJump = 0;

          jumpCount = 0;
        } else {
          // 着地失敗
          clearInterval(game);
        }
      }
    } else {
      // prevPlayerY === prevCourseHeight
      if (prevPlayerY === 0) {
        //落下済み
        clearInterval(game);
      } else if (upPressed) {
        // コース上からの鉛直投げ上げ運動
        timeAfterJump = 0;
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;

        jumpCount++;
        isRightAfterJump = true;
        setTimeout(function () {
          isRightAfterJump = false;
        }, idleTimeToJump);
      } else if (
        // コースが連続
        prevPlayerY === nextCourseHeight ||
        prevPlayerY + diffHeight === nextCourseHeight ||
        prevPlayerY - diffHeight === nextCourseHeight
      ) {
        nextPlayerY = nextCourseHeight;
      } else {
        // 次が崖 or 周回の境界
        timeAfterJump = timeAtMaxHeight; // = 10
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;
      }
    }

    drawPlayer(playerX, (playerY = nextPlayerY), 10);
    courseStartIndex++;
    drawRecord();
  }, dt);
}

main();
