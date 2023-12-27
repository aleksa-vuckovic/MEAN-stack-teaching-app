import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcenikProfilComponent } from './ucenik-profil.component';

describe('UcenikProfilComponent', () => {
  let component: UcenikProfilComponent;
  let fixture: ComponentFixture<UcenikProfilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcenikProfilComponent]
    });
    fixture = TestBed.createComponent(UcenikProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
