import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HistoryComponent } from './history.component';

const routes: Routes = [
  {
    path: '',
    component: HistoryComponent,
    children: [
      {
        path: 'result',
        loadChildren: '../result/result.module#ResultModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule { }
