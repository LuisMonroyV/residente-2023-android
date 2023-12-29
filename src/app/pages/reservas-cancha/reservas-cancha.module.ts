import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReservasCanchaPageRoutingModule } from './reservas-cancha-routing.module';
import { ReservasCanchaPage } from './reservas-cancha.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservasCanchaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ReservasCanchaPage]
})
export class ReservasCanchaPageModule {}
