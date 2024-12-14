import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalafonComponent } from './balafon.component';

describe('BalafonComponent', () => {
  let component: BalafonComponent;
  let fixture: ComponentFixture<BalafonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalafonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalafonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
