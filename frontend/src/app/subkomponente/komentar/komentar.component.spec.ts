import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KomentarComponent } from './komentar.component';

describe('KomentarComponent', () => {
  let component: KomentarComponent;
  let fixture: ComponentFixture<KomentarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KomentarComponent]
    });
    fixture = TestBed.createComponent(KomentarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
