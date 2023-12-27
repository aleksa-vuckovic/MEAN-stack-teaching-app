import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikNastavnikComponent } from './ucenik-nastavnik.component';

describe('UcenikNastavnikComponent', () => {
  let component: UcenikNastavnikComponent;
  let fixture: ComponentFixture<UcenikNastavnikComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikNastavnikComponent]
    });
    fixture = TestBed.createComponent(UcenikNastavnikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
