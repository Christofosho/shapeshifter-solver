// shapeshifter solver stub

console.log(`${new Date().toISOString()} Run begins...`);

const puzzle = require("./puzzle.json");

const board = puzzle.board;

const goal = puzzle.goal;

const shapes = puzzle.shapes.map((shape, index) => ({
  shape,
  index,
  count: shape.reduce((total, row) => {
    for (const cell of row) {
      if (cell === 1) {
        ++total;
      }
    }
    return total;
  }, 0),
}));
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
const sortedShapes = shapes.toSorted((a, b) => {
  return shapeValues[b.index] - shapeValues[a.index];
});

const sequence = puzzle.sequence;
const seqLength = sequence.length;

console.log(`${new Date().toISOString()} ${shapes.length} shapes, ${seqLength} sequence, ${board.length}x${board[0].length} board`);

let totalComplexity = 1;
for (const shape of shapes) {
  let currentComplexity = 0;
  for (let y = 0; y <= board.length - shape.shape.length; y++) {
    for (let x = 0; x <= board[0].length - shape.shape[0].length; x++) {
      ++currentComplexity;
    }
  }
  totalComplexity *= currentComplexity;
}
console.log(`Total complexity without optimizations: ${totalComplexity}`);

function tilesUnsolved(board) {
  let unsolved = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== goal) {
        ++unsolved;
      }
    }
  }
  return unsolved;
}

function applyShapeToBoard(shape, x, y) {
  for (let i = 0; i < shape.length; ++i) {
    for (let j = 0; j < shape[i].length; ++j) {
      if (shape[i][j] === 1) {
        board[y + i][x + j] = (board[y + i][x + j] + 1) % seqLength;
      }
    }
  }
}

function removeShapeFromBoard(shape, x, y) {
  for (let i = 0; i < shape.length; ++i) {
    for (let j = 0; j < shape[i].length; ++j) {
      if (shape[i][j] === 1) {
        const next = (board[y + i][x + j] - 1);
        board[y + i][x + j] = next < 0 ? seqLength - 1 : next;
      }
    }
  }
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

console.log(`${new Date().toISOString()} Applying shapes...`);

const cache = {};

let shapeTiles = sortedShapes.reduce((total, shape) => {
  for (const row of shape.shape) {
    for (const cell of row) {
      if (cell === 1) {
        ++total;
      }
    }
  }
  return total;
}, 0);

const stack = [];
const dive = (shapeIndex, boardX, boardY) => {
  // Basic heuristic check: if there are more tiles needing flipped than shape tiles remaining, skip.
  const unsolvedBoardTiles = tilesUnsolved(board);

  if (unsolvedBoardTiles > shapeTiles) {
    // console.log("Skipping", shapeIndex, "at", boardX, boardY);
    // console.log(unsolved, "unsolved, and only", remaining, "remaining");
    return false;
  }

  applyShapeToBoard(sortedShapes[shapeIndex].shape, boardX, boardY);
  stack.push({ index: sortedShapes[shapeIndex].index, pos: [boardX, boardY] });
  shapeTiles -= sortedShapes[shapeIndex].count;

  if (shapeIndex < shapes.length - 1) {
    const nextIndex = shapeIndex + 1;
    const nextShape = sortedShapes[nextIndex].shape;
    for (let y = 0; y <= board.length - nextShape.length; y++) {
      for (let x = 0; x <= board[0].length - nextShape[0].length; x++) {
        const undo = dive(nextIndex, x, y);
        if (nextIndex + 1 === shapes.length) {
          if (isSolution(board)) {
            stack.sort((a, b) => a.index - b.index);
            stack.forEach(({ index, pos }) => {
              console.log(pos, "with index", index, "for shape", shapes[index].shape);
            });
            console.log(`${new Date().toISOString()} Solution found!`);
            throw "done";
          }
        }
        if (undo) {
          removeShapeFromBoard(nextShape, x, y);
          stack.pop();
          shapeTiles += sortedShapes[nextIndex].count;
        }
      }
    }
  }
  return true;
}

for (let y = 0; y <= board.length - sortedShapes[0].shape.length; y++) {
  for (let x = 0; x <= board[0].length - sortedShapes[0].shape[0].length; x++) {
    const undo = dive(0, x, y);
    if (undo) {
      removeShapeFromBoard(sortedShapes[0].shape[0], x, y);
      stack.pop();
    }
  }
}

// const stack = [{ shape: sortedShapes[0], xy: [0, 0] }];
// while (stack.length) {
//   const nextBoards = [];
//   const shape = sortedShapes.pop().shape;
//   for (const currentBoard of boards) {
//     for (let y = 0; y <= board.length - shape.length; y++) {
//       for (let x = 0; x <= board[0].length - shape[0].length; x++) {
//         nextBoards.push({
//           board: applyShapeToBoard(currentBoard.board, shape, x, y),
//           xy: currentBoard.xy.concat([{ index, pos: [x, y] }]),
//         });
//       }
//     }
//   }

//   boards = nextBoards;
//   --index;
// }



// console.log(`${new Date().toISOString()} Checking solutions...`);

// for (const board of boards) {
//   if (isSolution(board.board)) {
//     console.log("Solved:");
//     console.log(board);
//     board.xy.sort((a, b) => sortedCopy[a.index].index - sortedCopy[b.index].index);
//     board.xy.forEach(({ index, pos }) => {
//       console.log(shapes[index].shape, " at ", pos);
//     });
//     break;
//   }
// }

console.log(`Run ends at ${new Date().toISOString()}`);