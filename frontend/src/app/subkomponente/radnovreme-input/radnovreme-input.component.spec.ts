import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadnovremeInputComponent } from './radnovreme-input.component';

describe('RadnovremeInputComponent', () => {
  let component: RadnovremeInputComponent;
  let fixture: ComponentFixture<RadnovremeInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RadnovremeInputComponent]
    });
    fixture = TestBed.createComponent(RadnovremeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
