import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UidService } from '../../services/uid.service';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { EnsembleService } from '../../services/ensemble.service';
import { Ensemble } from '../../model/model';
import { StorageService } from '../../services/storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  standalone: false,
  selector: 'balafon-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  displayedColumns = ['delete', 'title', 'owner', 'save', 'share'];
  data: Array<any>;
  prefix;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public uid: UidService,
    public ensembleService: EnsembleService,
    public storage: StorageService,
    public snack: MatSnackBar
  ) {}

  async ngOnInit() {
    this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
      const song = params['name'];
      if (song) {
        this.prefix = song;
      }
      this.rebuild();
    });
  }

  top() {
    this.prefix = undefined;
    this.rebuild();
  }

  async rebuild() {
    await this.ensembleService.ready$.toPromise();
    this.ensembleService.stop();
    this.data = [];
    // this.data = this.ensembleService.list;
    for (const item of this.ensembleService.list) {
      const title = item.title;
      if (this.prefix) {
        if (title.startsWith(this.prefix)) {
          this.data.push(item);
        }
      } else {
        const toks = title.split('/');
        if (toks.length > 1) {
          const folder = toks[0] + '/';
          if (this.data.indexOf(folder) === -1) {
            this.data = [folder].concat(this.data);
          }
        } else {
          this.data.push(item);
        }
      }
    }
  }

  addSong() {
    this.ensembleService.select(null);
    this.ensembleService.newEnsemble();
    this.router.navigateByUrl(`/song/`);
  }

  select(item: any) {
    if (typeof item !== 'string') {
      this.ensembleService.select(item);
      this.router.navigateByUrl(`/song/${this.ensembleService.ensemble.key}`);
    } else {
      this.prefix = item;
      this.router.navigateByUrl(
        `/folder/${encodeURIComponent(item.substr(0, item.length - 1))}`
      );
      this.rebuild();
    }
  }

  async deleteItem($event, ensemble: Ensemble) {
    $event.stopPropagation();
    await this.ensembleService.deleteItem(ensemble);
  }

  async saveItem($event, ensemble: Ensemble) {
    $event.stopPropagation();
    await this.ensembleService.saveItem(ensemble);
  }

  shareLink($event, ensemble: Ensemble) {
    $event.stopPropagation();
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = `https://balafonix.firebaseapp.com/song/${ensemble.key}`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.snack.open('Link has been copied to paste buffer', 'OK', {
      duration: 3000,
    });
  }
}
