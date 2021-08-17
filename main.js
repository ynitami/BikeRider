// live server の追加 

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

  for (let i = 0; i < laps * courseBlockCountToFillCanvas; i++) {
    if (h > maxHeight) {
      dh = -diffHeight;
    } else if (h < minHeight) {
      dh = diffHeight;
    } else {
      dh = [dh, dh, dh, dh, 0][randomInt(5)];
    };
    h += dh;
    course.push(h);
  }
  return course;
}

function randomInt(num) {
  return Math.floor(Math.random() * num); // 説明
}

function main() {
  setCanvasSize();
  courseBlocks = createCourseBlocks();
  console.log(courseBlocks);

  for (let i = 0; i < laps * courseBlockCountToFillCanvas; i++) {
    drawRectOnGround(courseBlockWidth * i, courseBlockWidth, courseBlocks[i])
  }
};

main();
