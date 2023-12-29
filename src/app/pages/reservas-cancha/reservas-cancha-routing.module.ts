import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReservasCanchaPage } from './reservas-cancha.page';

const routes: Routes = [
  {
    path: '',
    component: ReservasCanchaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservasCanchaPageRoutingModule {}
