import React, { Component } from 'react';

// cores
import { generate, RATES, around8Coords, around4Coords } from '../core/mine';

// types
import { FieldCell, Coord, Field, MapCell, Map } from 'core/types';

// auxs
import { isCoordEqual, isArrIncludesCoord } from '../core/auxs';

interface State {
  string: string;
  opened: Coord[];
  field: Field;
}

interface AuxOpenCellParam {
  target: Coord;
  acc: Coord[];
  antiAcc: Coord[];
  field: Field;
  xLength: number;
  yLength: number;
}

// constructor에서 this.state: State = {}를 사용하려면 선언을 다음과 같은 형식으로 해 줘야 함:
// Component<any, State>
export default class Test extends Component<any> {
  state: State = { string: 'hello', opened: [], field: [] };

  isCellMine = ({ x, y }: Coord, field: Field) => field[y - 1][x - 1].mine;

  getMineCountByCoord = (coord: Coord, field: Field): number => {
    if (this.isCellMine(coord, field)) return 9;

    let acc = 0;
    const { xLength, yLength } = this.getXYLength(field);
    around8Coords(coord, xLength, yLength).forEach((coord) => {
      acc += this.isCellMine(coord, field) ? 1 : 0;
    });
    return acc;
  };

  auxOpenCellNarrow = (param: AuxOpenCellParam): AuxOpenCellParam => {
    const { target, acc, antiAcc, field } = param;
    const nextParam: AuxOpenCellParam = { ...param };
    if (isArrIncludesCoord(antiAcc, target) || isArrIncludesCoord(acc, target)) {
      return nextParam;
    }

    if (this.isCellMine(target, field) || this.getMineCountByCoord(target, field) > 0) {
      nextParam.antiAcc.push(target);
      return nextParam;
    }

    nextParam.acc.push(target);
    const nextCoords = around4Coords(param.target, param.xLength, param.yLength);
    return nextCoords.reduce((acc, nextCoord) => this.auxOpenCellNarrow({ ...acc, target: nextCoord }), nextParam);
  };

  auxOpenCellWide = (param: AuxOpenCellParam): AuxOpenCellParam => {
    if (isArrIncludesCoord(param.antiAcc, param.target) || isArrIncludesCoord(param.acc, param.target)) {
      return param;
    }

    const nextParam = this.auxOpenCellNarrow(param);

    const { xLength, yLength } = nextParam;
    const wideToOpen = nextParam.acc
      .map((coord) => around8Coords(coord, xLength, yLength))
      .flat()
      .reduce((acc: Coord[], c) => (!isArrIncludesCoord(acc, c) ? acc.concat(c) : acc), [])
      .filter((c) => !isArrIncludesCoord(param.acc, c));

    return this.auxOpenCellWide(
      wideToOpen.reduce((acc, nextCoord) => this.auxOpenCellNarrow({ ...acc, target: nextCoord }), nextParam),
    );
  };

  /**if getMineCountByCoord === 0 then open wide else only open clicked cell */
  openCell = (coord: Coord): void => {
    // if the cell's around mine count equals 0
    if (this.getMineCountByCoord(coord, this.state.field) !== 0) {
      this.concatToOpened(coord);
    }
    // else
    else {
      const { xLength, yLength } = this.getXYLength(this.state.field);
      const nextParam = this.auxOpenCellWide({
        target: coord,
        acc: [],
        antiAcc: this.state.opened,
        field: this.state.field,
        xLength,
        yLength,
      });

      this.concatToOpened(nextParam.acc);
    }
  };

  getXYLength = (arr: any[][]): { xLength: number; yLength: number } => ({
    xLength: arr[0].length,
    yLength: arr.length,
  });

  onClick = (coord: Coord): void => {
    // init
    if (this.state.field.length === 0) {
      const field = generate(10, 18, RATES.normal, coord);
      this.setState({ field }, () => {
        this.openCell(coord);
      });
    }
    // not init
    else {
      if (this.isCellMine(coord, this.state.field)) window.alert('Bang!');
      else this.openCell(coord);
    }
  };

  isOpened = (c: Coord): boolean => isArrIncludesCoord(this.state.opened, c);

  concatToOpened = (toConcat: Coord | Coord[], callback = () => {}) => {
    this.setState({ opened: this.state.opened.concat(toConcat) }, callback);
  };

  setOpened = (opened: Coord[], callback = () => {}) => {
    this.setState({ opened }, callback);
  };

  mineCountByCoord2DisplayString = (coord: Coord, field: Field): string => {
    const n = this.getMineCountByCoord(coord, field);
    return 9 > n ? String(n) : '*';
  };

  render() {
    return (
      <div>
        <div>
          <div>
            {this.state.field.length === 0
              ? Array(18)
                  .fill(null)
                  .map((n, y) => (
                    <div key={`temp-${y}`} style={{ display: 'flex' }}>
                      {Array(10)
                        .fill(null)
                        .map((n, x) => (
                          <div
                            onClick={() => this.onClick({ x: x + 1, y: y + 1 })}
                            style={{ width: '40px', height: '40px', backgroundColor: 'gray' }}
                            key={`${x}-${y}`}
                          >
                            N
                          </div>
                        ))}
                    </div>
                  ))
              : this.state.field.map((row, i) => (
                  <div key={`test-${i}`} style={{ display: 'flex' }}>
                    {row.map(({ x, y, mine }) => (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: 'gray',
                        }}
                        key={`${x}-${y}`}
                        onClick={() => this.onClick({ x, y })}
                      >
                        {this.isOpened({ x, y })
                          ? mine
                            ? 'M'
                            : this.mineCountByCoord2DisplayString({ x, y }, this.state.field)
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
}
