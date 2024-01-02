import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorUcenikComponent } from './administrator-ucenik.component';

describe('AdministratorUcenikComponent', () => {
  let component: AdministratorUcenikComponent;
  let fixture: ComponentFixture<AdministratorUcenikComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorUcenikComponent]
    });
    fixture = TestBed.createComponent(AdministratorUcenikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
