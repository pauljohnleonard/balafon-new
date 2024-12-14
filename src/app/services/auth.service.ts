import { inject, Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
import { Auth, User, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: User;
  canSave = false;
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);
  constructor(public router: Router) {
    this.user$.subscribe((fbuser) => {
      if (fbuser) {
        this.user = fbuser;
        // this.user$.next(this.user);
        // this.canSave = fbuser.uid === 'Eivcd69SrbVEMIJfyINiVvGqlfX2';
        this.canSave = true;
        // this.router.navigateByUrl('/home');
      } else {
        this.user = null;
        this.canSave = false;
        // this.user$.next(this.user);
        // this.router.navigateByUrl('/login');
      }
    });
  }

  //   signup(email: string, password: string) {
  //     this.firebaseAuth
  //       .createUserWithEmailAndPassword(email, password)
  //       .then(value => {
  //         console.log('Success!', value);
  //       })
  //       .catch(err => {
  //         console.log('Something went wrong:', err.message);
  //       });
  //   }

  //   async login() {
  //     const provider = new auth.GoogleAuthProvider();
  //     const credential = await this.firebaseAuth.signInWithPopup(provider);
  //     console.log(credential);
  //   }

  logout() {
    this.auth.signOut();
  }
}
