import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NastavnikZahteviComponent } from './nastavnik-zahtevi.component';

describe('NastavnikZahteviComponent', () => {
  let component: NastavnikZahteviComponent;
  let fixture: ComponentFixture<NastavnikZahteviComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NastavnikZahteviComponent]
    });
    fixture = TestBed.createComponent(NastavnikZahteviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
