import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalAvisoDePagoComponent } from './modal-aviso-de-pago.component';

describe('ModalAvisoDePagoComponent', () => {
  let component: ModalAvisoDePagoComponent;
  let fixture: ComponentFixture<ModalAvisoDePagoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAvisoDePagoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAvisoDePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
