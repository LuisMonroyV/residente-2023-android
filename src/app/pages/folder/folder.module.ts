import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderPageRoutingModule } from './folder-routing.module';
import { FolderPage } from './folder.page';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    ComponentsModule,
    QuillModule.forRoot()
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
