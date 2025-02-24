// shapeshifter scraper

// Given a puzzle.html file, scrapes the puzzle board, goal
// symbol and list of shapes from the markup. Outputs a file
// containing a representation of the above.

// Usage:
// npm init
// npm i jsdom
// node scraper.js
// Input: puzzle.html
// Output: puzzle.json
// puzzle.json contains the following structure:
// {
//   board: Array<Array<string>>,
//   goal: string,
//   shapes: Array<Array<Array<number>>>
// }

const fs = require("fs");
const jsdom = require("jsdom");

const puzzleHtml = fs.readFileSync("./puzzle.html", "utf8");

const board = [];
let goal = null;
let shapesHtml = null;
let sequence = [];
for (const row of puzzleHtml.split("\n")) {
  // Parse the board
  const res = row.match(/imgLocStr\[(\d+)\]\[(\d+)\] = "(swo|cro|gau)"/);
  if (res) {
    const [_, col, row, shape] = res;
    if (board[row] === undefined) {
      board[row] = [];
    }
    board[row][col] = shape;
  }

  // Parse the goal symbol
  else if (!goal) {
    const res2 = row.match(/image.*(swo|cro|gau).*'i_'[^G]*(GOAL)*/);
    if (res2) {
      sequence.push(res2[1]);
      if (res2[2] === "GOAL") {
        goal = res2[1];
      }
    }
  }

  // Select the long row of shapes
  else if (row.includes("ACTIVE SHAPE")) {
    shapesHtml = row;
  }
}

const DOM = (new jsdom.JSDOM(shapesHtml)).window.document;

const shapes = [];

const tables = DOM.querySelectorAll("table[cellpadding='15']");

const getShape = (tableIn) => {
  const shape = [];
  for (const tr of  tableIn.querySelectorAll("tr")) {
    const row = [];
    for (const td of tr.querySelectorAll("td")) {
      row.push(td.children.length ? 1 : 0);
    }
    shape.push(row);
  }
  return shape;
};

// Active Shape
shapes.push(getShape(tables[0].querySelector("table[border='0']")));

// Loop through each "Next Shapes"
let nextShapes = tables[1]?.querySelectorAll("table[border='0']");
if (!nextShapes) {
  nextShapes = [DOM.querySelectorAll("table[border='0']")[2]];
}
for (const T of nextShapes) {
  shapes.push(getShape(T));
}

// Map board to sequence indices
for (const row of board) {
  for (let i = 0; i < row.length; i++) {
    row[i] = sequence.indexOf(row[i]);
  }
}

goal = sequence.indexOf(goal);

sequence = sequence.map(s => sequence.indexOf(s));

fs.writeFileSync("./puzzle.json", JSON.stringify({
  board,
  goal,
  sequence,
  shapes
}, null, 2));