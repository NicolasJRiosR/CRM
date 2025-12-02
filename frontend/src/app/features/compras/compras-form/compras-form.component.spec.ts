import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasFormComponent } from './compras-form.component';

describe('ComprasFormComponent', () => {
  let component: ComprasFormComponent;
  let fixture: ComponentFixture<ComprasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
