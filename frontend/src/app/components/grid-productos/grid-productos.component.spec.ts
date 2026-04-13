import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridProductosComponent } from './grid-productos.component';

describe('GridProductosComponent', () => {
  let component: GridProductosComponent;
  let fixture: ComponentFixture<GridProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridProductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
