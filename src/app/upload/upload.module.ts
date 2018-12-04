import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../common/shared/shared.module';

import { UploadRoutingModule } from './upload-routing.module';
import { UploadComponent } from './upload.component';
import { UploadService } from '../services/upload.service';

@NgModule({
  declarations: [UploadComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    SharedModule
  ],
  providers: [UploadService]
})
export class UploadModule { }
