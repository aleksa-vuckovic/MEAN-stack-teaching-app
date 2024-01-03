import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistikaBrojNastavnikaComponent } from './statistika-broj-nastavnika.component';

describe('StatistikaBrojNastavnikaComponent', () => {
  let component: StatistikaBrojNastavnikaComponent;
  let fixture: ComponentFixture<StatistikaBrojNastavnikaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatistikaBrojNastavnikaComponent]
    });
    fixture = TestBed.createComponent(StatistikaBrojNastavnikaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
