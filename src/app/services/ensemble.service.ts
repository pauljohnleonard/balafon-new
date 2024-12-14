import { Injectable, NgZone } from '@angular/core';
import { Ensemble } from '../model/model';
import { StorageService } from './storage.service';
import { UidService } from './uid.service';
import { BehaviorSubject, AsyncSubject, Subject } from 'rxjs';
import { BalafonService } from './balafon.service';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Instrument } from '../instrument/instrument';

const metroLookup = { X: 0, x: 1, '.': null, o: 2 };

@Injectable({
  providedIn: 'root',
})
export class EnsembleService {
  list: Ensemble[];
  ensemble: Ensemble;
  ticker$ = new BehaviorSubject<any>(null);
  playing: any;
  count = null;
  paused = false;
  tickNext = 0;
  ready$ = new AsyncSubject<boolean>();
  instrument: Instrument;

  //   subject: BehaviorSubject<TransportService>;

  constructor(
    public storage: StorageService,
    public uuid: UidService,
    public balafonService: BalafonService,
    public auth: AuthService,
    public snack: MatSnackBar,
    public ngZone: NgZone
  ) {
    this.reload();

    window.onbeforeunload = (event) => {
      //   alert(' Before leave');

      const unsaved = this.list.find((e) => e.dirty);
      if (!unsaved) {
        return null;
      }

      const message = 'Unsaved data!  Are you sure you want to lose this?';
      if (typeof event === 'undefined') {
        event = window.event;
      }
      if (event) {
        event.returnValue = message;
      }
      return message;
    };

    this.ticker$.subscribe((x) => {
      if (this.count < 0) {
        const pre = this.ensemble.countIn.length + this.count;
        const pulse = this.ensemble.countIn.charAt(pre);
        const note = metroLookup[pulse];

        if (note !== null && note !== undefined) {
          this.instrument.play(note);
        }
      }
    });
  }

  async reload() {
    // TODO check for unsaved
    this.list = await this.storage.list();
    this.ready$.next(true);
    this.ready$.complete();
    this.loadMetro();
  }

  touchList() {
    this.list = this.list.slice();
  }

  async loadEnsemble(key: any) {
    await this.ready$.toPromise();
    this.ensemble = this.list.find((e) => e.key === key);
    if (!this.ensemble) {
      this.snack.open(` Unable to find ensemble with key ${key}`);
    }
  }

  select(ensemble: Ensemble) {
    this.ensemble = ensemble;
    if (!this.ensemble) {
      return;
    }

    const exists = this.list.find((e) => e === ensemble);
    if (!exists) {
      this.list.push(ensemble);
      this.touchList();
    }
  }

  newEnsemble() {
    this.ensemble = Ensemble.create();
    this.ensemble.owner = this.auth.user.displayName;
    this.list.push(this.ensemble);
    this.touchList();
  }

  async deleteItem(element: Ensemble) {
    const ii = this.list.indexOf(element);

    element.title = `_/${element.title}`;
    await this.saveItem(element);
    this.touchList();
  }

  async saveItem(ensemble?: Ensemble) {
    ensemble = ensemble || this.ensemble;
    if (!ensemble.key) {
      ensemble.key = this.uuid.generatePushID();
    }
    const userId = this.auth.user.uid;
    ensemble.owner = this.auth.user.displayName;
    ensemble.dirty = false;
    ensemble.updatedAt = new Date();
    await this.storage.upload(ensemble, `${userId}/${ensemble.key}.json`);
  }

  stop() {
    this.playing = false;
  }

  play() {
    if (this.playing) {
      this.playing = false;
    } else {
      this.balafonService.nudge();
      this.playing = true;

      this.count = -(this.ensemble.countIn.length + 2);

      this.tickNext = this.balafonService.audioContext.currentTime;
      this.ngZone.runOutsideAngular(() => this.tick());
      //   this.tick();
    }
  }

  async loadMetro() {
    this.instrument = await this.balafonService.findInstrument('Metro');
    this.instrument.setPan(0);
    this.instrument.setVolume(0.8);
  }

  tick() {
    this.ticker$.next(this);

    this.count++;

    const now = this.balafonService.audioContext.currentTime;

    this.tickNext = this.tickNext + 60.0 / this.ensemble.bpm / this.ensemble.ticksPerBeat;

    const wait = 1000 * (this.tickNext - now);

    if (this.playing) {
      setTimeout(() => this.tick(), wait);
    }
  }
}
