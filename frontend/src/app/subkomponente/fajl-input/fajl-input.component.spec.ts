import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FajlInputComponent } from './fajl-input.component';

describe('FajlInputComponent', () => {
  let component: FajlInputComponent;
  let fixture: ComponentFixture<FajlInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FajlInputComponent]
    });
    fixture = TestBed.createComponent(FajlInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
