import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService } from '../services/app.service';
import { UploadService } from '../services/upload.service';
import { SharedService } from '@services/shared.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { shrink, uploadAnimation } from '../common/animations/animation';
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

type AOA = any[][];

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy {

  /* @HostBinding('@uploadAnimation') */
  isAnimateOnLoad: boolean = true;
  title: string = "Upload mapping document";
  path: string;
  file: File;
  jsonFile: any;
  subscriptions: Array<Subscription>;
  isQbReview: boolean;
  isHidden: boolean;
  importSchemaName: string;
  isUploaded: boolean;
  isAdded: boolean;


  public config: DropzoneConfigInterface = {
    url: 'http://localhost:3000/api/process',
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    autoProcessQueue: false,
    createImageThumbnails: true
  };

  @ViewChild(DropzoneComponent) componentRef: DropzoneComponent;

  constructor(private _service: AppService,
    private _uservice: UploadService,
    private _dsService: SharedService,
    private _router: Router,
    private _ar: ActivatedRoute) {}

  ngOnInit(): void {
    this.path = "Choose Mapping file path";
    if (!this.importSchemaName || this.importSchemaName.trim().length === 0) {
      this.importSchemaName = "";
    }

    this.subscriptions = [];
    this.subscriptions.push(this._uservice.configObservable.subscribe((value) => {
      this.jsonFile = value;
    }));

    this.isQbReview = false;
    this.isHidden = false;
    this.isUploaded = false;
    this.isAdded = false;
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      this.subscriptions.forEach((subs) => {
        if (subs) {
          subs.unsubscribe();
        }
      });
    }
  }

  onUploadError(error): void {
    this.isUploaded = true;
    console.log('Error during file upload ', error);
  }

  onUploadSuccess(response): void {
    console.log('File uploaded successfully ');
    this._dsService.store({
      reviewFlag: this.isQbReview,
      content: response[1].result
    });
    this._dsService.incrementHistoryCount();
    this.isUploaded = true;
    this.isAdded = false;
    if (this.isQbReview) {
      this._router.navigate(['result', { path: 'qbr' }], { relativeTo: this._ar, skipLocationChange: true });
    } else {
      this._router.navigate(['result', { path: 'qr' }], { relativeTo: this._ar, skipLocationChange: true });
    }
  }

  onFileAdded(file): void {
    this.file = file;
    this.isAdded = true;
    this.isUploaded = true;
  }

  onSendingFile(event): void {
    let formData: FormData = event[2];
    formData.append('jsonFile', new Blob([JSON.stringify(this.jsonFile)], { type: 'application/json' }));
    formData.append('isn', this.importSchemaName);
  }

  uploadFile(file): void {
    this._uservice.transform(this.file);
    setTimeout(() => { this.componentRef.directiveRef.dropzone().processQueue(); }, 1000);
  }

  qbFieldToggle(): void {
    if (this.isQbReview)
      this.config.url = "http://localhost:3000/api/processqb";
    else
      this.config.url = "http://localhost:3000/api/process";
  }

  removeFile(file): void {
    if (this.file) {
      this.componentRef.directiveRef.reset();
      this.file = null;
    }
    this.isUploaded = false;
    this.isAdded = false;
    this._router.navigateByUrl('/home/upload');
  }

  showHistory(): void {
    this._router.navigateByUrl('/history', { skipLocationChange: true });
  }

}
