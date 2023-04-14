import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisDatosPageRoutingModule } from './mis-datos-routing.module';

import { MisDatosPage } from './mis-datos.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisDatosPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MisDatosPage]
})
export class MisDatosPageModule {}
