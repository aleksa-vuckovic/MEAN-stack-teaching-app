import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikZakazivanjeComponent } from './ucenik-zakazivanje.component';

describe('UcenikZakazivanjeComponent', () => {
  let component: UcenikZakazivanjeComponent;
  let fixture: ComponentFixture<UcenikZakazivanjeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikZakazivanjeComponent]
    });
    fixture = TestBed.createComponent(UcenikZakazivanjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
