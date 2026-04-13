import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PqrUsuarioComponent } from './pqr-usuario.component';

describe('PqrUsuarioComponent', () => {
  let component: PqrUsuarioComponent;
  let fixture: ComponentFixture<PqrUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PqrUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PqrUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
