import { Component, OnInit } from '@angular/core';
import { BalafonService } from '../../services/balafon.service';

import { EnsembleService } from '../../services/ensemble.service';

@Component({
  standalone: false,
  selector: 'balafon-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
})
export class TransportComponent implements OnInit {
  tickNext: number;

  constructor(
    public balafon: BalafonService,
    public ensembleService: EnsembleService
  ) {}

  ngOnInit(): void {}

  metroChange(evt) {
    this.ensembleService.ensemble.bpm = evt;
  }
}
