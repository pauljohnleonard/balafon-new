import { Component } from '@angular/core';
import { IconService } from './services/icon.service';

@Component({
  standalone: false,
  selector: 'balafon-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public iconService: IconService) {}
}
