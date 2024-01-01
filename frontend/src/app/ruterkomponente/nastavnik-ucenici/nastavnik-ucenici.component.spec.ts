import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NastavnikUceniciComponent } from './nastavnik-ucenici.component';

describe('NastavnikUceniciComponent', () => {
  let component: NastavnikUceniciComponent;
  let fixture: ComponentFixture<NastavnikUceniciComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NastavnikUceniciComponent]
    });
    fixture = TestBed.createComponent(NastavnikUceniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
