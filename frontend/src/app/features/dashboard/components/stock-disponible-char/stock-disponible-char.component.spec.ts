import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDisponibleCharComponent } from './stock-disponible-char.component';

describe('StockDisponibleCharComponent', () => {
  let component: StockDisponibleCharComponent;
  let fixture: ComponentFixture<StockDisponibleCharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDisponibleCharComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockDisponibleCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
