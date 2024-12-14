import {
  Component,
  OnInit,
  Input,
  NgZone,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';

import { BalafonService } from '../../services/balafon.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatrixType, Pattern } from '../../model/model';
import { SongComponent } from '../../pages/song/song.component';
import { FormControl, AbstractControl } from '@angular/forms';
import { skipWhile, take } from 'rxjs/operators';
import { EnsembleService } from '../../services/ensemble.service';

import { Instrument } from '../../instrument/instrument';

import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import deepClone from 'deep-clone';

const barmap = {
  '-': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
};

type HistoryItem = { thisHistory: any; pattern: {} };
@UntilDestroy()
@Component({
  standalone: false,
  selector: 'balafon-app',
  templateUrl: './balafon.component.html',
  styleUrls: ['./balafon.component.scss'],
})
export class BalafonComponent implements OnInit {
  @Input() ensembleComponent: SongComponent;
  @Input() pattern: Pattern;
  @ViewChild('XXXX', { static: true }) cursorrow: ElementRef;
  @ViewChild('XXXXNEXT', { static: true }) cursorrowNext: ElementRef;
  @ViewChildren('ROWS') rowElements: QueryList<ElementRef>;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  history = [];

  // Stuff that is OK to restore from  deep clone.
  thisHistoryKeys = ['matrix'];
  patternHistoryKeys = [
    'nBars',
    'ticksPerBar',
    'startAt',
    'metaPattern',
    'instrument',
    'pan',
    'volume',
  ];

  contextMenuPosition = { x: '0px', y: '0px' };

  rowArray: ElementRef[];
  barLengths = [3, 4, 5, 6, 7, 8, 9, 10, 12, 16];
  nBars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  tooltip = [];
  ready = false;
  instCtrl = new FormControl();
  metaCtrl = new FormControl();
  muted = false;
  instrument: Instrument;
  rows = [];
  cols = [];
  colors = ['green', 'blue', 'red', '', 'gold'];
  background = ['', 'lightgrey'];
  showpopup = false;
  cursor: any;
  matrix: MatrixType;
  lastCursor: any;
  rowRef: any[];
  cursorNext: number;
  focus: boolean;
  contextRow: any;
  contextCol: any;
  dragging: boolean;
  dragArea: { row1: number; row2: number; col1: number; col2: number };
  dragSelection: boolean;
  areaBuffer: {};
  shiftRow = 0;
  shiftCol = 0;

  constructor(
    public balafonService: BalafonService,
    public ensembleService: EnsembleService,
    public ngZone: NgZone,
    public dialog: MatDialog
  ) {}

  pushHistory() {
    const item: HistoryItem = {
      thisHistory: {},
      pattern: {},
    };
    for (const key of this.thisHistoryKeys) {
      item.thisHistory[key] = deepClone(this[key]);
    }

    for (const key of this.patternHistoryKeys) {
      item.pattern[key] = deepClone(this.pattern[key]);
    }

    this.history.push(item);
  }

  popHistory() {
    if (this.history.length === 0) {
      return;
    }
    const item = this.history.pop();
    for (const key of this.thisHistoryKeys) {
      this[key] = item.thisHistory[key];
    }

    for (const key of this.patternHistoryKeys) {
      this.pattern[key] = item.pattern[key];
    }

    this.makeRowsAndCols();
  }

  resetContext() {
    console.log('resetContext');
    this.contextRow = null;
    this.contextCol = null;
    this.shiftCol = 0;
    this.shiftRow = 0;
  }

  copybar() {
    const bar = Math.floor(this.contextRow / this.pattern.ticksPerBar);

    this.ensembleComponent.setCopyBuffer({
      balafon: this,
      contextRow: this.contextRow,
      contextCol: this.contextCol,
      bar,
    });
  }

  inContextArea(row, col) {
    return this.inArea(row - this.shiftRow, col - this.shiftCol);
  }

  deletebar() {
    this.pushHistory();
    const bar = Math.floor(this.contextRow / this.pattern.ticksPerBar);
    const lastRow = (this.pattern.nBars - 1) * this.pattern.ticksPerBar;

    let row1 = this.pattern.ticksPerBar * bar;

    while (row1 < lastRow) {
      let row2 = this.pattern.ticksPerBar + row1;

      this.matrix[row1] = this.matrix[row2];
      delete this.matrix[row2];
      row1++;
    }
    this.pattern.nBars = this.pattern.nBars - 1;

    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  getRowOfBar(i: number, bar: any): any {
    const rowI = bar * this.pattern.ticksPerBar + i;
    const row = this.matrix[rowI];
    if (!row) return undefined;
    return JSON.parse(JSON.stringify(row));
  }

  private insertEmptyAfter(bar) {
    this.pushHistory();
    this.pattern.nBars = this.pattern.nBars + 1;
    const lastRow = this.pattern.nBars * this.pattern.ticksPerBar - 1;
    const firstRow = (bar + 1) * this.pattern.ticksPerBar;

    for (let i = lastRow; i >= firstRow; i--) {
      const row2 = i;
      const row1 = row2 - this.pattern.ticksPerBar;
      this.matrix[row2] = this.matrix[row1];
      delete this.matrix[row1];
    }
  }

  private pasteAt(bar) {
    const startRow = bar * this.pattern.ticksPerBar;

    for (let i = 0; i < this.pattern.ticksPerBar; i++) {
      const row = this.ensembleComponent.getPasteRow(i);
      this.matrix[i + startRow] = row;
    }
  }

  pasteover() {
    const bar = Math.floor(this.contextRow / this.pattern.ticksPerBar);
    this.pasteAt(bar);
    this.makeRowsAndCols();
  }

  insertafter(paste?) {
    const bar = Math.floor(this.contextRow / this.pattern.ticksPerBar) + 1;
    this.insertEmptyAfter(bar);

    if (paste) {
      this.pasteAt(bar);
    }
    this.makeRowsAndCols();
  }

  insertbefore(paste?) {
    const bar = Math.floor(this.contextRow / this.pattern.ticksPerBar);
    this.insertEmptyAfter(bar);
    if (paste) {
      this.pasteAt(bar);
    }
    this.makeRowsAndCols();
  }

  remove() {
    const newPatterns = this.ensembleService.ensemble.patterns.filter(
      (pattern) => pattern !== this.pattern
    );

    this.ensembleService.ensemble.patterns = newPatterns;
  }

  setBarlength(len) {
    this.pattern.ticksPerBar = len;
    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  setNBars(len) {
    this.pattern.nBars = len;
    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  setStartTick() {
    this.pattern.startAt = this.contextRow;
    this.ensembleService.ensemble.dirty = true;
  }

  async loadInstrument(val) {
    this.instrument = await this.balafonService.findInstrument(val);

    this.pattern.instrument = val;
    this.pattern.pan = this.pattern.pan || 0;
    this.pattern.volume = this.pattern.volume || 0.8;

    this.instrument.setPan(this.pattern.pan);
    this.instrument.setVolume(this.pattern.volume);
    this.makeRowsAndCols();
  }

  async ngOnInit() {
    this.balafonService.nudge();
    this.matrix = this.pattern.matrix;

    this.ensembleService.ticker$.pipe(untilDestroyed(this)).subscribe(() => {
      this.tick();
    });

    this.cursorrow.nativeElement.style.opacity = 0;

    await this.balafonService.ready$
      .pipe(
        skipWhile((yes) => !yes),
        take(1)
      )
      .toPromise();

    if (this.pattern.metaPattern)
      this.metaCtrl.setValue(this.pattern.metaPattern);

    if (!this.pattern.instrument) {
      this.pattern.instrument = 'balafon';
    }
    this.instCtrl.setValue(this.pattern.instrument);
    await this.loadInstrument(this.pattern.instrument);

    this.instCtrl.valueChanges.subscribe(async (val) => {
      this.ensembleComponent.dirty = true;
      await this.loadInstrument(val);
      this.ready = true;
    });

    this.metaCtrl.valueChanges.subscribe(async (val) => {
      console.log('metaCtrl', val);
      this.setMetaPattern(val);
      this.ensembleComponent.dirty = true;
    });

    this.setMetaPattern(this.pattern.metaPattern);

    this.ready = true;
  }

  setMetaPattern(val: string) {
    const max = this.pattern.nBars;
    let str = '';

    for (let i = 0; i < val.length; i++) {
      const c = val.charAt(i);
      const ii = barmap[c];
      if (!(ii > 0 && ii <= max)) {
        str += '1';
      } else {
        str += c;
      }
    }

    if (str !== val) {
      this.metaCtrl.setValue(str, { emitEvent: false });
    }

    this.pattern.metaPattern = str;

    if (str.length > 0) {
      this.cursorrowNext.nativeElement.style.opacity = 1;
    } else {
      this.cursorrowNext.nativeElement.style.opacity = 0;
    }
    console.log('setMetaPattern', str);
  }

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    if (!this.focus) return;
    console.log('key', event);

    if (event.metaKey) {
      if (event.code === 'KeyZ') {
        this.popHistory();
        event.stopPropagation();
      }
      return;
    }

    if (this._scrollAll(event)) return;
    this._scrollArea(event);
    console.log('key', event.code);
  }

  _scrollArea(event) {
    if (!this.dragArea) return;

    switch (event.code) {
      case 'ArrowUp':
        this.cutContextArea();
        this.contextRow--;
        break;
      case 'ArrowDown':
        this.cutContextArea();
        this.contextRow++;
        break;
      case 'ArrowLeft':
        this.cutContextArea();
        this.contextCol--;
        break;
      case 'ArrowRight':
        this.cutContextArea();
        this.contextCol++;
        break;
      default:
        return;
    }
    this.pushHistory();

    this.pasteArea();
  }

  _scrollAll(event) {
    let inc = 0;
    const newMatrix = {};
    if (event.code === 'KeyU') {
      inc = 1;
    }

    if (event.code === 'KeyD') {
      inc = -1;
    }

    if (!inc) return false;
    this.pushHistory();
    const n = this.pattern.nBars * this.pattern.ticksPerBar;
    for (let i = 0; i < n; i++) {
      newMatrix[i] = this.matrix[(i + inc + n) % n];
    }
    this.matrix = newMatrix;
    this.pattern.matrix = newMatrix;
    event.stopPropagation();
    this.ensembleComponent.dirty = true;
  }

  private makeRowsAndCols() {
    this.rows = [];

    for (let i = 0; i < this.pattern.nBars * this.pattern.ticksPerBar; i++) {
      this.rows[i] = i;
    }

    this.cols = [];
    this.tooltip = [];
    for (let i = 0; i < this.instrument.notes.length; i++) {
      this.cols[i] = i;
      this.tooltip[i] = this.instrument.notes[i];
    }
    setTimeout(() => {
      this.rowRef = this.rowElements
        .toArray()
        .map((x) => x.nativeElement.offsetTop);
      this.setHomeState();
    });
  }

  onRightClick(event, row, col) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';

    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
    event.preventDefault();
    this.contextRow = row;
    this.contextCol = col;
  }

  onDragStart(evt, row, col) {
    if (evt.button !== 0) return;
    console.log('dragstart', row, col, evt);
    this.dragging = true;
    this.dragArea = { row1: row, row2: row, col1: col, col2: col };
  }

  onDragEnd(evt, row, col) {
    this.dragArea.row2 = row;
    this.dragArea.col2 = col;
    console.log('dragend', row, col);
    this.dragging = false;
    this._copyArea();
  }

  onDrag(evt, row, col) {
    if (!this.dragging) return;

    this.dragArea.row2 = row;
    this.dragArea.col2 = col;
    if (row !== this.dragArea.row1 || col !== this.dragArea.col1) {
      this.dragSelection = true;
    }

    console.log('drag', row, col);
  }

  _copyArea() {
    this.areaBuffer = {};
    const areaBounds = this.getAreaBounds();

    for (let row = areaBounds.row1; row <= areaBounds.row2; row++) {
      const newRow = {};
      for (let col = areaBounds.col1; col <= areaBounds.col2; col++) {
        if (this.matrix[row] && this.matrix[row][col]) {
          newRow[col] = this.matrix[row][col];
        }
      }
      this.areaBuffer[row] = newRow;
    }
    this.contextRow = areaBounds.row1;
    this.contextCol = areaBounds.col1;
  }

  cutArea(bounds?: { row1: number; row2: number; col1: number; col2: number }) {
    this.pushHistory();
    const areaBounds = bounds || this.getAreaBounds();
    for (let row = areaBounds.row1; row <= areaBounds.row2; row++) {
      for (let col = areaBounds.col1; col <= areaBounds.col2; col++) {
        if (this.matrix[row] && this.matrix[row][col]) {
          delete this.matrix[row][col];
        }
      }
    }
    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  cutContextArea() {
    this.pushHistory();
    const areaBounds = this.getAreaBounds();
    const shiftRow = this.contextRow - areaBounds.row1;
    const shiftCol = this.contextCol - areaBounds.col1;

    for (let row = areaBounds.row1; row <= areaBounds.row2; row++) {
      const dstRow = row + shiftRow;
      if (
        dstRow < 0 ||
        dstRow >= this.pattern.nBars * this.pattern.ticksPerBar
      ) {
        continue;
      }

      for (let col = areaBounds.col1; col <= areaBounds.col2; col++) {
        const dstCol = col + shiftCol;
        if (dstCol < 0 || dstCol >= this.instrument.notes.length) {
          continue;
        }
        if (this.matrix[dstRow]) {
          delete this.matrix[dstRow][dstCol];
        }
      }
    }
    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  pasteArea(merge: boolean = false) {
    this.pushHistory();
    console.log('pasteArea', this.areaBuffer);
    console.log('context', this.contextRow, this.contextCol);
    const areaBounds = this.getAreaBounds();

    this.shiftRow = this.contextRow - areaBounds.row1;
    this.shiftCol = this.contextCol - areaBounds.col1;

    for (let row = areaBounds.row1; row <= areaBounds.row2; row++) {
      const dstRow = row + this.shiftRow;
      if (
        dstRow < 0 ||
        dstRow >= this.pattern.nBars * this.pattern.ticksPerBar
      ) {
        continue;
      }

      for (let col = areaBounds.col1; col <= areaBounds.col2; col++) {
        const dstCol = col + this.shiftCol;
        if (dstCol < 0 || dstCol >= this.instrument.notes.length) {
          continue;
        }

        if (this.areaBuffer[row] && this.areaBuffer[row][col]) {
          this.matrix[dstRow] = this.matrix[dstRow] || {};
          this.matrix[dstRow][dstCol] = this.areaBuffer[row][col];
        } else if (!merge) {
          if (this.matrix[dstRow]) {
            delete this.matrix[dstRow][dstCol];
          }
        }
      }
    }
    this.makeRowsAndCols();
    this.ensembleComponent.dirty = true;
  }

  inArea(row, col) {
    return (
      this.dragSelection &&
      row >= Math.min(this.dragArea.row1, this.dragArea.row2) &&
      row <= Math.max(this.dragArea.row1, this.dragArea.row2) &&
      col >= Math.min(this.dragArea.col1, this.dragArea.col2) &&
      col <= Math.max(this.dragArea.col1, this.dragArea.col2)
    );
  }

  getAreaBounds() {
    return {
      row1: Math.min(this.dragArea.row1, this.dragArea.row2),
      row2: Math.max(this.dragArea.row1, this.dragArea.row2),
      col1: Math.min(this.dragArea.col1, this.dragArea.col2),
      col2: Math.max(this.dragArea.col1, this.dragArea.col2),
    };
  }

  getBackground(row, col) {
    if (this.inArea(row - this.shiftRow, col - this.shiftCol)) {
      return 'pink';
    }

    if (!(this.matrix[row] && this.matrix[row][col])) {
      return '';
    }

    return this.background[this.matrix[row][col]];
  }

  toggle(evt, row, col): void {
    evt.stopPropagation(); // Stop the propagation of the click event

    this.ensembleComponent.dirty = true;
    if (this.matrix[row] && this.matrix[row][col]) {
      if (evt.shiftKey) {
        delete this.matrix[row][col];
        if (Object.keys(this.matrix[row]).length === 0) {
          delete this.matrix[row];
        }
      } else {
        this.matrix[row][col]++;
        if (this.matrix[row][col] === 3) {
          this.matrix[row][col] = 1;
        }
      }
    } else if (!evt.shiftKey) {
      if (this.matrix[row] === undefined) {
        this.matrix[row] = {};
      }
      this.matrix[row][col] = 1;

      this.playNote(col);
    }
  }

  volumeChange(evt) {
    this.pattern.volume = evt.value;
    this.instrument.setVolume(evt.value);
    this.ensembleComponent.dirty = true;
  }

  panChange(evt) {
    this.pattern.pan = evt.value;
    this.instrument.setPan(evt.value);
    this.ensembleComponent.dirty = true;
  }

  playNote(col) {
    if (!this.instrument) {
      return;
    }

    this.instrument.play(col);
  }

  private setHomeState() {
    this.cursor = undefined;
    this.cursorrow.nativeElement.style.opacity = 0;
    if (
      this.pattern.metaPattern &&
      this.pattern.metaPattern.length > 0 &&
      this.rowRef
    ) {
      this.cursorNext =
        (+this.pattern.metaPattern[0] - 1) * this.pattern.ticksPerBar;
      this.cursorrowNext.nativeElement.style.top =
        this.rowRef[this.cursorNext] + 1 + 'px';
      this.cursorrowNext.nativeElement.style.opacity = 1;
    } else {
      this.cursorrowNext.nativeElement.style.opacity = 0;
    }
    return;
  }

  private tick() {
    if (!this.ensembleService.playing) {
      this.setHomeState();
      return;
    }

    const count = Math.max(0, this.ensembleService.count);

    if (this.pattern.metaPattern && this.pattern.metaPattern.length > 0) {
      let metaCount = Math.floor(count / this.pattern.ticksPerBar);
      metaCount = metaCount % this.pattern.metaPattern.length;
      const nextMetaCount = (metaCount + 1) % this.pattern.metaPattern.length;

      const metaPattern = +this.pattern.metaPattern[metaCount] - 1;
      const nextMetaPattern = +this.pattern.metaPattern[nextMetaCount] - 1;

      this.cursor =
        metaPattern * this.pattern.ticksPerBar +
        (count % this.pattern.ticksPerBar);

      this.cursorNext = nextMetaPattern * this.pattern.ticksPerBar;
      this.cursorrowNext.nativeElement.style.top =
        this.rowRef[this.cursorNext] + 1 + 'px';
    } else {
      this.cursor = count % (this.pattern.nBars * this.pattern.ticksPerBar);
    }

    this.cursorrow.nativeElement.style.opacity = 1;
    this.cursorrow.nativeElement.style.top =
      this.rowRef[this.cursor] + 1 + 'px';

    if (count < this.pattern.startAt) return;
    if (
      this.ensembleService.count >= 0 &&
      !this.muted &&
      this.matrix[this.cursor]
    ) {
      for (const col of Object.keys(this.matrix[this.cursor])) {
        this.playNote(+col);
      }
    }
  }
}
