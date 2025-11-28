import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoBurbujasCharComponent } from './grafico-burbujas-char.component';

describe('GraficoBurbujasCharComponent', () => {
  let component: GraficoBurbujasCharComponent;
  let fixture: ComponentFixture<GraficoBurbujasCharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoBurbujasCharComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoBurbujasCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
