import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisPagosPageRoutingModule } from './mis-pagos-routing.module';

import { MisPagosPage } from './mis-pagos.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisPagosPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [MisPagosPage]
})
export class MisPagosPageModule {}
