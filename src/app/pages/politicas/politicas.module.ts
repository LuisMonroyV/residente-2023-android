import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { PoliticasPage } from './politicas.page';
import { PoliticasPageRoutingModule } from './politicas-routing.module';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoliticasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PoliticasPage]
})
export class PoliticasPageModule {}
