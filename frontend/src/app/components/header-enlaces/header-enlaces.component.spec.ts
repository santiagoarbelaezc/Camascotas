import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderEnlacesComponent } from './header-enlaces.component';

describe('HeaderEnlacesComponent', () => {
  let component: HeaderEnlacesComponent;
  let fixture: ComponentFixture<HeaderEnlacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderEnlacesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderEnlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
