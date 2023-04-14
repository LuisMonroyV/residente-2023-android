import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MisAvisosDePagoPage } from './mis-avisos-de-pago.page';
import { MisAvisosDePagoPageRoutingModule } from './mis-avisos-de-pago-routing.module';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    MisAvisosDePagoPageRoutingModule
  ],
  declarations: [MisAvisosDePagoPage]
})
export class MisAvisosDePagoPageModule {}
