
/**
 * @type {HTMLCanvasElement}  // canvasに使えるメソッドをtab入力候補に
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 720;
const canvasHeight = 480;
const courseBlockCountToFillCanvas = 100; // ブロック数/canvas
const courseBlockWidth = canvasWidth / courseBlockCountToFillCanvas;

let courseBlocks;
let courseStartIndex = 0;
const maxHeight = 300;
const minHeight = 50;
const diffHeight = 5;
const laps = 10; // キャンバス100周分のブロック
const courseDiffHeight = 5;

const playerIndexInCanvas = 20;
const playerX = courseBlockWidth * playerIndexInCanvas + courseBlockWidth / 2;
let playerY = canvasHeight;

function dy(time) {
  const v0 = 30;
  const g = 3;
  return v0 - g * time;
}
const timeAtMaxHeight = 10;
let timeAfterJump = timeAtMaxHeight;

function drawPlayer(x, y, radius) {
  const circle = new Path2D();
  circle.arc(x, canvasHeight - y - radius, radius, 0, 2 * Math.PI);
  const prevFillStyle = ctx.fillStyle;
  ctx.fillStyle = "blue";
  ctx.fill(circle);
  ctx.fillStyle = prevFillStyle;
};

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

function setCanvasSize() {  // @type {HTMLCanvasElement} 使用
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) { // setInterval()で呼び出し
  const y = canvasHeight - h;
  ctx.fillStyle = "#0095DD";// canvasで四角形を描画
  ctx.fillRect(x, y, w, h);
}

// キャンバス100周分全てのブロックの高さを作成
function createCourseBlocks() {
  let h = minHeight + diffHeight * 10; // 高さ初期値
  let dh = [-diffHeight, 0, diffHeight][randomInt(0, 2)];
  const res = [h + dh]; // ブロックの高さ配列

  for (let i = 1; i < laps * courseBlockCountToFillCanvas; i++) {
    if (res[i - 1] > 0) { // 1つ前にブロックありの場合
      if (randomInt(0, 99) < 5) {
        res.push(0);
        continue;
      }
    } else {
      if (randomInt(0, 99) < 60) {
        res.push(0);
        continue;
      }
    }

    if (h > maxHeight || h < minHeight) {
      dh = h > maxHeight ? -diffHeight : diffHeight; // 三項演算子(論理値? T : F)
      // if文で書く h>max　と　h<min の2パターンで説明
      h += dh;
      res.push(h);
      continue;
    }

    if (dh === 0) {
      dh = [-diffHeight, 0, diffHeight][randomInt(0, 2)];
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
courseBlocks = createCourseBlocks(); // 変数に関数を代入


setInterval(function () {
  // 一度範囲内を全消去
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 101周目(10001個目)以降はindexを1から再使用
  for (let i = 0; i < courseBlockCountToFillCanvas; i++) {
    const courseIndex = (courseStartIndex + i) % courseBlocks.length;
    drawRectOnGround(courseBlockWidth * i, courseBlockWidth, courseBlocks[courseIndex])
  }

  const prevPlayerY = playerY;
  let nextPlayerY;

  const prevCourseHeight = courseBlocks[(courseStartIndex + playerIndexInCanvas - 1)] % courseBlocks.length
  const nextCourseHeight = courseBlocks[(courseStartIndex + playerIndexInCanvas) % courseBlocks.length];

  if (prevPlayerY > prevCourseHeight) { // ジャンプ中
    if (prevPlayerY + dy(timeAfterJump) > nextCourseHeight) { // まだ空中
      nextPlayerY = prevPlayerY + dy(timeAfterJump);
      timeAfterJump++;
    } else {
      // NOTE: prevPlayerY > nextCourseHeight だと、登りのコースへの着地に失敗する場合がある
      if (prevPlayerY >= nextCourseHeight - courseDiffHeight) { // 着地OK
        nextPlayerY = nextCourseHeight;
        timeAfterJump = 0;
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
      if (upPressed) {
        timeAfterJump = 0;
        nextPlayerY = prevPlayerY + dy(timeAfterJump);
        timeAfterJump++;
      } else {
        nextPlayerY = nextCourseHeight;
      }
    } else { // 次が崖
      timeAfterJump = timeAtMaxHeight;
      nextPlayerY = prevPlayerY + dy(timeAfterJump);
      timeAfterJump++;
    }
  }

  drawPlayer(playerX, playerY = nextPlayerY, 10);
  courseStartIndex++;

}, 50 /*ms後に再度実行*/);
// };
// main();