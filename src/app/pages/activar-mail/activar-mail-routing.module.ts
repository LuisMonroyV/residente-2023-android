import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivarMailPage } from './activar-mail.page';

const routes: Routes = [
  {
    path: '',
    component: ActivarMailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivarMailPageRoutingModule {}
