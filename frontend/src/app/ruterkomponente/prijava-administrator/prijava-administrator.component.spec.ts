import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrijavaAdministratorComponent } from './prijava-administrator.component';

describe('PrijavaAdministratorComponent', () => {
  let component: PrijavaAdministratorComponent;
  let fixture: ComponentFixture<PrijavaAdministratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrijavaAdministratorComponent]
    });
    fixture = TestBed.createComponent(PrijavaAdministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
