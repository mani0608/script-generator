import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../common/shared/shared.module';

import { HelpRoutingModule } from './help-routing.module';
import { HelpComponent } from './help.component';
import { HelpUmComponent } from './help-um/help-um.component';
import { HelpEsComponent } from './help-es/help-es.component';
import { HelpIeComponent } from './help-ie/help-ie.component';
import { HelpQbComponent } from './help-qb/help-qb.component';
import { HelpVuhComponent } from './help-vuh/help-vuh.component';

@NgModule({
  declarations: [
    HelpComponent,
    HelpUmComponent,
    HelpEsComponent,
    HelpIeComponent,
    HelpQbComponent,
    HelpVuhComponent
  ],
  imports: [
    CommonModule,
    HelpRoutingModule,
    SharedModule
  ]
})
export class HelpModule { }
