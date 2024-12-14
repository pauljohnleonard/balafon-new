import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { Ensemble, Pattern } from '../../model/model';
import { FormControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { EnsembleService } from '../../services/ensemble.service';
import { BalafonComponent } from '../../components/balafon/balafon.component';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'balafon-ensemble',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.scss'],
})
export class SongComponent implements OnInit {
  @ViewChildren(BalafonComponent) balafons!: QueryList<BalafonComponent>;
  title = new FormControl();
  countIn = new FormControl();
  copyBuff: {
    balafon: BalafonComponent;
    contextRow: any;
    contextCol: any;
    bar: number;
  };
  //   ensemble: Ensemble;
  showBack;

  get dirty() {
    return this.ensemble.dirty;
  }

  set dirty(yes) {
    this.ensemble.dirty = yes;
  }

  constructor(
    public storage: StorageService,
    public ensembleService: EnsembleService,
    public auth: AuthService,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  setCopyBuffer(copyBuff: {
    balafon: BalafonComponent;
    contextRow: any;
    contextCol: any;
    bar: number;
  }) {
    this.copyBuff = copyBuff;
  }

  getPasteRow(i: number): any {
    if (!this.copyBuff) return undefined;
    return this.copyBuff.balafon.getRowOfBar(i, this.copyBuff.bar);
  }

  async ngOnInit() {
    console.log(' INIT   SONG ');

    const key = this.route.snapshot.params['key'];

    if (key) {
      await this.ensembleService.loadEnsemble(key);
    }

    if (!this.ensemble) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.title.setValue(this.ensemble.title);

    this.title.valueChanges.subscribe((val) => {
      this.ensemble.title = val;
      this.dirty = true;
    });

    if (!this.ensembleService.ensemble.countIn) {
      this.ensemble.countIn = 'X...X...X...X...';
    }

    this.countIn.setValue(this.ensemble.countIn);

    this.countIn.valueChanges.subscribe((val) => {
      this.ensemble.countIn = val;
      this.dirty = true;
    });

    const title = this.ensembleService.ensemble.title;
    this.showBack = title.indexOf('/') > 0;
  }

  clone() {
    const template = Object.assign(this.ensemble);
    template.item = undefined;

    const clone: Ensemble = JSON.parse(JSON.stringify(this.ensemble));
    delete clone.key;
    this.ensembleService.select(clone);

    this.title.setValue(this.ensemble.title + ' (copy)');

    this.dirty = true;
  }

  async saveItem() {
    await this.ensembleService.saveItem(this.ensemble);
    this.dirty = false;
  }

  goBack() {
    const title = this.ensembleService.ensemble.title;
    const toks = title.split('/');
    if (toks.length > 1) {
      const folder = toks[0];
      this.router.navigateByUrl(`/folder/${encodeURIComponent(folder)}`);
    } else {
      this.router.navigateByUrl(`/home`);
    }
  }
  addBalafon() {
    let clone: Pattern;
    if (this.ensemble.patterns[0]) {
      clone = JSON.parse(JSON.stringify(this.ensemble.patterns[0]));
    } else {
      clone = Pattern.create();
    }
    clone.matrix = {};
    this.ensemble.patterns.push(clone);
  }

  get ensemble() {
    return this.ensembleService.ensemble;
  }

  canSave() {
    return this.dirty && this.ensemble.owner === this.auth.user.displayName;
  }
}
