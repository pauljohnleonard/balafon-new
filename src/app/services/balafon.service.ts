import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { balafon_notes, drum_notes, metro_notes } from '../notes';
import { BehaviorSubject } from 'rxjs';
import { skipWhile, take } from 'rxjs/operators';
import { InstrumentPrototype } from '../instrument/intrument-prototype';

@Injectable({
  providedIn: 'root',
})
export class BalafonService {
  audioContext: AudioContext;
  ready$ = new BehaviorSubject<boolean>(false);
  progress$ = new BehaviorSubject<{ total: number; progress: number }>(null);
  instList = [
    { name: 'balafon', notes: balafon_notes },
    { name: 'balafonX', notes: balafon_notes },
    { name: 'DRUMS', notes: drum_notes },
    { name: 'Metro', notes: metro_notes },
  ];
  instrumentPrototypes: InstrumentPrototype[] = [];
  cnt: number;
  n: number;

  constructor(public http: HttpClient) {
    this.audioContext = new AudioContext();

    console.log(' START... ', this.audioContext.state);

    this.load();
  }

  async findInstrument(name: string) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    await this.ready$
      .pipe(
        skipWhile((yes) => !yes),
        take(1)
      )
      .toPromise();
    const instrumentPrototype = this.instrumentPrototypes.find((inst) => inst.name === name);
    return instrumentPrototype.create();
  }

  private async load() {
    this.n = 0;
    for (const inst of this.instList) {
      this.n += inst.notes.length;
    }

    this.cnt = 0;
    const promises = [];
    for (const inst of this.instList) {
      promises.push(this.loadInstrumentPrototype(inst));
    }

    await Promise.all(promises);
    this.progress$.next(null);
    this.ready$.next(true);
    this.nudge();
  }

  async loadInstrumentPrototype(inst) {
    const instrument = new InstrumentPrototype({
      audioContext: this.audioContext,
      name: inst.name,
      notes: inst.notes,
      http: this.http,
    });
    this.instrumentPrototypes.push(instrument);
    await instrument.load(() => {
      this.progress$.next({ total: this.n, progress: this.cnt });
      this.cnt++;
    });
  }
  public async nudge() {
    // console.log(' Nudge  . . . .');
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      // console.log(`  this.audioContext.state`);
    }
  }
}
