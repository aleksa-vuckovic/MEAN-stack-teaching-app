import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsajtuComponent } from './osajtu.component';

describe('OsajtuComponent', () => {
  let component: OsajtuComponent;
  let fixture: ComponentFixture<OsajtuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OsajtuComponent]
    });
    fixture = TestBed.createComponent(OsajtuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
