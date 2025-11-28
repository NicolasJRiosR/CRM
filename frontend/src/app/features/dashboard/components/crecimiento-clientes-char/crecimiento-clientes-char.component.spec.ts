import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrecimientoClientesCharComponent } from './crecimiento-clientes-char.component';

describe('CrecimientoClientesCharComponent', () => {
  let component: CrecimientoClientesCharComponent;
  let fixture: ComponentFixture<CrecimientoClientesCharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrecimientoClientesCharComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrecimientoClientesCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
