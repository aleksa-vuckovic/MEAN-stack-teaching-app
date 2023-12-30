import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NastavnikProfilComponent } from './nastavnik-profil.component';

describe('NastavnikProfilComponent', () => {
  let component: NastavnikProfilComponent;
  let fixture: ComponentFixture<NastavnikProfilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NastavnikProfilComponent]
    });
    fixture = TestBed.createComponent(NastavnikProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
