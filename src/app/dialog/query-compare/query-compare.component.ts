import { Component, OnInit, Inject, ViewChildren, QueryList, AfterViewChecked } from '@angular/core';
import { AppService } from '@services/app.service';
import * as hljs from 'highlightjs';
import * as _ from 'lodash';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalData } from '@common/types/modal-data';
import { Doc } from '@common/types/doc';
import { QuillEditorComponent } from 'ngx-quill';
import { ComparisonRecord } from '@common/types/comparison-record';


@Component({
  selector: 'app-query-compare',
  templateUrl: './query-compare.component.html',
  styleUrls: ['./query-compare.component.scss']
})
export class QueryCompareComponent implements OnInit, AfterViewChecked {

  @ViewChildren('srceditor') srceditorChildren: QueryList<QuillEditorComponent>;

  @ViewChildren('tgteditor') tgteditorChildren: QueryList<QuillEditorComponent>;

  srcEditors: Array<QuillEditorComponent>;

  tgtEditors: Array<QuillEditorComponent>;

  targetDoc: Doc;

  versionCount: number;

  versions: Array<string>;

  targetVersion: string;

  sourceRecords: Array<any>;

  targetRecords: Array<any>;

  title: string;

  modules: any;

  formats: any;

  hasChanges: boolean;

  recordRange: number;

  recordStep: number;

  //src query, tgt query & query available flag
  records: Array<ComparisonRecord>;

  constructor(private _service: AppService,
    public dialogRef: MatDialogRef<QueryCompareComponent>,
    @Inject(MAT_DIALOG_DATA) public srcData: ModalData) { }

  ngOnInit() {
    this.versionCount = 0;
    this.hasChanges = false;
    this.title = this.srcData.title;
    this.sourceRecords = this.srcData.list;
    this.recordRange = 5;
    this.recordStep = 5;

    this.initQuillModule();

    hljs.configure({   // optionally configure hljs
      languages: ['javascript', 'ruby', 'python', 'sql']
    });

    hljs.initHighlightingOnLoad();

    this._service.getVersions(this.srcData.impName).then((response) => {
      this.versions = response;
      this.versionCount = this.versions.length;
      this.targetVersion = _.head(this.versions.filter((version: string) => version !== this.srcData.impVersion));
      this._service.getTargetDoc(this.srcData.impName, this.targetVersion, this.srcData.stName).then((response) => {
        this.targetDoc = response.docs[0];
        this.targetRecords = this.targetDoc.destTableQueries;
        this.prepareRecords();
      }).catch((error) => {
        console.log('Error while fetching target document for comparison');
      });
    });

  }

  fetchTarget(): void {
    this._service.getTargetDoc(this.srcData.impName, this.targetVersion, this.srcData.stName).then((response) => {
      this.targetDoc = response.docs[0];
      this.targetRecords = this.targetDoc.destTableQueries;
      this.prepareRecords();
    }).catch((error) => {
      console.log('Error while fetching target document for comparison');
    });
  }

  ngAfterViewChecked(): void {
    if (this.srceditorChildren) {
      this.srcEditors = this.srceditorChildren.toArray();
    }
    if (this.tgteditorChildren) {
      this.tgtEditors = this.tgteditorChildren.toArray();
    }
  }

  getFilterVersions(): Array<string> {
    return _.filter(this.versions, (version) => version !== this.srcData.impVersion);
  }

  initQuillModule(): void {
    this.formats = ['code-block'];
    this.modules = {
      formula: false,
      toolbar: false,
      syntax: true
    }
  }

  prepareRecords(): void {

    this.records = [];
    _.forEach(this.sourceRecords, (record, idx, records) => {
      let data: ComparisonRecord = new ComparisonRecord();
      this.getTgtQuery(record.destinationTable, data);
      data.dTable = record.destinationTable;
      data.srcQueryIndex = idx;
      data.srcQuery = this.convertNLToParagraph(record.destinationTableQuery);
      data.isSrcInitiated = false;
      data.isTgtInitiated = false;
      data.srcEditedText = "";
      data.tgtEditedText = "";
      this.records.push(data);
    })

  }

  getTgtQuery(dtName: any, data: ComparisonRecord): void {
    data.isTgtAvailable = false;
    _.forEach(this.targetRecords, (tgtRecord, idx, tgtRecords) => {
      if (tgtRecord.destinationTable === dtName) {
        if (tgtRecord.destinationTableQuery) {
          data.tgtQuery = this.convertNLToParagraph(tgtRecord.destinationTableQuery);
          data.tgtQueryIndex = idx;
          data.isTgtAvailable = true;
        }
      }
    });
  }

