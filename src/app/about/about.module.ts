import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { DetailsComponent } from './details/details.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { SpecsComponent } from './specs/specs.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { NotesComponent } from './notes/notes.component';
import { PlansComponent } from './plans/plans.component';
import { CreditsComponent } from './credits/credits.component';
import { SharedModule } from '../common/shared/shared.module';

@NgModule({
  declarations: [AboutComponent, DetailsComponent, DisclaimerComponent, SpecsComponent, InstructionsComponent, NotesComponent, PlansComponent, CreditsComponent],
  imports: [
    CommonModule,
    AboutRoutingModule,
    SharedModule
  ]
})
export class AboutModule { }
