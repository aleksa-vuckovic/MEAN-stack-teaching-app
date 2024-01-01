import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NastavnikDosijeComponent } from './nastavnik-dosije.component';

describe('NastavnikDosijeComponent', () => {
  let component: NastavnikDosijeComponent;
  let fixture: ComponentFixture<NastavnikDosijeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NastavnikDosijeComponent]
    });
    fixture = TestBed.createComponent(NastavnikDosijeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
