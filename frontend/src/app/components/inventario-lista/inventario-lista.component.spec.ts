import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioListaComponent } from './inventario-lista.component';

describe('InventarioListaComponent', () => {
  let component: InventarioListaComponent;
  let fixture: ComponentFixture<InventarioListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
