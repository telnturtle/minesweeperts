import { Coord, Cell, Field } from 'core/types';

/** Check the two coordinates are same */
export const isCoordEqual = ({ x, y }: Coord, coord: Coord): boolean => x === coord.x && y === coord.y;

/** Check the array includes the coordinate */
export const isArrayIncludesCoord = (arr: Coord[], coord: Coord) => arr.some((c) => isCoordEqual(c, coord));

/** Get index of coordinate from the array */
export const arrayIndexOfCoord = (arr: Coord[], coord: Coord): number | null => {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (isCoordEqual(element, coord)) return index;
  }
  return null;
};

/** Get a cell from the field of the coordinate */
export const getCellFromField = (c: Coord, f: Field): Cell => f[c.y][c.x];

/** Get coordinates around the 8 direction of coordinate */
export const around8Coords = ({ x, y }: Coord, xSize: number, ySize: number): Coord[] => {
  const acc: Coord[] = [];
  [x - 1, x, x + 1].forEach((x) => {
    [y - 1, y, y + 1].forEach((y) => {
      acc.push({ x, y });
    });
  });
  return acc.filter(({ x, y }) => x >= 0 && xSize > x && y >= 0 && ySize > y);
};

/** Get coordinates around the 4 direction of coordinate */
export const around4Coords = ({ x, y }: Coord, xSize: number, ySize: number): Coord[] =>
  [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter(({ x, y }) => x >= 0 && xSize > x && y >= 0 && ySize > y);