  convertNLToParagraph(text): string {
    let temp = '<p>' + text + '</p>';
    temp = _.replace(temp, /\r\n\r\n/g, "</p><p>");
    temp = _.replace(temp, /\n\n/g, "</p><p>");
    temp = _.replace(temp, /\r\n/g, "</p><p>");
    return _.replace(temp, /\n/g, "</p><p>");
  }

  onSourceEditorCreated(index: number): void { }

  onSourceContentChanged(event: any, index: number, record: ComparisonRecord): void {
    if (!record.isSrcInitiated) {
      let size = _.size(this.srcEditors[index].quillEditor.getText());
      this.srcEditors[index].quillEditor.formatLine(0, size, { 'code-block': true });
      record.isSrcInitiated = true;
    }
    record.srcEditedText = event.text;
  }

  onTargetEditorCreated(index: number): void { }

  onTargetContentChanged(event: any, index: number, record: ComparisonRecord): void {
    if (!record.isTgtInitiated) {
      let size = _.size(this.tgtEditors[index].quillEditor.getText());
      this.tgtEditors[index].quillEditor.formatLine(0, size, { 'code-block': true });
      record.isTgtInitiated = true;
    }
    record.tgtEditedText = event.text;
  }

  saveSingle(record: ComparisonRecord, index: number): void {
    this.hasChanges = true;

    record.persistedSrcQuery = record.srcQuery;
    record.persistedSrcText = record.srcEditedText;

    record.persistedTgtQuery = record.tgtQuery;
    record.persistedTgtText = record.tgtEditedText;
  }

  verifyAndUpdate() {

    _.forEach(this.records, (record) => {
      if (record.srcEditedText && _.size(_.trim(record.srcEditedText)) > 0) {
        if (!record.persistedSrcText || _.size(_.trim(record.persistedSrcText)) == 0 || record.persistedSrcText !== record.srcEditedText) {
          record.persistedSrcText = record.srcEditedText;
        }
      }
      if (record.tgtEditedText && _.size(_.trim(record.tgtEditedText)) > 0) {
        if (!record.persistedTgtText || _.size(_.trim(record.persistedTgtText)) == 0 || record.persistedTgtText !== record.tgtEditedText) {
          record.persistedTgtText = record.tgtEditedText;
        }
      }
    });

  }

  resetSingle(record: ComparisonRecord, index: number): void {
    if (record.persistedSrcQuery && record.persistedSrcQuery.trim().length > 0) {
      record.srcQuery = record.persistedSrcQuery
    } else {
      record.srcQuery = this.convertNLToParagraph(this.sourceRecords[index].destinationTableQuery);
    }

    if (record.persistedTgtQuery && record.persistedTgtQuery.trim().length > 0) {
      record.tgtQuery = record.persistedTgtQuery;
    } else {
      record.tgtQuery = this.convertNLToParagraph(this.targetRecords[index].destinationTableQuery);
    }
    record.srcEditedText = "";
    record.tgtEditedText = "";
    record.isSrcInitiated = false;
    record.isTgtInitiated = false;
  }

  saveAndClose(): void {

    if (!this.srcData.isMultiCompare) {
      this.saveSingle(this.records[0], 0);
    } else {
      this.verifyAndUpdate();
    }

    let filteredRecords = _.filter(this.records, (record: ComparisonRecord) => {
      return ((record.persistedSrcText && record.persistedSrcText.trim().length > 0) || (record.persistedTgtText && record.persistedTgtText.trim().length > 0));
    });

    _.forEach(filteredRecords, (record, idx, records) => {
      if (record.persistedSrcText && record.persistedSrcText.trim().length > 0) {
        this.sourceRecords[record.srcQueryIndex].destinationTableQuery = record.persistedSrcText;
      }
      if (record.persistedTgtText && record.persistedTgtText.trim().length > 0) {
        this.targetRecords[record.tgtQueryIndex].destinationTableQuery = record.persistedTgtText;
      }
    });

    this.dialogRef.close('saved');

    let response: ModalData = {
      tgtDoc: this.targetDoc,
      status: 'saved'
    };

    this.dialogRef.close(response);

  }

  close(): void {
    if (this.hasChanges) {
      this.saveAndClose();
    }

    let response: ModalData = {
      status: 'closed'
    }

    this.dialogRef.close(response);
  }

  showMore() {
    let newRange = this.recordRange + this.recordStep;
    if (newRange > this.sourceRecords.length) {
      newRange = this.sourceRecords.length;
    }
    this.recordRange = newRange;
  }

}
