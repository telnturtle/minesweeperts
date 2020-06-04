/** The coordiate of X and Y */
export interface Coord {
  x: number;
  y: number;
}

/** The state of a cell */
export type CellState = 'covered' | 'uncovered' | 'flagged';

/** The cell of field */
export interface Cell {
  x: number;
  y: number;
  hasMine: boolean;
  state: CellState;
}

/** The game field is a two dimentional Cell array */
export type Field = Cell[][];

/** The game field information */
export interface GeneratedField {
  field: Field;
  xSize: number;
  ySize: number;
  mineCoords: Coord[];
}

/** The game state */
export type GameState = 'ready' | 'sweeping' | 'exploded' | 'cleared';
