import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorNastavnikComponent } from './administrator-nastavnik.component';

describe('AdministratorNastavnikComponent', () => {
  let component: AdministratorNastavnikComponent;
  let fixture: ComponentFixture<AdministratorNastavnikComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorNastavnikComponent]
    });
    fixture = TestBed.createComponent(AdministratorNastavnikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
