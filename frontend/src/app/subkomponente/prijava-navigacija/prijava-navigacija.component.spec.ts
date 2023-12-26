import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrijavaNavigacijaComponent } from './prijava-navigacija.component';

describe('PrijavaNavigacijaComponent', () => {
  let component: PrijavaNavigacijaComponent;
  let fixture: ComponentFixture<PrijavaNavigacijaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrijavaNavigacijaComponent]
    });
    fixture = TestBed.createComponent(PrijavaNavigacijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
