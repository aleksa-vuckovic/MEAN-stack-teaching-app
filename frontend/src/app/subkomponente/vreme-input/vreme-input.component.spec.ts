import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VremeInputComponent } from './vreme-input.component';

describe('VremeInputComponent', () => {
  let component: VremeInputComponent;
  let fixture: ComponentFixture<VremeInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VremeInputComponent]
    });
    fixture = TestBed.createComponent(VremeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
