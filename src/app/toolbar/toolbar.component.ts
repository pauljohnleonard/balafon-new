import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { UidService } from '../services/uid.service';
import { AuthService } from '../services/auth.service';
import { BalafonService } from '../services/balafon.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EnsembleService } from '../services/ensemble.service';
import { Auth, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';

@UntilDestroy()
@Component({
  standalone: false,
  selector: 'balafon-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  user: User | null = null;
  avatarFailed = false;
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
    private firebaseAuth: Auth
  ) {}

  async ngOnInit() {
    this.auth.user$.pipe(untilDestroyed(this)).subscribe((user) => {
      this.user = user;
      this.avatarFailed = false;
    });

    this.balafonService.progress$
      .pipe(untilDestroyed(this))
      .subscribe((progress: any) => {
        if (progress) {
          this.progressPercent = (100.0 * progress.progress) / progress.total;
        }
      });
  }

  get avatarUrl(): string | null {
    if (!this.user) {
      return null;
    }
    return this.user.photoURL || this.user.providerData?.[0]?.photoURL || null;
  }

  loginWithGoogle() {
    signInWithPopup(this.firebaseAuth, new GoogleAuthProvider())
      .then(() => {
        // AuthService.user$ updates from the same Auth instance.
      })
      .catch((error) => {
        console.error('Google login error:', error);
      });
  }
}
