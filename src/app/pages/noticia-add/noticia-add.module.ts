import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoticiaAddPageRoutingModule } from './noticia-add-routing.module';

import { NoticiaAddPage } from './noticia-add.page';
import { ComponentsModule } from '../../components/components.module';
import { QuillModule } from 'ngx-quill';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoticiaAddPageRoutingModule,
    ComponentsModule,
    QuillModule.forRoot({
      modules: {
        syntax: true,
        toolbar: [
            [{ size: [ 'small', false, 'large', 'huge' ]}],
            ['bold', 'italic', 'underline', 'link'],        // toggled buttons
            [{ header: 1 }, { header: 2 }],               // custom button values
            [{ list: 'ordered'}, { list: 'bullet' }],
            [{color: []}, {background: []}],          // dropdown with defaults from theme
            [{font: []}],
            [{align: []}],
          ],
      }
    }),
  ],
  declarations: [NoticiaAddPage]
})
export class NoticiaAddPageModule {}
