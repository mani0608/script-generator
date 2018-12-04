import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedService } from '@services/shared.service';
import { EllipsisPipe } from '../pipes/ellipsis.pipe';
import { HistoryResolver } from '../resolvers/history.resolver';
import { DualListComponent } from '@common/components/dual-list/dual-list.component';

import { MatButtonModule, MatCheckboxModule, MatTreeModule, MatExpansionModule, MatTooltipModule, MatCardModule, MatInputModule, MatFormFieldModule, MatIconModule, MatSnackBarModule, MatDialogModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule, MatMenuModule, MatProgressSpinnerModule } from '@angular/material';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { HttpClientModule } from '@angular/common/http';
import { MessageHandlerComponent } from '@common/components/message-handler/message-handler.component';
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    DualListComponent,
    MessageHandlerComponent,
    EllipsisPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTreeModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    QuillModule,
    MatProgressSpinnerModule
  ],
  exports: [
    DualListComponent,
    MessageHandlerComponent,
    EllipsisPipe,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTreeModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    DropzoneModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    QuillModule,
    MatProgressSpinnerModule
  ],
  entryComponents: [
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [SharedService, HistoryResolver]
    };
  }
}
