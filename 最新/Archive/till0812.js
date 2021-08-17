
/**
 * @type {HTMLCanvasElement}  // canvasに使えるメソッドをtab入力候補に
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 720;
const canvasHeight = 720;
const canvasDivisionLength = 100; // ブロック数/canvas
const canvasDivisionWidth = canvasWidth / canvasDivisionLength;

let course;
let courseIndex = 0;
const courseMaxHeight = 300;
const courseMinHeight = 50;
const courseLaps = 10; // キャンバス100周分のブロック
const courseDiffHeight = 5;

const playerIndexInCanvas = 20;
const playerX = canvasDivisionWidth * playerIndexInCanvas + canvasDivisionWidth / 2;
let playerY = canvasHeight;

function dy(time) {
  const v0 = 30;
  const g = 3;
  return v0 - g * time;
}
const timeAtMaxHeight = 10;
let timeAfterJump = timeAtMaxHeight;

let jumpCount = 0;
let isRightAfterJump = false;

function setCanvasSize() {  // @type {HTMLCanvasElement} 使用
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) { // setInterval()で呼び出し
  const y = canvasHeight - h;
  ctx.fillStyle = "#0095DD";// canvasで四角形を描画
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

// キャンバス100周分全てのブロックの高さを作成
function createCourseBlocks() {
  let h = courseMinHeight; // 高さ初期値
  let dh = [-courseDiffHeight, 0, courseDiffHeight][randomInt(0, 2)];
  const res = [h + dh]; // ブロックの高さ配列

  for (let i = 1; i < courseLaps * canvasDivisionLength; i++) {
    // if (res[i - 1] > 0) { // 1つ前にブロックありの場合
    //   if (randomInt(0, 99) < 5) {
    //     res.push(0);
    //     continue;
    //   }
    // } else {
    //   if (randomInt(0, 99) < 80) {
    //     res.push(0);
    //     continue;
    //   }
    // }

    if (h > courseMaxHeight || h < courseMinHeight) {
      dh = h > courseMaxHeight ? -courseDiffHeight : courseDiffHeight; // 三項演算子(論理値? T : F)
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

// function main() {
setCanvasSize();
course = createCourseBlocks(); // 変数に関数を代入

const game = setInterval(function () {
  // 一度範囲内を全消去
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 101周目(10001個目)以降はindexを1から再使用
  for (let i = 0; i < canvasDivisionLength; i++) {
    const courseIndex = (courseIndex + i) % course.length;
    drawRectOnGround(canvasDivisionWidth * i, canvasDivisionWidth, course[courseIndex])
  }

  const prevPlayerY = playerY;
  let nextPlayerY;

  const prevCourseHeight = course[(courseIndex + playerIndexInCanvas - 1)] % course.length
  const nextCourseHeight = course[(courseIndex + playerIndexInCanvas) % course.length];

  if (prevPlayerY > prevCourseHeight) { // ジャンプ中
    if (prevPlayerY + dy(timeAfterJump) > nextCourseHeight) { // まだ空中
      if (topPressed && !isRightAfterJump && jumpCount < 2) {
        timeAfterJump = 0;
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;

        jumpCount++;
        isRightAfterJump = true;
        setTimeout(function () { isRightAfterJump = false; }, 500);
      } else {
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;
      }
    } else {
      // NOTE: prevPlayerY > nextCourseHeight だと、登りのコースへの着地に失敗する場合がある
      if (prevPlayerY >= nextCourseHeight - courseDiffHeight) { // 着地OK
        nextPlayerY = nextCourseHeight;
        timeAfterJump = 0;

        jumpCount = 0;
      } else { // 壁にぶつかる
        clearInterval(game);
      }
    }
  } else if (prevPlayerY === prevCourseHeight) {
    if (prevPlayerY === 0) { //落下済み
      clearInterval(game);
    } else if ( // コースが連続
      prevPlayerY === nextCourseHeight ||
      prevPlayerY + courseDiffHeight === nextCourseHeight ||
      prevPlayerY - courseDiffHeight === nextCourseHeight
    ) {
      if (topPressed) {
        timeAfterJump = 0;
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;

        jumpCount++;
        isRightAfterJump = true;
        setTimeout(function () { isRightAfterJump = false; }, 500);
      } else {
        nextPlayerY = nextCourseHeight;
      }
    } else { // 次が崖 または境界
      timeAfterJump = timeAtMaxHeight;
      nextPlayerY = prevPlayerY + dy(timeAfterJump);
      timeAfterJump++;
    }
  }

  drawPlayer(playerX, (playerY = nextPlayerY), 10);
  courseIndex++;

}, 50 /*ms後に再度実行*/);
// };
// main();