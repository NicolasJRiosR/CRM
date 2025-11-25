import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteraccionesListComponent } from './interacciones-list.component';

describe('InteraccionesListComponent', () => {
  let component: InteraccionesListComponent;
  let fixture: ComponentFixture<InteraccionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteraccionesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteraccionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
