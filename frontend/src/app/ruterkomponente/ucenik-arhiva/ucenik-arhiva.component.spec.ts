import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikArhivaComponent } from './ucenik-arhiva.component';

describe('UcenikArhivaComponent', () => {
  let component: UcenikArhivaComponent;
  let fixture: ComponentFixture<UcenikArhivaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikArhivaComponent]
    });
    fixture = TestBed.createComponent(UcenikArhivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
