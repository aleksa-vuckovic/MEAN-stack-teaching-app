import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZvezdeComponent } from './zvezde.component';

describe('ZvezdeComponent', () => {
  let component: ZvezdeComponent;
  let fixture: ComponentFixture<ZvezdeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZvezdeComponent]
    });
    fixture = TestBed.createComponent(ZvezdeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
