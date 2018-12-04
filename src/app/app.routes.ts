import { ModuleWithProviders } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { HistoryFilterComponent } from "./history/history-filter.component";
import { HistoryResolver } from "./resolvers/history.resolver";
import { uploadRoutes } from "./upload/upload.routes";
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/app',
        pathMatch: 'full'
    },
    {
        path: 'app',
        children: [...uploadRoutes]
    },
    {
        path: 'history',
        component: HistoryFilterComponent,
        resolve: { history: HistoryResolver }
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'help',
        component: HelpComponent
    },
    {
        path: '**',
        redirectTo: '/app',
        pathMatch: 'full'
    }];

export const appRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes, { enableTracing: true, useHash: false });