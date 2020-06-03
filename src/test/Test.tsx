import React, { useState, useCallback } from 'react';

// cores
import { generateField, RATES } from '../core/mine';

// types
import { Cell, Coord, Field } from 'core/types';

// auxs
import { isCoordEqual, isArrayIncludesCoord, getCellFromField, around8Coords, around4Coords } from '../core/auxs';

const getRenderingByMinesAdjecent = (coord: Coord, field: Field): string => {
  const n = getMinesAdjacentToCoord(coord, field);
  return 9 > n ? String(n) : '*';
};

const getMinesAdjacentToCoord = (coord: Coord, field: Field): number => {
  if (hasCellMine(coord, field)) return 9;

  let acc = 0;
  const { xSize, ySize } = getXYSize(field);
  around8Coords(coord, xSize, ySize).forEach((coord) => {
    acc += hasCellMine(coord, field) ? 1 : 0;
  });
  return acc;
};

const getXYSize = (twoDimensionalArray: any[][]): { xSize: number; ySize: number } => ({
  xSize: twoDimensionalArray[0].length,
  ySize: twoDimensionalArray.length,
});

const isUncovered = isArrayIncludesCoord;

const hasCellMine = ({ x, y }: Coord, field: Field) => field[y][x].hasMine;

const auxNarrowlyUncoverCells = (param: AuxOpenCellParam): AuxOpenCellParam => {
  const { coord: target, acc, antiAcc, field } = param;
  const nextParam: AuxOpenCellParam = { ...param };
  if (isArrayIncludesCoord(antiAcc, target) || isArrayIncludesCoord(acc, target)) {
    return nextParam;
  }

  if (hasCellMine(target, field) || getMinesAdjacentToCoord(target, field) > 0) {
    nextParam.antiAcc.push(target);
    return nextParam;
  }

  nextParam.acc.push(target);
  const nextCoords = around4Coords(param.coord, param.xSize, param.ySize);
  return nextCoords.reduce((acc, nextCoord) => auxNarrowlyUncoverCells({ ...acc, coord: nextCoord }), nextParam);
};

const auxWidelyUncoverCells = (param: AuxOpenCellParam): AuxOpenCellParam => {
  if (isArrayIncludesCoord(param.antiAcc, param.coord) || isArrayIncludesCoord(param.acc, param.coord)) {
    return param;
  }

  const nextParam = auxNarrowlyUncoverCells(param);

  const { xSize, ySize } = nextParam;
  const wideToOpen = nextParam.acc
    .map((coord: Coord) => around8Coords(coord, xSize, ySize))
    .flat()
    .reduce((acc: Coord[], c: Coord) => (!isArrayIncludesCoord(acc, c) ? acc.concat(c) : acc), [])
    .filter((c: Coord) => !isArrayIncludesCoord(param.acc, c));

  return auxWidelyUncoverCells(
    wideToOpen.reduce((acc, nextCoord) => auxNarrowlyUncoverCells({ ...acc, coord: nextCoord }), nextParam),
  );
};

interface AuxOpenCellParam {
  coord: Coord;
  acc: Coord[];
  antiAcc: Coord[];
  field: Field;
  xSize: number;
  ySize: number;
}

/** @todo type */
export default function Test() {
  /** @todo type */
  const [uncoveredCoords, setUncoveredCoords] = useState<Coord[]>([]);
  const [field, setField] = useState<Field>([]);
  const [isGameStarted, setBeGameStarted] = useState<boolean>(false);

  /**if getMineCountByCoord === 0 then open wide else only open clicked cell */
  const uncoverCell = useCallback(
    (coord: Coord, initialField?: Field): void => {
      const theField: Field = initialField || field;
      if (getMinesAdjacentToCoord(coord, theField) !== 0) {
        // There are no landmines adjacents the house.
        setUncoveredCoords((prev) => [...prev, coord]);
      } else {
        // else
        const { xSize, ySize } = getXYSize(theField);
        const nextParam = auxWidelyUncoverCells({
          coord,
          acc: [],
          antiAcc: uncoveredCoords,
          field: theField,
          xSize,
          ySize,
        });

        setUncoveredCoords((prev) => [...prev, ...nextParam.acc]);
      }
    },
    [getMinesAdjacentToCoord, auxWidelyUncoverCells, uncoveredCoords, field],
  );

  const handleClick = useCallback(
    (coord: Coord): void => {
      if (hasCellMine(coord, field)) {
        alert('Bang!');
        return;
      }

      uncoverCell(coord);
    },
    [field, hasCellMine, uncoverCell],
  );

  /** Initialise the game */
  const handleInitialClick = useCallback((coord: Coord) => {
    const field = generateField(10, 18, RATES.normal, coord);
    setField(() => field);
    uncoverCell(coord, field);
    setBeGameStarted(true);
  }, []);

  return (
    <div>
      <div>
        <div>
          {!isGameStarted
            ? Array.from(Array(18)).map((n, y) => (
                <div key={`temp-${y}`} style={{ display: 'flex' }}>
                  {Array.from(Array(10)).map((n, x) => (
                    <div
                      onClick={() => handleInitialClick({ x, y })}
                      style={{ width: '40px', height: '40px', backgroundColor: 'gray' }}
                      key={`${x}-${y}`}
                    >
                      N
                    </div>
                  ))}
                </div>
              ))
            : field.map((row, i) => (
                <div key={`test-${i}`} style={{ display: 'flex' }}>
                  {row.map(({ x, y, hasMine }) => (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'gray',
                      }}
                      key={`${x}-${y}`}
                      onClick={() => handleClick({ x, y })}
                    >
                      {isUncovered(uncoveredCoords, { x, y })
                        ? hasMine
                          ? 'M'
                          : getRenderingByMinesAdjecent({ x, y }, field)
                        : '?'}
                      {/* `(${this.mineCountByCoord2DisplayString({ x, y }, this.state.field)})`} */}
                    </div>
                  ))}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
