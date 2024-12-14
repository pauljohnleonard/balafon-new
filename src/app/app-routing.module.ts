import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { SongComponent } from './pages/song/song.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'folder/:name',
    component: HomeComponent,
  },

  {
    path: 'song/:key',
    component: SongComponent,
  },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [
    // RouterModule.forRoot(routes, { enableTracing: true }),
    RouterModule.forRoot(routes),
  ],
  exports: [],
})
export class AppRoutingModule { }
