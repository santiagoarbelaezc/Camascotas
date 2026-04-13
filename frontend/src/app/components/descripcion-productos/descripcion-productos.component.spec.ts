import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionProductosComponent } from './descripcion-productos.component';

describe('DescripcionProductosComponent', () => {
  let component: DescripcionProductosComponent;
  let fixture: ComponentFixture<DescripcionProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionProductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
