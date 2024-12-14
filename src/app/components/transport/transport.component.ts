import { Component, OnInit } from '@angular/core';
import { BalafonService } from '../../services/balafon.service';
import { BehaviorSubject } from 'rxjs';
import { Ensemble } from '../../model/model';
import { MatSliderChange } from '@angular/material/slider';
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

  metroChange(evt: MatSliderChange) {
    this.ensembleService.ensemble.bpm = evt.value;
  }
}
