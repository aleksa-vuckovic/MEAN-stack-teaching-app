import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorKorisniciComponent } from './administrator-korisnici.component';

describe('AdministratorKorisniciComponent', () => {
  let component: AdministratorKorisniciComponent;
  let fixture: ComponentFixture<AdministratorKorisniciComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministratorKorisniciComponent]
    });
    fixture = TestBed.createComponent(AdministratorKorisniciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
