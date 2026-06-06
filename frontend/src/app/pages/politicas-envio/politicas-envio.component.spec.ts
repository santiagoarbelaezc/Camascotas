import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticasEnvioComponent } from './politicas-envio.component';

describe('PoliticasEnvioComponent', () => {
  let component: PoliticasEnvioComponent;
  let fixture: ComponentFixture<PoliticasEnvioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticasEnvioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticasEnvioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
