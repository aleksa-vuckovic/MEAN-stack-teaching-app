import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistikaPolComponent } from './statistika-pol.component';

describe('StatistikaPolComponent', () => {
  let component: StatistikaPolComponent;
  let fixture: ComponentFixture<StatistikaPolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatistikaPolComponent]
    });
    fixture = TestBed.createComponent(StatistikaPolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
