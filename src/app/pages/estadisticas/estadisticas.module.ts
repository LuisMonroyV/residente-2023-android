import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { EstadisticasPage } from './estadisticas.page';
import { EstadisticasPageRoutingModule } from './estadisticas-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    EstadisticasPageRoutingModule,
    NgxChartsModule,
  ],
  declarations: [EstadisticasPage]
})
export class EstadisticasPageModule {}
