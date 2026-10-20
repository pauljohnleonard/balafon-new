import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { UidService } from '../services/uid.service';
import { AuthService } from '../services/auth.service';
import { BalafonService } from '../services/balafon.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EnsembleService } from '../services/ensemble.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@UntilDestroy()
@Component({
  standalone: false,
  selector: 'balafon-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  user;
  calibrated = false;
  loading;
  progressPercent = 0;
  @Input() showBack;
  @Output() back = new EventEmitter();
  constructor(
    public router: Router,
    public uid: UidService,
    public auth: AuthService,
    public balafonService: BalafonService,
    public ensembleService: EnsembleService,
    private afAuth: AngularFireAuth
  ) {}

  async ngOnInit() {
    this.auth.user$.pipe(untilDestroyed(this)).subscribe((user) => {
      this.user = user;
    });

    this.balafonService.progress$
      .pipe(untilDestroyed(this))
      .subscribe((progress: any) => {
        if (progress) {
          this.progressPercent = (100.0 * progress.progress) / progress.total;
        }
      });
  }

  loginWithGoogle() {
    this.afAuth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        // Optionally handle result
      })
      .catch((error) => {
        // Optionally handle error
        console.error('Google login error:', error);
      });
  }
}
