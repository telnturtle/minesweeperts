import { Coord, Cell, Field } from 'core/types';

export const isCoordEqual = ({ x, y }: Coord, coord: Coord): boolean => x === coord.x && y === coord.y;

export const isArrayIncludesCoord = (arr: Coord[], coord: Coord) => arr.some((c) => isCoordEqual(c, coord));

export const arrayIndexOfCoord = (arr: Coord[], coord: Coord): number | null => {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (isCoordEqual(element, coord)) return index;
  }
  return null;
};

export const getCellFromField = (c: Coord, f: Field): Cell => f[c.y][c.x];

export const around8Coords = ({ x, y }: Coord, xSize: number, ySize: number): Coord[] => {
  let acc: Coord[] = [];
  [x - 1, x, x + 1].forEach((x) => {
    [y - 1, y, y + 1].forEach((y) => {
      acc.push({ x, y });
    });
  });
  return acc.filter(({ x, y }) => x >= 0 && xSize > x && y >= 0 && ySize > y);
};

export const around4Coords = ({ x, y }: Coord, xSize: number, ySize: number): Coord[] =>
  [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter(({ x, y }) => x >= 0 && xSize > x && y >= 0 && ySize > y);
