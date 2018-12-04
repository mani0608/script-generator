import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { HistoryResolver } from '@common/resolvers/history.resolver';
import { HasHistoryGuard } from './has-history.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'upload',
        loadChildren: '../upload/upload.module#UploadModule'
      },
      {
        path: 'history',
        loadChildren: '../history/history.module#HistoryModule',
        canActivate: [HasHistoryGuard],
        resolve: { history: HistoryResolver }
      },
      {
        path: 'about',
        loadChildren: '../about/about.module#AboutModule'
      },
      {
        path: 'help',
        loadChildren: '../help/help.module#HelpModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
