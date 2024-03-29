import { Coord, Cell, Field, GeneratedField } from 'core/types';
import { isCoordEqual, isArrayIncludesCoord, around8Coords } from './auxs';

/** Rates of mine */
export const RATES = { normal: 0.12, hard: 0.18, expert: 0.24 };

/** Generate mine coordinates without duplication */
const generateMineCoords = (x: number, y: number, rate: number, cleanCell: Coord): Coord[] => {
  const noMineCoords = [cleanCell, ...around8Coords(cleanCell, x, y)];
  let mineCount = Math.floor(x * y * rate);
  const mines: Coord[] = [];
  while (mineCount > 0) {
    const maybeMine = { x: Math.floor(Math.random() * x), y: Math.floor(Math.random() * y) };
    if (!isArrayIncludesCoord(noMineCoords, maybeMine) && !isArrayIncludesCoord(mines, maybeMine)) {
      mines.push(maybeMine);
      mineCount -= 1;
    }
  }
  return mines;
};

/** Generate clean field of size X and Y */
const generateCleanField = (xSize: number, ySize: number): Field => {
  const acc: Field = [];
  for (let i = 0; i < ySize; i += 1) {
    const accRow: Cell[] = [];
    for (let j = 0; j < xSize; j += 1) {
      const coord = { x: j, y: i };
      accRow.push({ ...coord, hasMine: false, state: 'uncovered' });
    }
    acc.push(accRow);
  }
  return acc;
};

/** Put mines in the field coordinates */
const putMinesUnderField = (coords: Coord[], field: Field): Field => {
  const acc = [...field];
  acc.forEach((cellRow, i) =>
    cellRow.forEach((cell, j) => {
      acc[i][j] = isArrayIncludesCoord(coords, cell) ? { ...cell, hasMine: true } : cell;
    }),
  );
  return acc;
};

/** Generate minesweeper game field */
export const generateField = (
  xSize = 10,
  ySize = 18,
  rate: number = RATES.normal,
  cleanCell: Coord = { x: 1, y: 1 },
): GeneratedField => {
  const mineCoords: Coord[] = generateMineCoords(xSize, ySize, rate, cleanCell);

  const field = generateCleanField(xSize, ySize);

  return { field: putMinesUnderField(mineCoords, field), mineCoords, xSize, ySize };
};
