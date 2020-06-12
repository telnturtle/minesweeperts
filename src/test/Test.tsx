import React, { useState, useCallback, useEffect } from 'react';

// cores
import { generateField, RATES } from '../core/mine';

// types
import { Coord, Field, GameState } from 'core/types';

// auxs
import { isArrayIncludesCoord, around8Coords, around4Coords, arrayIndexOfCoord } from '../core/auxs';

const a = 12345;

const b = (
  <div
    className="12345"
    a
  />
);

/** Get rendering string the count of adjecent mines */
const getRenderingByMinesAdjecent = (coord: Coord, field: Field): string => {
  const n = getMinesAdjacentToCoord(coord, field);
  return n === 0 ? '' : 9 > n ? String(n) : '*';
};

/** Get the co unt of adjecent mines */
const getMinesAdjacentToCoord = (coord: Coord, field: Field): number => {
  if (hasCellMine(coord, field)) return 9;

  let acc = 0;
  const { xSize, ySize } = getXYSize(field);
  around8Coords(coord, xSize, ySize).forEach((coord) => {
    acc += hasCellMine(coord, field) ? 1 : 0;
  });
  return acc;
};

/** Get size X and Y of the field (or any two dimentioanl array) */
const getXYSize = (twoDimensionalArray: any[][]): { xSize: number; ySize: number } => ({
  xSize: twoDimensionalArray[0].length,
  ySize: twoDimensionalArray.length,
});

/** Get the cell of the coordinate is uncovered */
const getCoordIsUncovered = isArrayIncludesCoord;

/** Get the cell of the coordinate has a mine */
const hasCellMine = ({ x, y }: Coord, field: Field) => field[y][x].hasMine;

/** Search recursively to determine the area to uncover in the field (use 4 direction flood fill algorithm) */
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

/** Search recursively to determine the area to uncover in the field (use 8 direction flood fill algorithm) */
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

/** The parameter for auxiliary function that recursively searches */
interface AuxOpenCellParam {
  coord: Coord;
  acc: Coord[];
  antiAcc: Coord[];
  field: Field;
  xSize: number;
  ySize: number;
}

export default function Test(): JSX.Element {
  const [uncoveredCoords, setUncoveredCoords] = useState<Coord[]>([]);
  const [field, setField] = useState<Field>([]);
  const [mineCoords, setMineCoords] = useState<Coord[]>([]);
  const [flaggedCoords, setFlaggedCoords] = useState<Coord[]>([]);
  const [gameState, setGameState] = useState<GameState>('ready');

  /**if getMineCountByCoord === 0 then open wide else only open clicked cell */
  const uncoverCell = useCallback(
    (coord: Coord, initialField?: Field): void => {
      const theField: Field = initialField || field;
      let nextUncoveredCoords: Coord[];
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

  useEffect(() => {
    if (10 * 18 - uncoveredCoords.length - mineCoords.length === 0) setGameState('cleared');
  }, [uncoveredCoords, mineCoords]);

  const initializeGame = useCallback(() => {
    setUncoveredCoords([]);
    setField([]);
    setMineCoords([]);
    setFlaggedCoords([]);
    setGameState('ready');
  }, []);

  const handleClick = useCallback(
    (coord: Coord): void => {
      if (gameState === 'exploded') {
        if (!confirm('New game?')) return;
        initializeGame();
        return;
      }

      if (hasCellMine(coord, field)) {
        setGameState('exploded');
        setUncoveredCoords((prev) => [...prev, coord]);
        return;
      }

      uncoverCell(coord);
    },
    [field, hasCellMine, uncoverCell, gameState],
  );

  useEffect(() => {
    if (gameState === 'exploded') alert('Bang!');
  }, [gameState]);

  /** Generate and start the game */
  const handleInitialClick = useCallback((coord: Coord): void => {
    const { field, mineCoords, xSize, ySize } = generateField(10, 18, RATES.normal, coord);
    setField(field);
    setMineCoords(mineCoords);
    uncoverCell(coord, field);
    setGameState('sweeping');
  }, []);

  const handleRightClick = useCallback(
    (coord: Coord): void => {
      if (gameState === 'exploded') return;

      setFlaggedCoords((prev: Coord[]): Coord[] => {
        const index: number | null = arrayIndexOfCoord(prev, coord);
        return index ? prev.filter((_, idx) => idx !== index) : [...prev, coord];
      });
    },
    [field, gameState, setFlaggedCoords],
  );

  return (
    <div>
      <div>
        <p>
          {gameState === 'exploded' ? '💣💣' : gameState === 'cleared' ? '✨✨' : ''}
          <span className="red-indicator">{Math.max(mineCoords.length - flaggedCoords.length, 0)}</span>
          {gameState === 'exploded' ? '💣💣' : gameState === 'cleared' ? '✨✨' : ''}
        </p>
        <div>
          {gameState === 'ready'
            ? Array.from(Array(18)).map((n, y) => (
                <div key={`temp-${y}`} className="field-row">
                  {Array.from(Array(10)).map((n, x) => (
                    <div onClick={() => handleInitialClick({ x, y })} className="field-cell" key={`${x}-${y}`}></div>
                  ))}
                </div>
              ))
            : field.map((row, i) => (
                <div key={`test-${i}`} className="field-row">
                  {row.map(({ x, y, hasMine }) => {
                    const isUncovered = getCoordIsUncovered(uncoveredCoords, { x, y });
                    return (
                      <div
                        className={`field-cell ${isUncovered ? 'uncovered' : ''}`}
                        key={`${x}-${y}`}
                        onClick={() => handleClick({ x, y })}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleRightClick({ x, y });
                        }}
                      >
                        {isUncovered && (hasMine ? '💣' : getRenderingByMinesAdjecent({ x, y }, field))}
                        {!isUncovered && isArrayIncludesCoord(flaggedCoords, { x, y }) && '🚩'}
                      </div>
                    );
                  })}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
