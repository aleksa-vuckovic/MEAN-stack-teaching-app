import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistikaBrojCasovaComponent } from './statistika-broj-casova.component';

describe('StatistikaBrojCasovaComponent', () => {
  let component: StatistikaBrojCasovaComponent;
  let fixture: ComponentFixture<StatistikaBrojCasovaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatistikaBrojCasovaComponent]
    });
    fixture = TestBed.createComponent(StatistikaBrojCasovaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
