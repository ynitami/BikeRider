/**
 * @type {HTMLCanvasElement}
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 720;
const canvasHeight = 480;
const courseBlockCountToFillCanvas = 100;     // 1canvasあたりブロック数
const courseBlockWidth = canvasWidth / courseBlockCountToFillCanvas;

let courseBlocks;
let courseStartIndex = 0;
const maxHeight = 300;
const minHeight = 50;
const diffHeight = 5;                       // 隣接ブロック間の高低差
const laps = 100;                           // キャンバス100周分のブロック

function setCanvasSize() {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function drawRectOnGround(x, w, h) {
  const y = canvasHeight - h;
  ctx.fillStyle = "#0095DD";
  ctx.fillRect(x, y, w, h);                   // canvas左上から(x,y)の位置に左上の頂点がある長方形
}

function createCourseBlocks() {               // キャンバス100周分全てのブロックの高さを配列で作成

  let h = minHeight + diffHeight * 10;        // 高さ初期値
  let dh = [-diffHeight, 0, diffHeight][randomInt(3)];
  const course = [h];                         // ブロックの高さ配列の第一要素

  for (let i = 0; i < laps * courseBlockCountToFillCanvas; i++) {
    if (course[i - 1] > 0) { // 1つ前にブロックありの場合
      if (randomInt(100) < 5) {
        course.push(0);
        continue;
      }
    } else {
      if (randomInt(100) < 60) {
        course.push(0);
        continue;
      }
    }

    if (dh === 0) {                           // 前のブロックが高さ変化なし
      dh = [-diffHeight, 0, diffHeight][randomInt(3)];
    } else {                                  // 前のブロックが高さ変化あり
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
  return Math.floor(Math.random() * num);     // 切り捨てで、0 ~ (num-1)
}

function main() {
  setCanvasSize();
  courseBlocks = createCourseBlocks();

  setInterval(function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 一度範囲内のブロックを全消去

    for (let i = 0; i < courseBlockCountToFillCanvas; i++) { // 101周目(10001個目)以降はindexを1から再使用
      const courseIndex = (courseStartIndex + i) % courseBlocks.length; // 1st interval: 0~99, 2nd: 1~100,...
      drawRectOnGround(courseBlockWidth * i, courseBlockWidth, courseBlocks[courseIndex])
    }

    courseStartIndex++;

  }, 50);
};
main();
