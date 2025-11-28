import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top3ProductsChartComponent } from './top3-products-chart.component';

describe('Top3ProductsChartComponent', () => {
  let component: Top3ProductsChartComponent;
  let fixture: ComponentFixture<Top3ProductsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top3ProductsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Top3ProductsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
