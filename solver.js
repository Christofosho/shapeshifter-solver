// shapeshifter solver stub

// 1. Sort shapes with largest first.
// 2. Find all placements of the largest shape.
// 3. For each placement, find all placements of the next largest shape.
// 4. Repeat until all shapes have been placed.
// 5. If a solution is found, print it and exit.

console.log(`${new Date().toISOString()} Run begins...`);

const puzzle = require("./puzzle.json");

const board = puzzle.board;

const goal = puzzle.goal;

const shapes = puzzle.shapes.map((shape, index) => ({ shape, index }));
const shapeValues = [];
for (const i in shapes) {
  let total = 0;
  for (const row of shapes[i].shape) {
    for (const cell of row) {
      total += parseInt(cell);
    }
  }
  shapeValues.push(total);
}

// Inefficient sort because other things will take longer.
const sortedShapes = [...shapes].sort((a, b) => {
  return shapeValues[a.index] - shapeValues[b.index];
});

const sortedCopy = [...sortedShapes];

const sequence = puzzle.sequence;
const seqLength = sequence.length;

function applyShapeToBoard(board, shape, x, y) {
  const newBoard = board.map(row => row.slice());
  for (let i = 0; i < shape.length; ++i) {
    for (let j = 0; j < shape[i].length; ++j) {
      if (shape[i][j] === 1) {
        newBoard[y + i][x + j] = (newBoard[y + i][x + j] + 1) % seqLength;
      }
    }
  }
  return newBoard;
}

// All shapes can only be placed at at minimum an offset of their width and height,
// so we can skip the first few rows and columns and the last few rows and columns.
// Solution uses a stack to perform a depth-first search.
// For each piece, the solution tries to place it in every possible position on the board.
// It saves each possible board state.
// For each initial board state, the solution tries to place the next piece in every possible position.
console.log(`${new Date().toISOString()} Applying shapes...`);

// Start with the largest shape
let boards = [];
let index = sortedShapes.length - 1;
let shape = sortedShapes.pop().shape;

for (let y = 0; y <= board.length - shape.length; y++) {
  for (let x = 0; x <= board[0].length - shape[0].length; x++) {
    boards.push({
      board: applyShapeToBoard(board, shape, x, y),
      xy: [{ index, pos: [x, y]}],
    });
  }
}

--index;
while (sortedShapes.length) {
  const nextBoards = [];
  shape = sortedShapes.pop().shape;
  for (const currentBoard of boards) {
    for (let y = 0; y <= board.length - shape.length; y++) {
      for (let x = 0; x <= board[0].length - shape[0].length; x++) {
        nextBoards.push({
          board: applyShapeToBoard(currentBoard.board, shape, x, y),
          xy: currentBoard.xy.concat([{ index, pos: [x, y] }]),
        });
      }
    }
  }

  boards = nextBoards;
  --index;
}

// Check if board equals solution
function isSolution(board) {
  for (const row of board) {
    for (const cell of row) {
      if (cell !== goal) {
        return false;
      }
    }
  }
  return true;
}

console.log(`${new Date().toISOString()} Checking solutions...`);

for (const board of boards) {
  if (isSolution(board.board)) {
    console.log("Solved:");
    console.log(board);
    board.xy.sort((a, b) => sortedCopy[a.index].index - sortedCopy[b.index].index);
    board.xy.forEach(({ index, pos }) => {
      console.log(shapes[index].shape, " at ", pos);
    });
    break;
  }
}

console.log(`Run ends at ${new Date().toISOString()}`);