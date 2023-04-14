import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisAvisosDePagoPage } from './mis-avisos-de-pago.page';

const routes: Routes = [
  {
    path: '',
    component: MisAvisosDePagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisAvisosDePagoPageRoutingModule {}
