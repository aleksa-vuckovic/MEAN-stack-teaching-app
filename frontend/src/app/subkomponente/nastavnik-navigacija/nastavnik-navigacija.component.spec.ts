import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NastavnikNavigacijaComponent } from './nastavnik-navigacija.component';

describe('NastavnikNavigacijaComponent', () => {
  let component: NastavnikNavigacijaComponent;
  let fixture: ComponentFixture<NastavnikNavigacijaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NastavnikNavigacijaComponent]
    });
    fixture = TestBed.createComponent(NastavnikNavigacijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
