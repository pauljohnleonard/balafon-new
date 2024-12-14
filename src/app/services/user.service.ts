import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import {
  AngularFireDatabase,
  AngularFireList
} from '@angular/fire/database/database';
import { AuthService } from './auth.service';
import { UserModel } from '../classes/model';
import { skipWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userListDB: AngularFireList<UserModel>;

  userList$ = new BehaviorSubject<UserModel[]>({} as UserModel[]);

  ready$ = new AsyncSubject<boolean>();
  ready = false;

  constructor(
    public database: AngularFireDatabase,

    public auth: AuthService
  ) {
    this.init();
  }

  async init() {
    this.userListDB = this.database.list<UserModel>('users');

    this.userListDB.valueChanges().subscribe(
      async x => {
        let userList;
        console.log(' Value changes');
        if (x === null || x.length === 0) {
          console.log(' No work users ');
          userList = [];
        } else {
          userList = x;
        }
        this.userList$.next(userList);
        if (!this.ready) {
          this.ready = true;
          this.ready$.next(true);
          this.ready$.complete();
        }
      },
      err => {
        console.log(err);
      }
    );
    await this.subscribeToAuthUser();
  }

  async waitReady() {
    return this.ready$.pipe(skipWhile(res => !res)).toPromise();
  }

  async subscribeToAuthUser() {
    await this.ready$.toPromise();

    this.auth.user$.subscribe(async user => {
      const userModel: UserModel = {
        uid: user.uid,
        name: user.displayName
      };

      await this.userListDB.set(userModel.uid, userModel);
    });
  }
}
