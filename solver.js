// shapeshifter solver stub

const puzzle = require("./puzzle.json");

const board = puzzle.board;

const goal = puzzle.goal;
const solution = board.map(row => row.map(() => goal));

const shapes = puzzle.shapes;

const sequence = puzzle.sequence;
const seqLength = sequence.length;

function applyShapeToBoard(board, shape) {
  const newBoard = board.map(row => row.slice());
  for (const [x, y] of shape) {
    newBoard[y][x] = (newBoard[y][x] + 1) % seqLength;
  }
  return newBoard;
}



let x = 0;
let y = 0;
const stack = [shapes[0]];
while (stack.length) {
  const shape = stack.pop();
  const newBoard = applyShapeToBoard(board, shape);
  if (JSON.stringify(newBoard) === JSON.stringify(solution)) {
    console.log(`Found solution: ${shape}`);
    break;
  }
  stack.push();
}