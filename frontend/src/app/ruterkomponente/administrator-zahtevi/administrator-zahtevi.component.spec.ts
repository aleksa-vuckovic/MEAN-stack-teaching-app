import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorZahteviComponent } from './administrator-zahtevi.component';

describe('AdministratorZahteviComponent', () => {
  let component: AdministratorZahteviComponent;
  let fixture: ComponentFixture<AdministratorZahteviComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorZahteviComponent]
    });
    fixture = TestBed.createComponent(AdministratorZahteviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
