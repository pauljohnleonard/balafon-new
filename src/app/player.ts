// import { BalafonService } from './services/balafon.service';

// import { MatrixType, Pattern } from './model/model';

// import { skipWhile, take } from 'rxjs/operators';

// import { Instrument } from './instrument/instrument';
// import { BalafonComponent } from './components/balafon/balafon.component';

// const barmap = {
//   '-': 0,
//   '1': 1,
//   '2': 2,
//   '3': 3,
//   '4': 4,
//   '5': 5,
//   '6': 6,
//   '7': 7,
//   '8': 8,
//   '9': 9,
//   A: 10,
//   B: 11,
//   C: 12,
//   D: 13,
//   E: 14,
//   F: 15,
//   G: 16,
// };

// export class Player {
//   muted = false;

//   rows = [];
//   cols = [];

//   matrix: MatrixType;
//   lastCursor: any;
//   rowRef: any[];
//   cursorNext: number;

//   constructor(public balafon: BalafonComponent) {}

//   get pattern(): Pattern {
//     return this.balafon.pattern;
//   }

//   getInstrument(): Instrument {
//     return this.balafon.instrument;
//   }

//   get balafonService(): BalafonService {
//     return this.balafon.balafonService;
//   }

//   get ensembleService() {
//     return this.balafon.ensembleService;
//   }

//   play() {}

//   getRowOfBar(i: number, bar: any): any {
//     const rowI = bar * this.balafon.pattern.ticksPerBar + i;
//     const row = this.matrix[rowI];
//     if (!row) return undefined;
//     return JSON.parse(JSON.stringify(row));
//   }

//   async start() {
//     this.balafonService.nudge();
//     this.matrix = this.pattern.matrix;

//     this.ensembleService.ticker$.pipe(until(this)).subscribe(() => {
//       this.tick();
//     });

//     await this.balafonService.ready$
//       .pipe(
//         skipWhile((yes) => !yes),
//         take(1)
//       )
//       .toPromise();

//     this.metaCtrl.valueChanges.subscribe(async (val) => {
//       const max = this.pattern.nBars;
//       let str = '';

//       for (let i = 0; i < val.length; i++) {
//         const c = val.charAt(i);
//         const ii = barmap[c];
//         if (!(ii > 0 && ii <= max)) {
//           str += '1';
//         } else {
//           str += c;
//         }
//       }
//       if (str !== val) {
//         this.metaCtrl.setValue(str, { emitEvent: false });
//       }
//       this.pattern.metaPattern = str;

//       if (str.length > 0) {
//         this.cursorrowNext.nativeElement.style.opacity = 1;
//       } else {
//         this.cursorrowNext.nativeElement.style.opacity = 0;
//       }
//       this.ensembleComponent.dirty = true;
//     });

//     this.ready = true;
//   }

//   private makeRowsAndCols() {
//     this.rows = [];

//     for (let i = 0; i < this.pattern.nBars * this.pattern.ticksPerBar; i++) {
//       this.rows[i] = i;
//     }

//     this.cols = [];
//     this.tooltip = [];
//     for (let i = 0; i < this.instrument.notes.length; i++) {
//       this.cols[i] = i;
//       this.tooltip[i] = this.instrument.notes[i];
//     }
//     setTimeout(() => {
//       this.rowRef = this.rowElements.toArray().map((x) => x.nativeElement.offsetTop);
//       this.setHomeState();
//     });
//   }

//   volumeChange(evt) {
//     this.pattern.volume = evt.value;
//     this.instrument.setVolume(evt.value);
//     this.ensembleComponent.dirty = true;
//   }

//   panChange(evt) {
//     this.pattern.pan = evt.value;
//     this.instrument.setPan(evt.value);
//     this.ensembleComponent.dirty = true;
//   }

//   playNote(col) {
//     if (!this.instrument) {
//       return;
//     }

//     this.instrument.play(col);
//   }

//   private setHomeState() {
//     this.cursor = undefined;
//     this.cursorrow.nativeElement.style.opacity = 0;
//     if (this.pattern.metaPattern && this.pattern.metaPattern.length > 0 && this.rowRef) {
//       this.cursorNext = (+this.pattern.metaPattern[0] - 1) * this.pattern.ticksPerBar;
//       this.cursorrowNext.nativeElement.style.top = this.rowRef[this.cursorNext] + 1 + 'px';
//       this.cursorrowNext.nativeElement.style.opacity = 1;
//     } else {
//       this.cursorrowNext.nativeElement.style.opacity = 0;
//     }
//     return;
//   }

//   private tick() {
//     if (!this.ensembleService.playing) {
//       this.setHomeState();
//       return;
//     }

//     const count = Math.max(0, this.ensembleService.count);

//     if (this.pattern.metaPattern && this.pattern.metaPattern.length > 0) {
//       let metaCount = Math.floor(count / this.pattern.ticksPerBar);
//       metaCount = metaCount % this.pattern.metaPattern.length;
//       const nextMetaCount = (metaCount + 1) % this.pattern.metaPattern.length;

//       const metaPattern = +this.pattern.metaPattern[metaCount] - 1;
//       const nextMetaPattern = +this.pattern.metaPattern[nextMetaCount] - 1;

//       this.cursor = metaPattern * this.pattern.ticksPerBar + (count % this.pattern.ticksPerBar);

//       this.cursorNext = nextMetaPattern * this.pattern.ticksPerBar;
//       this.cursorrowNext.nativeElement.style.top = this.rowRef[this.cursorNext] + 1 + 'px';
//     } else {
//       this.cursor = count % (this.pattern.nBars * this.pattern.ticksPerBar);
//     }

//     this.cursorrow.nativeElement.style.opacity = 1;
//     this.cursorrow.nativeElement.style.top = this.rowRef[this.cursor] + 1 + 'px';

//     if (count < this.pattern.startAt) return;
//     if (this.ensembleService.count >= 0 && !this.muted && this.matrix[this.cursor]) {
//       for (const col of Object.keys(this.matrix[this.cursor])) {
//         this.playNote(+col);
//       }
//     }
//   }
// }
