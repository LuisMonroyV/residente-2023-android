import { ActivarMailPage } from './activar-mail.page';
import { ActivarMailPageRoutingModule } from './activar-mail-routing.module';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';




@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    ActivarMailPageRoutingModule
  ],
  declarations: [ActivarMailPage]
})
export class ActivarMailPageModule {}
