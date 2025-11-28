import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsTableComponent } from './metrics-table.component';

describe('MetricsTableComponent', () => {
  let component: MetricsTableComponent;
  let fixture: ComponentFixture<MetricsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
