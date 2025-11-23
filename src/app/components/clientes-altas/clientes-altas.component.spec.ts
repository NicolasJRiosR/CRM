import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientesAltasComponent } from './clientes-altas.component';

describe('ClientesAltasComponent', () => {
  let component: ClientesAltasComponent;
  let fixture: ComponentFixture<ClientesAltasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesAltasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesAltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
