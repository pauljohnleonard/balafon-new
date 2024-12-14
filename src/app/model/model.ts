import { DataRowOutlet } from '@angular/cdk/table';

export type MatrixType = { [row: number]: { [col: number]: number } };

export class Pattern {
  title: string;
  instrument: string;
  matrix: MatrixType;
  ticksPerBar: number;
  nBars: number;
  volume: number;
  pan: number;
  metaPattern: string;
  startAt;

  static create(): Pattern {
    return {
      title: 'Part',
      matrix: {},
      ticksPerBar: 16,
      nBars: 2,
      instrument: 'balafon',
      volume: 0.8,
      pan: 0.0,
      metaPattern: '',
      startAt: 0,
    };
  }
}

export class Ensemble {
  owner?: string;
  title: string;
  bpm: number;
  ticksPerBeat: number;
  patterns: Array<Pattern>;
  key: any;
  dirty: boolean;
  createAt: Date;
  updatedAt: Date;
  countIn: string;

  static create(key?: string): Ensemble {
    return {
      title: 'Song',
      key,
      bpm: 120,
      ticksPerBeat: 4,
      patterns: [Pattern.create()],
      dirty: true,
      createAt: new Date(),
      updatedAt: new Date(),
      countIn: 'X...X...X...X...',
    };
  }
}
