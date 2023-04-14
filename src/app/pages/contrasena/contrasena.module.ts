import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { ContrasenaPage } from './contrasena.page';
import { ContrasenaPageRoutingModule } from './contrasena-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContrasenaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ContrasenaPage]
})
export class ContrasenaPageModule {}
