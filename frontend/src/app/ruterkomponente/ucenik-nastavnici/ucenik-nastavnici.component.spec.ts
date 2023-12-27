import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikNastavniciComponent } from './ucenik-nastavnici.component';

describe('UcenikNastavniciComponent', () => {
  let component: UcenikNastavniciComponent;
  let fixture: ComponentFixture<UcenikNastavniciComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikNastavniciComponent]
    });
    fixture = TestBed.createComponent(UcenikNastavniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
