import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorNavigacijaComponent } from './administrator-navigacija.component';

describe('AdministratorNavigacijaComponent', () => {
  let component: AdministratorNavigacijaComponent;
  let fixture: ComponentFixture<AdministratorNavigacijaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorNavigacijaComponent]
    });
    fixture = TestBed.createComponent(AdministratorNavigacijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
