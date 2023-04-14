import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AvisoPageRoutingModule } from './aviso-routing.module';

import { AvisoPage } from './aviso.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AvisoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AvisoPage]
})
export class AvisoPageModule {}
