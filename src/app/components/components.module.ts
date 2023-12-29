import { AccesosComponent } from './accesos/accesos.component';
import { CommonModule } from '@angular/common';
import { EmergenciasComponent } from './emergencias/emergencias.component';
import { FechaPipe } from '../pipes/fecha.pipe';
import { FiltroUsuariosPipe } from '../pipes/filtro-usuarios.pipe';
import { FormsModule } from '@angular/forms';
import { GraficoAvisosComponent } from './grafico-avisos/grafico-avisos.component';
import { GraficoGuardiasComponent } from './grafico-guardias/grafico-guardias.component';
import { GraficoMisVisitasComponent } from './grafico-mis-visitas/grafico-mis-visitas.component';
import { GraficoTotalesComponent } from './grafico-totales/grafico-totales.component';
import { GraficoVisitasComponent } from './grafico-visitas/grafico-visitas.component';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { MesPipe } from '../pipes/mes.pipe';
import { ModalAvisoComponent } from './modal-aviso/modal-aviso.component';
import { ModalAvisoDePagoComponent } from './modal-aviso-de-pago/modal-aviso-de-pago.component';
import { ModalQrComponent } from './modal-qr/modal-qr.component';
import { ModalRechazoComponent } from './modal-rechazo/modal-rechazo.component';
import { ModalVersionAppComponent } from './modal-version-app/modal-version-app.component';
import { ModalVisitasComponent } from './modal-visitas/modal-visitas.component';
import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NoticiasComponent } from './noticias/noticias.component';
import { RondasComponent } from './rondas/rondas.component';
import { RouterModule } from '@angular/router';
import { VersionAppPipe } from '../pipes/version-app.pipe';
import { ReservasComponent } from './reservas/reservas.component';
import { ModalReservaComponent } from './modal-reserva/modal-reserva.component';


@NgModule({
  declarations: [
    AccesosComponent,
    EmergenciasComponent,
    FechaPipe,
    FiltroUsuariosPipe,
    GraficoAvisosComponent,
    GraficoGuardiasComponent,
    GraficoMisVisitasComponent,
    GraficoTotalesComponent,
    GraficoVisitasComponent,
    HeaderComponent,
    MesPipe,
    ModalAvisoComponent,
    ModalAvisoDePagoComponent,
    ModalQrComponent,
    ModalRechazoComponent,
    ModalReservaComponent,
    ModalVersionAppComponent,
    ModalVisitasComponent,
    NoticiasComponent,
    ReservasComponent,
    RondasComponent,
    VersionAppPipe,
  ],
  entryComponents: [
    ModalAvisoComponent,
    ModalAvisoDePagoComponent,
    ModalQrComponent,
    ModalRechazoComponent,
    ModalReservaComponent,
    ModalVersionAppComponent,
    ModalVisitasComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxChartsModule,
    RouterModule,
  ],
  exports: [
    AccesosComponent,
    EmergenciasComponent,
    FechaPipe,
    FiltroUsuariosPipe,
    GraficoAvisosComponent,
    GraficoGuardiasComponent,
    GraficoMisVisitasComponent,
    GraficoTotalesComponent,
    GraficoVisitasComponent,
    HeaderComponent,
    MesPipe,
    ModalAvisoComponent,
    ModalAvisoDePagoComponent,
    ModalQrComponent,
    ModalRechazoComponent,
    ModalReservaComponent,
    ModalVersionAppComponent,
    ModalVisitasComponent,
    NoticiasComponent,
    ReservasComponent,
    RondasComponent,
    VersionAppPipe,
  ]
})
export class ComponentsModule { }
