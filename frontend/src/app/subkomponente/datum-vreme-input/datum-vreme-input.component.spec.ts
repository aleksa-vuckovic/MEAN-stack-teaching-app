import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatumVremeInputComponent } from './datum-vreme-input.component';

describe('DatumVremeInputComponent', () => {
  let component: DatumVremeInputComponent;
  let fixture: ComponentFixture<DatumVremeInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatumVremeInputComponent]
    });
    fixture = TestBed.createComponent(DatumVremeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
