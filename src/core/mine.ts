import { Coord, FieldCell, Field } from 'core/types';
import { isCoordEqual, isArrIncludesCoord } from './auxs';

export const RATES = { normal: 0.12, hard: 0.18, expert: 0.24 };

const generateMines = (x: number, y: number, rate: number, cleanCell: Coord): Coord[] => {
  const noMineCoords = [cleanCell, ...around8Coords(cleanCell, x, y)];
  let mineCount = Math.floor(x * y * rate);
  let mines: Coord[] = [];
  while (mineCount > 0) {
    const maybeMine = { x: Math.floor(Math.random() * x), y: Math.floor(Math.random() * y) };
    if (!isArrIncludesCoord(noMineCoords, maybeMine) && !isArrIncludesCoord(mines, maybeMine)) {
      mines.push(maybeMine);
      mineCount -= 1;
    }
  }
  return mines;
};

const generateField = (x: number, y: number, mines: Coord[]): Field => {
  let acc: Field = [];
  for (let i = 1; i <= y; i += 1) {
    let _acc_: FieldCell[] = [];
    for (let j = 1; j <= x; j += 1) {
      const _coord_ = { x: j, y: i };
      if (mines.some((v) => isCoordEqual(_coord_, v))) {
        _acc_.push({ ..._coord_, mine: true });
      } else {
        _acc_.push({ ..._coord_, mine: false });
      }
    }
    acc.push(_acc_);
  }
  return acc;
};

export const generate = (
  x: number = 10,
  y: number = 18,
  rate: number = RATES.normal,
  cleanCell: Coord = { x: 1, y: 1 },
): Field => {
  const mines = generateMines(x, y, rate, cleanCell);
  return generateField(x, y, mines);
};

export const around8Coords = ({ x, y }: Coord, xLength: number, yLength: number): Coord[] => {
  let acc: Coord[] = [];
  [x - 1, x, x + 1].forEach((x) => {
    [y - 1, y, y + 1].forEach((y) => {
      acc.push({ x, y });
    });
  });
  return acc.filter(({ x, y }) => x > 0 && xLength >= x && y > 0 && yLength >= y);
};

export const around4Coords = ({ x, y }: Coord, xLength: number, yLength: number): Coord[] =>
  [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter(({ x, y }) => x > 0 && xLength >= x && y > 0 && yLength >= y);
