export interface Coord {
  x: number;
  y: number;
}

export interface FieldCell {
  x: number;
  y: number;
  mine: boolean;
}

export type Field = FieldCell[][];

export interface MapCell {
  x: number;
  y: number;
  opened: boolean;
}

export type Map = MapCell[][];
