import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikNavigacijaComponent } from './ucenik-navigacija.component';

describe('UcenikNavigacijaComponent', () => {
  let component: UcenikNavigacijaComponent;
  let fixture: ComponentFixture<UcenikNavigacijaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikNavigacijaComponent]
    });
    fixture = TestBed.createComponent(UcenikNavigacijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
