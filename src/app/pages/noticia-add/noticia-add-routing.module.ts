import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoticiaAddPage } from './noticia-add.page';

const routes: Routes = [
  {
    path: '',
    component: NoticiaAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoticiaAddPageRoutingModule {}
