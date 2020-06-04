export interface Coord {
  x: number;
  y: number;
}

export type CellState = 'covered' | 'uncovered' | 'flagged';

export interface Cell {
  x: number;
  y: number;
  hasMine: boolean;
  state: CellState;
}

export type Field = Cell[][];

export interface GeneratedField {
  field: Field;
  xSize: number;
  ySize: number;
  mineCoords: Coord[];
}
