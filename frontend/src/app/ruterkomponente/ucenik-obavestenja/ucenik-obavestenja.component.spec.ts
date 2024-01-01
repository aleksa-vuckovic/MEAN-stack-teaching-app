import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikObavestenjaComponent } from './ucenik-obavestenja.component';

describe('UcenikObavestenjaComponent', () => {
  let component: UcenikObavestenjaComponent;
  let fixture: ComponentFixture<UcenikObavestenjaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikObavestenjaComponent]
    });
    fixture = TestBed.createComponent(UcenikObavestenjaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
