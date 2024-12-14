import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

// import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import// import { AngularFireStorageModule, BUCKET } from '@angular/fire/storage';
// import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';

import { AppRoutingModule } from './app-routing.module';
import { BalafonComponent } from './components/balafon/balafon.component';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HomeComponent } from './pages/home/home.component';
import { SongComponent } from './pages/song/song.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { TransportComponent } from './components/transport/transport.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { MatTableModule } from '@angular/material/table';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { MatInputModule } from '@angular/material/input';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    BalafonComponent,
    ToolbarComponent,
    HomeComponent,
    SongComponent,
    TransportComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatSliderModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    // MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatTableModule,
    MatToolbarModule,
    // MatTooltipModule,
    // MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    // MatSelectModule,
    MatListModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatDividerModule,

    // AngularFireModule.initializeApp(environment.firebaseConfig),
    // AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    // AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    // AngularFireStorageModule,
    // NgxAuthFirebaseUIModule.forRoot(environment.firebaseConfig, () => 'your_app_name_factory', {
    //   enableFirestoreSync: true, // enable/disable autosync users with firestore
    //   toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
    //   toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
    //   authGuardFallbackURL: '/login', // url for unauthenticated users - to use in combination with canActivate feature on a route
    //   authGuardLoggedInURL: '/home', // url for authenticated users - to use in combination with canActivate feature on a route
    //   passwordMaxLength: 60, // `min/max` input parameters in components should be within this range.
    //   passwordMinLength: 8, // Password length min/max in forms independently of each componenet min/max.
    //   // Same as password but for the name
    //   nameMaxLength: 50,
    //   nameMinLength: 2,
    //   // If set, sign-in/up form is not available until email has been verified.
    //   // Plus protected routes are still protected even though user is connected.
    //   guardProtectedRoutesUntilEmailIsVerified: true,
    //   enableEmailVerification: true, // default: true
    // }),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: environment.production,
    // }),
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),

    // { provide: BUCKET, useValue: environment.firebaseConfig.storageBucket },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
