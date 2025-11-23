import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioAltasComponent } from './inventario-altas.component';

describe('InventarioAltasComponent', () => {
  let component: InventarioAltasComponent;
  let fixture: ComponentFixture<InventarioAltasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioAltasComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioAltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
