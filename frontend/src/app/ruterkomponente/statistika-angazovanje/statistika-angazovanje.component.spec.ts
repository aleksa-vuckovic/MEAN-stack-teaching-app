import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistikaAngazovanjeComponent } from './statistika-angazovanje.component';

describe('StatistikaAngazovanjeComponent', () => {
  let component: StatistikaAngazovanjeComponent;
  let fixture: ComponentFixture<StatistikaAngazovanjeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatistikaAngazovanjeComponent]
    });
    fixture = TestBed.createComponent(StatistikaAngazovanjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
