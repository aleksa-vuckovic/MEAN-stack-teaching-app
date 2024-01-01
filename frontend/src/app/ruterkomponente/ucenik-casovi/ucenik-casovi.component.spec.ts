import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikCasoviComponent } from './ucenik-casovi.component';

describe('UcenikCasoviComponent', () => {
  let component: UcenikCasoviComponent;
  let fixture: ComponentFixture<UcenikCasoviComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikCasoviComponent]
    });
    fixture = TestBed.createComponent(UcenikCasoviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
