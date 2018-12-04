import { ModuleWithProviders } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { ResultsComponent } from "../results/results.component";
import { UploadComponent } from "./upload.component";
import { ReviewScriptsComponent } from "../results/review-scripts/review-scripts.component";

export const uploadRoutes: Routes = [
    {
        path: '',
        component: UploadComponent,
        children: [ 
            {
                path: 'results',
                component: ResultsComponent
            },
            {
                path: 'review',
                component: ReviewScriptsComponent
            }
        ]
    }];

export const uploadRouting: ModuleWithProviders = RouterModule.forRoot(uploadRoutes, { enableTracing: true, useHash: false });