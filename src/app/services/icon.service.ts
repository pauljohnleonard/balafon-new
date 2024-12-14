import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(public iconRegistry: MatIconRegistry, public sanitizer: DomSanitizer) {
    this.registerIcons();
  }

  registerIcons() {
    const names = ['pan-horizontal'];

    names.forEach((name) => {
      this.iconRegistry.addSvgIcon(
        name,
        this.sanitizer.bypassSecurityTrustResourceUrl(`assets/svg/${name}.svg`)
      );
    });
  }
}
