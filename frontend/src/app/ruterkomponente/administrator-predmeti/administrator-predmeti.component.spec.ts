import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorPredmetiComponent } from './administrator-predmeti.component';

describe('AdministratorPredmetiComponent', () => {
  let component: AdministratorPredmetiComponent;
  let fixture: ComponentFixture<AdministratorPredmetiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorPredmetiComponent]
    });
    fixture = TestBed.createComponent(AdministratorPredmetiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
