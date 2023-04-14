import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { RegistroPage } from './registro.page';
import { RegistroPageRoutingModule } from './registro-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RegistroPage]
})
export class RegistroPageModule {}
