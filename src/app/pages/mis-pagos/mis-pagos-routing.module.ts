import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisPagosPage } from './mis-pagos.page';

const routes: Routes = [
  {
    path: '',
    component: MisPagosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisPagosPageRoutingModule {}
