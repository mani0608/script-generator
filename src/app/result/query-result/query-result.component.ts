import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppService } from '@services/app.service';
import { ReviewQueryComponent } from '@dialog/review-query/review-query.component';
import * as _ from 'lodash';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { Doc } from '@common/types/doc';
import { SharedService } from '@services/shared.service';
import { ResultService } from '@services/result.service';
import { ModalData } from '@common/types/modal-data';
import { Subscription } from 'rxjs';
import { QueryCompareComponent } from '@dialog/query-compare/query-compare.component';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss']
})
export class QueryResultComponent implements OnInit, OnDestroy {

  public docs: Array<Doc>;
  docName: string;
  docVersion: string;
  subscriptions: Array<Subscription>;
  versionCount: number;

  reviewType: string;
  reviewSTIndex: number; //array index
  reviewITIndex: number; //queryIndex property of dtquery

  ompareType: string;
  compareSTIndex: number; //array index
  compareITIndex: number; //queryIndex property of dtquery

  constructor(private _service: AppService,
    private _rservice: ResultService,
    private _dsService: SharedService,
    public dialog: MatDialog,
    private _router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscriptions = [];

    this.subscriptions.push(this._dsService.data.subscribe((content) => {
      let storedData = content;
      if (storedData.data) {
        this.docs = storedData.data;
      } else {

        this.docName = storedData.content.name;
        this.docVersion = storedData.content.version;

        this._service.search(storedData.content.name, storedData.content.version).then((response) => {
          this.docs = response.docs;
        }).catch((error) => {
          console.log('error while retrieving docs ', error);
        });

        this._service.getVersionCount(this.docName).then((response) => {
          this.versionCount = response.count;
        });
      }
    }));
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

  //review single
  reviewSingleQuery(event) {

    const index = event.stIndex;
    const dtq = event.dtQuery;
    let queries: Array<any> = new Array();

    this.reviewType = 'IMPORT';
    this.reviewSTIndex = index;
    this.reviewITIndex = dtq.queryIndex;

    queries.push(dtq);
    let modalData: ModalData = {
      list: queries,
      title: 'Query for table: ' + dtq.destinationTable
    };
    this.showReviewDialog(modalData);
  }

  //review multiple
  reviewMultipleQueries(event) {

    const index = event.stIndex;
    const stq = this.docs[index];
    let queries: Array<any> = stq.destTableQueries;

    this.reviewType = 'SOURCE';
    this.reviewSTIndex = index;
    this.reviewITIndex = null;

    let modalData: ModalData = {
      list: queries,
      title: 'Query for table: ' + stq.sourceTable
    };
    this.showReviewDialog(modalData);
  }

  compareSingleQuery(event): void {

    const stIndex = event.stIndex;
    const stq = this.docs[stIndex];
    const dtq = event.dtQuery;
    let queries: Array<any> = new Array();

    this.reviewType = 'IMPORT';
    this.reviewSTIndex = stIndex;
    this.reviewITIndex = dtq.queryIndex;

    queries.push(dtq);
    let modalData: ModalData = {
      impName: this.docName,
      impVersion: this.docVersion,
      itName: dtq.destinationTable,
      stName: stq.sourceTable,
      index: dtq.queryIndex,
      list: queries,
      isMultiCompare: false,
      title: 'Compare: ' + dtq.destinationTable
    };
    this.showCompareDialog(modalData);
  }

  compareMultipleQueries(event) {

    let stIndex = event.stIndex;
    const stq = this.docs[stIndex];
    let queries: Array<any> = stq.destTableQueries;

    this.reviewType = 'SOURCE';
    this.reviewSTIndex = stIndex;
    this.reviewITIndex = null;

    let modalData: ModalData = {
      impName: this.docName,
      impVersion: this.docVersion,
      stName: stq.sourceTable,
      list: queries,
      isMultiCompare: true,
      title: 'Compare: ' + stq.sourceTable
    };
    this.showCompareDialog(modalData);
  }

  showReviewDialog(modalOptions: ModalData): void {
    const dialogRef = this.dialog.open(ReviewQueryComponent, {
      data: modalOptions
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result: ModalData) => {
      if (result && result.list.length > 0) {
        this.reviewSaved(result);
      }
    }));
  }

  showCompareDialog(modalOptions: ModalData): void {
    const dialogRef = this.dialog.open(QueryCompareComponent, {
      data: modalOptions
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe((result: ModalData) => {
      if (result.status === 'saved') {
        this.compareSaved(result);
      }
    }));
  }

  //Save & Close
  reviewSaved(event) {

    let dtQuery: any;
    let dtQueryIndex: number;
    let item: any = this.docs[this.reviewSTIndex];
    let list: Array<any> = event.list;

    if (this.reviewType === 'IMPORT') {
      dtQueryIndex = _.findIndex(item.destTableQueries, ['queryIndex', this.reviewITIndex]);
      dtQuery = item.destTableQueries[dtQueryIndex];
      dtQuery.destinationTableQuery = list[0].destinationTableQuery;
      //item.destTableQueries[dtQueryIndex] = dtQuery;
    } else if (this.reviewType === 'SOURCE') {
      item.destTableQueries = list;
    }

    let doc = {
      _id: item._id,
      _rev: item._rev,
      name: this.docName,
      version: this.docVersion,
      sourceTable: item.sourceTable,
      destTableQueries: item.destTableQueries
    };

    this._service.saveEdits(doc).then((res) => {
      console.log('Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving edits');
    });

  }

  compareSaved(event: ModalData) {

    let srcDoc: any = this.docs[this.reviewSTIndex];
    let tgtDoc: Doc = event.tgtDoc;

    this._service.saveEdits(srcDoc).then((res) => {
      console.log('Source Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving source edits');
    });

    this._service.saveEdits(tgtDoc).then((res) => {
      console.log('Target Edits saved successfully');
    }, (error) => {
      console.log('Error occured while saving target edits');
    });


  }

  exportExcel() {

    let records: Array<Array<any>> = new Array();
    let tableIndex: number = 0;
    let importSchema: string = '';

    records.push(['S.No.', 'Source Table', 'Destination Table', 'Destination Table Query']);

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          tableIndex = tableIndex + 1;
          records.push([tableIndex, item.sourceTable, dtQuery.destinationTable, dtQuery.destinationTableQuery]);
        });
      });

      this._rservice.exportAsExcel(records);

    });

  }

  exportSQLSingle() {
    let records: Array<any> = new Array();
    let tableIndex: number = 0;
    let importSchema: string = '';

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        if (!_.isNull(item.importSchema) && _.size(_.trim(item.importSchema)) > 0) {
          importSchema = item.importSchema + '.' + 'import.';
        }
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          let truncateQuery = 'BEGIN TRY TRUNCATE TABLE ' + importSchema + dtQuery.destinationTable + '\n\n';
          truncateQuery = truncateQuery + ' END TRY \n\n BEGIN CATCH \n\n';
          truncateQuery = truncateQuery + ' DELETE from ' + importSchema + dtQuery.destinationTable + '\n\n';
          records.push([truncateQuery]);
          records.push([dtQuery.destinationTableQuery + '\n\n']);
        });
      });

      this._rservice.exportAsTextFile(records);
    });
  }

  exportSQLMultiple() {

    let records: Array<any> = new Array();
    let tableIndex: number = 0;
    let prevDTName = null;
    let suffix = null;
    let importSchema: string = '';

    this._service.search(this.docName, this.docVersion).then((response) => {
      let result: Array<any> = response.docs;
      _.forEach(result, (item, stIndex, items) => {
        if (!_.isNull(item.importSchema) && _.size(_.trim(item.importSchema)) > 0) {
          importSchema = item.importSchema + '.' + 'import.';
        }
        _.forEach(item.destTableQueries, (dtQuery, dtIndex, dtQueries) => {
          suffix = '';

          if (_.isEqual(prevDTName, dtQuery.destinationTable)) {
            suffix = '' + _.toString(dtIndex);
          } else {
            prevDTName = dtQuery.destinationTable;
          }

          let truncateQuery = 'BEGIN TRY TRUNCATE TABLE ' + importSchema + dtQuery.destinationTable + '\n\n';
          truncateQuery = truncateQuery + ' END TRY \n\n BEGIN CATCH \n\n';
          truncateQuery = truncateQuery + ' DELETE from ' + importSchema + dtQuery.destinationTable + '\n\n';

          let record: any = {
            dtn: dtQuery.destinationTable,
            sfx: suffix,
            tq: truncateQuery,
            dtq: dtQuery.destinationTableQuery + '\n\n'
          }
          records.push(record);
        });
      });

      this._rservice.exportAsZipFile(records);
    });

  }

}
